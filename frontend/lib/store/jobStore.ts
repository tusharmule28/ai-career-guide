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
  fetchJobs: () => Promise<void>;
  fetchMatchedJobs: (params?: Record<string, any>) => Promise<void>;
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

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/jobs');
      set({ jobs: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMatchedJobs: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      // Ensure we always have current applied jobs to filter if needed on client side 
      // although backend now handle it.
      const data = await api.post('/matching/match', params);
      set({ matchedJobs: data || [], loading: false });
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
