'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, Video, CheckCircle2, X, Plus, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { collection, addDoc, query, where, onSnapshot, Timestamp, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'
import { useCattleData } from '@/lib/hooks/useCattleData'

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

export default function SchedulePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { cattle } = useCattleData()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Get current date and time for defaults
  const now = new Date()
  const currentDate = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().slice(0, 5)
  
  const [formData, setFormData] = useState({
    date: currentDate,
    time: currentTime,
    duration: '30',
    reason: '',
    cattleId: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const q = query(
      collection(db, 'appointments'),
      where('farmerId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Appointment))
      
      appointmentData.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
      setAppointments(appointmentData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // Reset form with current time when opening modal
  const handleOpenModal = () => {
    const now = new Date()
    setFormData({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      duration: '30',
      reason: '',
      cattleId: ''
    })
    setShowNewAppointment(true)
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !formData.date || !formData.time || !formData.reason) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const scheduledDateTime = new Date(`${formData.date}T${formData.time}`)
      
      if (scheduledDateTime <= new Date()) {
        alert('Please select a future date and time')
        return
      }

      await addDoc(collection(db, 'appointments'), {
        farmerId: user.uid,
        farmerName: user.displayName || 'Farmer',
        farmerEmail: user.email,
        cattleId: formData.cattleId || null,
        cattleName: cattle.find(c => c.id === formData.cattleId)?.cattleId || null,
        scheduledDate: Timestamp.fromDate(scheduledDateTime),
        scheduledTime: formData.time,
        duration: parseInt(formData.duration),
        reason: formData.reason.trim(),
        status: 'pending',
        createdAt: Timestamp.now()
      })

      setShowNewAppointment(false)
      alert('✅ Appointment request sent! A veterinarian will confirm soon.')
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Failed to create appointment. Please try again.')
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Cancel this appointment?')) return

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled',
        cancelledBy: 'farmer',
        cancelledAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error cancelling:', error)
      alert('Failed to cancel appointment')
    }
  }

  const handleJoinCall = (appointment: Appointment) => {
    if (!appointment.roomUrl) {
      alert('Room not ready yet. Please wait for the veterinarian.')
      return
    }
    router.push(`/consultation?room=${encodeURIComponent(appointment.roomUrl)}`)
  }

  const canJoin = (appointment: Appointment) => {
    if (appointment.status !== 'confirmed' || !appointment.roomUrl) return false
    
    const now = new Date()
    const appointmentTime = new Date(appointment.scheduledDate)
    const timeDiff = appointmentTime.getTime() - now.getTime()
    const minutesDiff = Math.floor(timeDiff / 60000)
    
    return minutesDiff <= 10 && minutesDiff >= -60
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusMessage = (appointment: Appointment) => {
    if (appointment.status === 'pending') return 'Waiting for vet to accept'
    if (appointment.status === 'confirmed' && canJoin(appointment)) return 'Ready to join'
    if (appointment.status === 'confirmed') return 'Confirmed - join opens 10 min before'
    if (appointment.status === 'completed') return 'Completed'
    if (appointment.status === 'cancelled') return 'Cancelled'
    return ''
  }

  if (loading) {
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Appointments</h1>
              <p className="text-slate-400">Schedule consultations with veterinarians</p>
            </div>
            <Button 
              onClick={handleOpenModal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Appointments</h3>
                <p className="text-slate-400 mb-6">You haven't scheduled any consultations yet</p>
                <Button onClick={handleOpenModal} className="bg-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule First Appointment
                </Button>
              </Card>
            ) : (
              appointments.map((appointment) => (
                <Card key={appointment.id} className="bg-slate-800/50 border-slate-700 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                          {appointment.status}
                        </Badge>
                        {appointment.cattleName && (
                          <Badge variant="outline">{appointment.cattleName}</Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{appointment.reason}</h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {appointment.scheduledDate.toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.scheduledTime} ({appointment.duration} min)</span>
                        </div>
                      </div>

                      {appointment.vetName && (
                        <p className="text-slate-400 text-sm">
                          Doctor: <span className="text-white font-semibold">{appointment.vetName}</span>
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        {appointment.status === 'pending' && (
                          <Badge variant="secondary" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {getStatusMessage(appointment)}
                          </Badge>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {getStatusMessage(appointment)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {canJoin(appointment) && (
                        <Button 
                          onClick={() => handleJoinCall(appointment)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Join Call
                        </Button>
                      )}
                      
                      {appointment.status === 'pending' && (
                        <Button 
                          onClick={() => handleCancelAppointment(appointment.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      <AnimatePresence>
        {showNewAppointment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="bg-slate-800 border-slate-700 p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Schedule Appointment</h2>
                  <Button 
                    onClick={() => setShowNewAppointment(false)} 
                    variant="ghost" 
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleCreateAppointment} className="space-y-4">
                  {/* Cattle Selection */}
                  <div>
                    <Label htmlFor="cattle" className="text-slate-300">Cattle (Optional)</Label>
                    <select
                      id="cattle"
                      value={formData.cattleId}
                      onChange={(e) => setFormData({...formData, cattleId: e.target.value})}
                      className="w-full bg-slate-900 border-slate-700 text-white rounded-md p-2 mt-1"
                    >
                      <option value="">General Consultation</option>
                      {cattle.map((c) => (
                        <option key={c.id} value={c.id}>{c.cattleId} - {c.breed}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <Label htmlFor="date" className="text-slate-300">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-slate-900 border-slate-700 text-white mt-1"
                      required
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <Label htmlFor="time" className="text-slate-300">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="bg-slate-900 border-slate-700 text-white mt-1"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <Label htmlFor="duration" className="text-slate-300">Duration</Label>
                    <select
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full bg-slate-900 border-slate-700 text-white rounded-md p-2 mt-1"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>

                  {/* Reason */}
                  <div>
                    <Label htmlFor="reason" className="text-slate-300">Reason for Consultation *</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      placeholder="Describe the issue or reason for consultation..."
                      className="bg-slate-900 border-slate-700 text-white mt-1"
                      rows={3}
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                    disabled={!formData.reason.trim()}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Schedule Appointment
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
