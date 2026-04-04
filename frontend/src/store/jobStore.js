import { create } from 'zustand';
import { api } from '../utils/api';

const useJobStore = create((set, get) => ({
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
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMatchedJobs: async (resumeId = null) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/matching/match', { resume_id: resumeId });
      set({ matchedJobs: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchSavedJobs: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/jobs/saved');
      set({ savedJobs: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  saveJob: async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      // Update local state to reflect saved status if needed
      await get().fetchSavedJobs();
    } catch (err) {
      set({ error: err.message });
    }
  }
}));

export default useJobStore;
