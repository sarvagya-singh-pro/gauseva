'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, User, CheckCircle2, X, AlertCircle, Inbox, Activity, ChevronRight, LucideIcon } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/AppContext'

// --- TYPES ---
interface Appointment {
  id: string
  farmerId: string
  farmerName: string
  vetId?: string
  vetName?: string
  cattleId?: string
  cattleName?: string
  scheduledDate: Date
  scheduledTime: string
  duration: number
  reason: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  roomUrl?: string
  createdAt: Date
}

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  colorClass: string
}

interface FilterButtonProps {
  active: boolean
  label: string
  count: number
  onClick: () => void
  color?: string
}

// --- REUSABLE COMPONENTS ---

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, colorClass }) => (
  <div className="bg-stone-900 border border-stone-800 p-6 flex items-center justify-between group hover:border-stone-700 transition-all">
    <div>
      <p className="text-stone-500 text-xs font-mono uppercase tracking-wider mb-2">{label}</p>
      <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
    </div>
    <div className={`p-3 rounded-lg bg-stone-950 border border-stone-800 ${colorClass}`}>
      <Icon className="h-6 w-6" />
    </div>
  </div>
)

const FilterButton: React.FC<FilterButtonProps> = ({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative px-6 py-3 text-sm font-bold font-mono uppercase tracking-wider transition-all
      border-b-2 
      ${active 
        ? 'text-white border-amber-600 bg-stone-900/50' 
        : 'text-stone-500 border-transparent hover:text-stone-300 hover:bg-stone-900/30'
      }
    `}
  >
    {label}
    {count > 0 && (
      <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded text-stone-950 ${active ? 'bg-amber-600' : 'bg-stone-600'}`}>
        {count}
      </span>
    )}
  </button>
)

