'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { User, Cattle } from './types'

interface AppContextType {
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

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [selectedCattle, setSelectedCattle] = useState<Cattle | null>(null)
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle')
  const [notifications, setNotifications] = useState<string[]>([])

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message])
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const value: AppContextType = {
    user,
    selectedCattle,
    callStatus,
    notifications,
    setUser,
    setSelectedCattle,
    setCallStatus,
    addNotification,
    clearNotifications,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppStore must be used within AppProvider')
  }
  return context
}

// Export the context for debugging
export { AppContext }
