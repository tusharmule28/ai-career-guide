import { create } from 'zustand';
import { api } from '@/lib/api';
import { Application } from '@/types/job';

interface ApplicationStoreState {
  applications: Application[];
  loading: boolean;
  error: string | null;
  fetchApplications: () => Promise<void>;
  updateApplicationStatus: (id: number, status: string) => Promise<void>;
  updateApplicationNotes: (id: number, notes: string) => Promise<void>;
  deleteApplication: (id: number) => Promise<void>;
}

export const useApplicationStore = create<ApplicationStoreState>((set, get) => ({
  applications: [],
  loading: false,
  error: null,

  fetchApplications: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/applications');
      set({ applications: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateApplicationStatus: async (id: number, status: string) => {
    try {
      await api.patch(`/applications/${id}?status=${encodeURIComponent(status)}`);
      set(state => ({
        applications: state.applications.map(app => 
          app.id === id ? { ...app, status: status as any } : app
        )
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateApplicationNotes: async (id: number, notes: string) => {
    try {
      await api.patch(`/applications/${id}/notes`, { notes });
      set(state => ({
        applications: state.applications.map(app => 
          app.id === id ? { ...app, notes } : app
        )
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteApplication: async (id: number) => {
    try {
      await api.delete(`/applications/${id}`);
      set(state => ({
        applications: state.applications.filter(app => app.id !== id)
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  }
}));

export default useApplicationStore;
