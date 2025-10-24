import { create } from 'zustand'
import type { User, Cattle } from './types'

interface AppState {
  user: User | null
  selectedCattle: Cattle | null
  callStatus: 'idle' | 'connecting' | 'connected' | 'disconnected'
  notifications: string[]
  
  setUser: (user: User | null) => void
  setSelectedCattle: (cattle: Cattle | null) => void
  setCallStatus: (status: 'idle' | 'connecting' | 'connected' | 'disconnected') => void
  addNotification: (message: string) => void
  clearNotifications: () => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  selectedCattle: null,
  callStatus: 'idle',
  notifications: [],
  
  setUser: (user) => set({ user }),
  setSelectedCattle: (cattle) => set({ selectedCattle: cattle }),
  setCallStatus: (status) => set({ callStatus: status }),
  addNotification: (message) => 
    set((state) => ({ notifications: [...state.notifications, message] })),
  clearNotifications: () => set({ notifications: [] }),
}))
