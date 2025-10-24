'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, User, CheckCircle2, X, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/AppContext'

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

export default function VetDashboard() {
  const { user: authUser } = useAuth()
  const { user: storeUser } = useAppStore()
  const router = useRouter()
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([])
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<'pending' | 'my-appointments'>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authUser) {
      router.push('/auth/vet-login')
      return
    }

    if (storeUser && storeUser.role !== 'vet' && storeUser.role !== 'doctor') {
      console.log('User is not a vet, redirecting to farmer dashboard')
      router.push('/dashboard')
      return
    }
  }, [authUser, storeUser, router])

  useEffect(() => {
    if (!authUser) return

    const pendingQuery = query(
      collection(db, 'appointments'),
      where('status', '==', 'pending')
    )

    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const appointmentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Appointment))
      
      setPendingAppointments(appointmentData.sort((a, b) => 
        a.scheduledDate.getTime() - b.scheduledDate.getTime()
      ))
    })

    const myQuery = query(
      collection(db, 'appointments'),
      where('vetId', '==', authUser.uid)
    )

    const unsubscribeMy = onSnapshot(myQuery, (snapshot) => {
      const appointmentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Appointment))
      
      setMyAppointments(appointmentData.sort((a, b) => 
        a.scheduledDate.getTime() - b.scheduledDate.getTime()
      ))
      setLoading(false)
    })

    return () => {
      unsubscribePending()
      unsubscribeMy()
    }
  }, [authUser])

  const acceptAppointment = async (appointmentId: string) => {
    if (!authUser) return

    try {
      const response = await fetch('/api/create-room', { method: 'POST' })
      const { url } = await response.json()

      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'confirmed',
        vetId: authUser.uid,
        vetName: authUser.displayName || 'Veterinarian',
        roomUrl: url,
        confirmedAt: new Date()
      })

      alert('Appointment accepted! Farmer will be notified.')
    } catch (error) {
      console.error('Error accepting appointment:', error)
      alert('Failed to accept appointment')
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled',
        cancelledBy: 'vet',
        cancelledAt: new Date()
      })
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Failed to cancel appointment')
    }
  }

  const completeAppointment = async (appointmentId: string) => {
    if (!confirm('Mark this appointment as completed?')) return

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'completed',
        completedAt: new Date()
      })
    } catch (error) {
      console.error('Error completing appointment:', error)
      alert('Failed to complete appointment')
    }
  }

  const joinAppointment = (appointment: Appointment) => {
    if (appointment.roomUrl) {
      router.push(`/consultation?room=${encodeURIComponent(appointment.roomUrl)}`)
    }
  }

  const canJoin = (appointment: Appointment) => {
    const now = new Date()
    const appointmentTime = new Date(appointment.scheduledDate)
    const timeDiff = appointmentTime.getTime() - now.getTime()
    const minutesDiff = Math.floor(timeDiff / 60000)
    
    return minutesDiff <= 10 && minutesDiff >= -60 && appointment.status === 'confirmed'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500 text-white'
      case 'pending': return 'bg-yellow-500 text-white'
      case 'completed': return 'bg-blue-500 text-white'
      case 'cancelled': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const displayedAppointments = filter === 'pending' ? pendingAppointments : myAppointments

  if (loading || !storeUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Veterinarian Dashboard</h1>
            <p className="text-slate-400">Manage your appointments and consultations</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">New Requests</p>
                  <p className="text-3xl font-bold text-white">{pendingAppointments.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">My Appointments</p>
                  <p className="text-3xl font-bold text-white">{myAppointments.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Upcoming Today</p>
                  <p className="text-3xl font-bold text-white">
                    {myAppointments.filter(a => {
                      const today = new Date().toDateString()
                      return a.scheduledDate.toDateString() === today && a.status === 'confirmed'
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setFilter('pending')}
              variant={filter === 'pending' ? 'default' : 'outline'}
              className={filter === 'pending' 
                ? 'bg-blue-600 hover:bg-blue-700 text-black' 
                : 'border-slate-700 text-black hover:bg-slate-800'}
            >
              New Requests
              {pendingAppointments.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {pendingAppointments.length}
                </Badge>
              )}
            </Button>
            <Button
              onClick={() => setFilter('my-appointments')}
              variant={filter === 'my-appointments' ? 'default' : 'outline'}
              className={filter === 'my-appointments' 
                ? 'bg-blue-600 hover:bg-blue-700 text-black' 
                : 'border-slate-700 text-balck hover:bg-slate-800'}
            >
              My Appointments
              <Badge className="ml-2 bg-slate-700 text-white">
                {myAppointments.length}
              </Badge>
            </Button>
          </div>

          {/* Appointments Grid */}
          <div className="grid gap-4">
            {displayedAppointments.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {filter === 'pending' ? 'No New Requests' : 'No Appointments'}
                </h3>
                <p className="text-slate-400">
                  {filter === 'pending' 
                    ? 'No new appointment requests at the moment' 
                    : 'You have no scheduled appointments'}
                </p>
              </Card>
            ) : (
              displayedAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          {appointment.cattleName && (
                            <Badge variant="outline" className="border-slate-600 text-white">
                              Cattle: {appointment.cattleName}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">{appointment.reason}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                          <div className="flex items-center gap-2 text-slate-300">
                            <User className="h-4 w-4 text-slate-500" />
                            <span>Farmer: <strong className="text-white">{appointment.farmerName}</strong></span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span>
                              {appointment.scheduledDate.toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span>{appointment.scheduledTime} ({appointment.duration} min)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {filter === 'pending' && (
                          <Button 
                            onClick={() => acceptAppointment(appointment.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Accept & Assign to Me
                          </Button>
                        )}
                        
                        {filter === 'my-appointments' && canJoin(appointment) && (
                          <>
                            <Button 
                              onClick={() => joinAppointment(appointment)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Join Call
                            </Button>
                            <Button 
                              onClick={() => completeAppointment(appointment.id)}
                              variant="outline"
                              className="border-green-500 text-green-400 hover:bg-green-500/10"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark Complete
                            </Button>
                          </>
                        )}

                        {filter === 'my-appointments' && !canJoin(appointment) && appointment.status === 'confirmed' && (
                          <Badge variant="secondary" className="text-xs bg-slate-700 text-white">
                            <Clock className="mr-1 h-3 w-3" />
                            Join opens 10 min before
                          </Badge>
                        )}

                        {filter === 'my-appointments' && appointment.status === 'confirmed' && (
                          <Button 
                            onClick={() => cancelAppointment(appointment.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
