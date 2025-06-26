import { create } from 'zustand'

interface AppState {
  user: User | null
  theme: 'light' | 'dark'
  isLoading: boolean
  setUser: (user: User | null) => void
  setTheme: (theme: 'light' | 'dark') => void
  setLoading: (loading: boolean) => void
}

interface User {
  id: string
  name: string
  email: string
}

export const useStore = create<AppState>((set) => ({
  user: null,
  theme: 'light',
  isLoading: false,
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
  setLoading: (isLoading) => set({ isLoading })
}))