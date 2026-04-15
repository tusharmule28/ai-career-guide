import { create } from 'zustand';
import { api } from '@/lib/api';
import { Job, MatchResult } from '@/types/job';

interface JobStoreState {
  jobs: Job[];
  matchedJobs: MatchResult[];
  savedJobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  fetchMatchedJobs: (params?: Record<string, any>) => Promise<void>;
  fetchSavedJobs: () => Promise<void>;
  saveJob: (jobId: number) => Promise<void>;
}

export const useJobStore = create<JobStoreState>((set, get) => ({
  jobs: [],
  matchedJobs: [],
  savedJobs: [],
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
  }
}));

export default useJobStore;
