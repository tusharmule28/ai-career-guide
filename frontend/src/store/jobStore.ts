import { create } from 'zustand';
import { api } from '../utils/api';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  apply_url?: string;
  source?: string;
  posted_at?: string;
}

export interface MatchResult {
  job: Job;
  score: number;
  missing_skills?: string[];
  explanation?: string;
}

interface JobStoreState {
  jobs: Job[];
  matchedJobs: MatchResult[];
  savedJobs: any[]; // Or define a SavedJob interface
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
      set({ jobs: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMatchedJobs: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/matching/match', params);
      set({ matchedJobs: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchSavedJobs: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/jobs/saved');
      set({ savedJobs: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  saveJob: async (jobId: number) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      // Update local state to reflect saved status if needed
      await get().fetchSavedJobs();
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));

export default useJobStore;
