import { create } from 'zustand';
import { api } from '@/lib/api';
import { Job, MatchResult } from '@/types/job';

interface JobStoreState {
  jobs: Job[];
  matchedJobs: MatchResult[];
  savedJobs: Job[];
  appliedJobIds: number[];
  loading: boolean;
  error: string | null;
  fetchJobs: (params?: Record<string, any>, force?: boolean) => Promise<void>;
  fetchMatchedJobs: (params?: Record<string, any>, force?: boolean) => Promise<void>;
  fetchSavedJobs: () => Promise<void>;
  saveJob: (jobId: number) => Promise<void>;
  applyToJob: (jobId: number) => Promise<void>;
}

export const useJobStore = create<JobStoreState>((set, get) => ({
  jobs: [],
  matchedJobs: [],
  savedJobs: [],
  appliedJobIds: [],
  loading: false,
  error: null,
  
  // Cache state
  _cache: {
    jobs: { data: [], timestamp: 0 },
    matched: { data: [], timestamp: 0 }
  },

  fetchJobs: async (params = {}, force = false) => {
    const state = get() as any;
    const now = Date.now();
    const cacheKey = JSON.stringify(params);
    
    // Simple 2-minute cache for job list if no params changed and not forced
    if (!force && Object.keys(params).length === 0 && (now - state._cache.jobs.timestamp < 120000)) {
       if (state.jobs.length === 0 && state._cache.jobs.data.length > 0) {
         set({ jobs: state._cache.jobs.data });
       }
       return;
    }

    set({ loading: true, error: null });
    try {
      const data = await api.get('/jobs', params);
      
      if (Object.keys(params).length === 0) {
        set((s: any) => ({ 
          jobs: data || [], 
          loading: false,
          _cache: { ...s._cache, jobs: { data: data || [], timestamp: now } }
        }));
      } else {
        set({ jobs: data || [], loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMatchedJobs: async (params = {}, force = false) => {
    const state = get() as any;
    const now = Date.now();
    
    // 5-minute cache for matched jobs since they are computationally expensive
    if (!force && Object.keys(params).length === 0 && (now - state._cache.matched.timestamp < 300000)) {
       if (state.matchedJobs.length === 0 && state._cache.matched.data.length > 0) {
         set({ matchedJobs: state._cache.matched.data });
       }
       return;
    }

    set({ loading: true, error: null });
    try {
      const data = await api.post('/matching/match', params);
      
      if (Object.keys(params).length === 0) {
        set((s: any) => ({ 
          matchedJobs: data || [], 
          loading: false,
          _cache: { ...s._cache, matched: { data: data || [], timestamp: now } }
        }));
      } else {
        set({ matchedJobs: data || [], loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchSavedJobs: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/jobs/saved');
      set({ savedJobs: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  saveJob: async (jobId: number) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      await get().fetchSavedJobs();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  applyToJob: async (jobId: number) => {
    try {
      await api.post(`/applications/${jobId}`);
      set(state => ({
        appliedJobIds: [...state.appliedJobIds, jobId],
        // Optimistically remove from matched list
        matchedJobs: state.matchedJobs.filter(m => m.job?.id !== jobId)
      }));
      
      // If we dropped below a threshold, fetch more to maintain 20
      const currentMatched = get().matchedJobs;
      if (currentMatched.length < 15) {
        // Fetch fresh batch (backend already excludes applied ones)
        get().fetchMatchedJobs({ top_n: 20 });
      }
    } catch (err: any) {
      console.error("Apply failed:", err);
      throw err;
    }
  }
}));

export default useJobStore;