export default function VetDashboard() {
  const { user: authUser } = useAuth()
  const { user: storeUser } = useAppStore()
  const router = useRouter()
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([])
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<'pending' | 'my-appointments'>('pending')
  const [loading, setLoading] = useState(true)

  // --- AUTH CHECKS ---
  useEffect(() => {
    if (!authUser) { router.push('/auth/vet-login'); return }
    if (storeUser && storeUser.role !== 'vet' && storeUser.role !== 'doctor') {
      router.push('/dashboard'); return
    }
  }, [authUser, storeUser, router])

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!authUser) return

    // 1. Pending Requests (Global)
    const pendingQuery = query(collection(db, 'appointments'), where('status', '==', 'pending'))
    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Appointment[]
      setPendingAppointments(data.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime()))
    })

    // 2. My Assigned Appointments
    const myQuery = query(collection(db, 'appointments'), where('vetId', '==', authUser.uid))
    const unsubscribeMy = onSnapshot(myQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Appointment[]
      setMyAppointments(data.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime()))
      setLoading(false)
    })

    return () => { unsubscribePending(); unsubscribeMy() }
  }, [authUser])

  // --- ACTIONS ---
  const acceptAppointment = async (id: string) => {
    if (!authUser) return
    try {
      const res = await fetch('/api/create-room', { method: 'POST' })
      const { url } = await res.json()
      await updateDoc(doc(db, 'appointments', id), {
        status: 'confirmed',
        vetId: authUser.uid,
        vetName: authUser.displayName || 'Veterinarian',
        roomUrl: url,
        confirmedAt: new Date()
      })
    } catch (err) { console.error(err); alert('Failed to accept') }
  }

  const cancelAppointment = async (id: string) => {
    if (!confirm('Cancel appointment?')) return
    await updateDoc(doc(db, 'appointments', id), { status: 'cancelled', cancelledBy: 'vet', cancelledAt: new Date() })
  }

  const completeAppointment = async (id: string) => {
    if (!confirm('Mark completed?')) return
    await updateDoc(doc(db, 'appointments', id), { status: 'completed', completedAt: new Date() })
  }

  const joinAppointment = (apt: Appointment) => {
    if (apt.roomUrl) router.push(`/consultation?room=${encodeURIComponent(apt.roomUrl)}`)
  }

  const canJoin = (apt: Appointment) => {
    const now = new Date(); 
    const aptTime = new Date(apt.scheduledDate)
    const diff = Math.floor((aptTime.getTime() - now.getTime()) / 60000)
    return diff <= 10 && diff >= -60 && apt.status === 'confirmed'
  }

  // --- RENDER HELPERS ---
  const getStatusStyle = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-500 border-green-900/50 bg-green-950/20'
      case 'pending': return 'text-amber-500 border-amber-900/50 bg-amber-950/20'
      case 'completed': return 'text-blue-500 border-blue-900/50 bg-blue-950/20'
      case 'cancelled': return 'text-red-500 border-red-900/50 bg-red-950/20'
      default: return 'text-stone-500 border-stone-800 bg-stone-900'
    }
  }

  const displayedAppointments = filter === 'pending' ? pendingAppointments : myAppointments

  if (loading || !storeUser) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
       <div className="w-16 h-16 border-t-2 border-amber-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans selection:bg-amber-600/30">
      <Navbar />
      
      {/* Background Texture */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#292524_1px,transparent_1px),linear-gradient(to_bottom,#292524_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.05] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-stone-800 pb-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <span className="font-mono text-xs text-green-500 tracking-widest uppercase">UPLINK_ESTABLISHED</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                VETERINARY <span className="text-stone-700">CONSOLE</span>
              </h1>
           </div>
           <div className="text-right hidden md:block">
              <div className="text-stone-500 text-xs font-mono mb-1">LOGGED_IN_AS</div>
              <div className="text-white font-bold">{authUser?.displayName || 'DR. UNKNOWN'}</div>
           </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <StatCard 
            label="INCOMING_REQUESTS" 
            value={pendingAppointments.length} 
            icon={Inbox} 
            colorClass="text-amber-600 group-hover:text-amber-500" 
          />
          <StatCard 
            label="MY_CASELOAD" 
            value={myAppointments.length} 
            icon={CheckCircle2} 
            colorClass="text-green-600 group-hover:text-green-500" 
          />
          <StatCard 
            label="SCHEDULED_TODAY" 
            value={myAppointments.filter(a => new Date(a.scheduledDate).toDateString() === new Date().toDateString() && a.status === 'confirmed').length} 
            icon={Calendar} 
            colorClass="text-blue-600 group-hover:text-blue-500" 
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-stone-800 mb-8">
          <FilterButton 
             active={filter === 'pending'} 
             label="OPEN_REQUESTS" 
             count={pendingAppointments.length} 
             onClick={() => setFilter('pending')} 
          />
          <FilterButton 
             active={filter === 'my-appointments'} 
             label="MY_SCHEDULE" 
             count={myAppointments.length} 
             onClick={() => setFilter('my-appointments')} 
          />
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
             {displayedAppointments.length === 0 ? (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-20 text-center border border-dashed border-stone-800 bg-stone-900/20 rounded-xl">
                   <div className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Inbox className="w-8 h-8 text-stone-600" />
                   </div>
                   <h3 className="text-lg font-bold text-white mb-1">NO DATA FOUND</h3>
                   <p className="text-stone-500 font-mono text-xs">QUEUE IS CURRENTLY EMPTY</p>
                </motion.div>
             ) : (
                displayedAppointments.map((apt, i) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="bg-stone-900 border border-stone-800 hover:border-stone-600 transition-all p-6 relative group overflow-hidden rounded-lg">
                       <div className="flex flex-col md:flex-row gap-6 relative z-10">
                          
                          {/* Info Column */}
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-4">
                                <span className={`px-2 py-0.5 text-[10px] font-mono uppercase border rounded ${getStatusStyle(apt.status)}`}>
                                   {apt.status}
                                </span>
                                {apt.cattleName && (
                                   <span className="px-2 py-0.5 text-[10px] font-mono text-stone-400 border border-stone-700 rounded bg-stone-950">
                                      ID: {apt.cattleName}
                                   </span>
                                )}
                             </div>

                             <h3 className="text-xl font-bold text-white mb-2">{apt.reason}</h3>
                             
                             <div className="grid grid-cols-2 gap-4 text-sm mt-4 max-w-md">
                                <div className="flex items-center gap-2 text-stone-400">
                                   <User className="w-4 h-4 text-stone-600" />
                                   <span className="font-mono text-xs">{apt.farmerName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-400">
                                   <Calendar className="w-4 h-4 text-stone-600" />
                                   <span className="font-mono text-xs">{new Date(apt.scheduledDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-400">
                                   <Clock className="w-4 h-4 text-stone-600" />
                                   <span className="font-mono text-xs">{apt.scheduledTime} ({apt.duration}m)</span>
                                </div>
                             </div>
                          </div>

                          {/* Action Column */}
                          <div className="flex flex-col justify-center gap-3 md:w-64 border-t md:border-t-0 md:border-l border-stone-800 pt-4 md:pt-0 md:pl-6">
                             {filter === 'pending' && (
                                <button 
                                   onClick={() => acceptAppointment(apt.id)}
                                   className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                                >
                                   <CheckCircle2 className="w-4 h-4" /> ACCEPT_CASE
                                </button>
                             )}

                             {filter === 'my-appointments' && (
                                <>
                                   {canJoin(apt) ? (
                                      <button 
                                         onClick={() => joinAppointment(apt)}
                                         className="w-full py-3 bg-green-600 hover:bg-green-500 text-stone-950 font-bold text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 animate-pulse"
                                      >
                                         <Video className="w-4 h-4" /> JOIN_UPLINK
                                      </button>
                                   ) : apt.status === 'confirmed' ? (
                                      <div className="w-full py-3 bg-stone-800 border border-stone-700 text-stone-500 font-mono text-[10px] uppercase text-center flex items-center justify-center gap-2">
                                         <Clock className="w-3 h-3" /> AWAITING_WINDOW
                                      </div>
                                   ) : null}

                                   {apt.status === 'confirmed' && (
                                      <div className="flex gap-2">
                                         <button 
                                            onClick={() => completeAppointment(apt.id)}
                                            className="flex-1 py-2 bg-stone-950 border border-stone-800 hover:border-green-900 text-green-600 font-mono text-[10px] uppercase transition-colors"
                                         >
                                            RESOLVE
                                         </button>
                                         <button 
                                            onClick={() => cancelAppointment(apt.id)}
                                            className="flex-1 py-2 bg-stone-950 border border-stone-800 hover:border-red-900 text-red-600 font-mono text-[10px] uppercase transition-colors"
                                         >
                                            ABORT
                                         </button>
                                      </div>
                                   )}
                                </>
                             )}
                          </div>

                       </div>
                    </div>
                  </motion.div>
                ))
             )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
