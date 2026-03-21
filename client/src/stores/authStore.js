import { create } from 'zustand';

const useAuthStore = create((set) => ({
  session: null,
  user: null,
  loading: true,
  sidebarOpen: true,

  setSession: (session) => set({ session, loading: false }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  logout: () => set({ session: null, user: null }),
}));

export default useAuthStore;
