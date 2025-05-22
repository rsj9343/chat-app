import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  authUser: null,
  selectedUser: null,
  setAuthUser: (user) => set({ authUser: user }),
  setSelectedUser: (user) => set({ selectedUser: user }),
}))