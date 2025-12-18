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

    const q = query(collection(db, 'appointments'), where('farmerId', '==', user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentData = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
        scheduledDate: d.data().scheduledDate?.toDate() || new Date(),
        createdAt: d.data().createdAt?.toDate() || new Date()
      })) as Appointment[]

      appointmentData.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
      setAppointments(appointmentData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, router])

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
        cattleName: cattle.find((c) => c.id === formData.cattleId)?.cattleId || null,
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

  const statusPill = (status: Appointment['status']) => {
    const base = 'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium'
    switch (status) {
      case 'confirmed':
        return `${base} border-emerald-900/40 bg-emerald-950/30 text-emerald-300`
      case 'pending':
        return `${base} border-amber-900/40 bg-amber-950/30 text-amber-300`
      case 'completed':
        return `${base} border-sky-900/40 bg-sky-950/30 text-sky-300`
      case 'cancelled':
        return `${base} border-rose-900/40 bg-rose-950/30 text-rose-300`
      default:
        return `${base} border-stone-800 bg-stone-900/40 text-stone-300`
    }
  }

  const getStatusMessage = (appointment: Appointment) => {
    if (appointment.status === 'pending') return 'Waiting for vet confirmation'
    if (appointment.status === 'confirmed' && canJoin(appointment)) return 'Ready to join'
    if (appointment.status === 'confirmed') return 'Confirmed — join opens 10 min before'
    if (appointment.status === 'completed') return 'Completed'
    if (appointment.status === 'cancelled') return 'Cancelled'
    return ''
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-stone-950 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-stone-800 border-t-amber-600 animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-stone-950 text-stone-200">
        {/* subtle grid */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#292524_1px,transparent_1px),linear-gradient(to_bottom,#292524_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-[0.035] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-white tracking-tight">Appointments</h1>
              <p className="text-stone-500 mt-1">Request and manage veterinary consultations.</p>
            </div>

            <Button
              onClick={handleOpenModal}
              className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              New appointment
            </Button>
          </div>

          {/* List */}
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="bg-stone-900/40 border border-stone-800 rounded-xl p-10 text-center">
                <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-stone-500" />
                </div>
                <h3 className="text-white font-semibold text-lg">No appointments yet</h3>
                <p className="text-stone-500 mt-1 mb-6">Create one to consult a veterinarian.</p>
                <Button onClick={handleOpenModal} className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule first appointment
                </Button>
              </Card>
            ) : (
              appointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="bg-stone-900/40 border border-stone-800 rounded-xl p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={statusPill(appointment.status)}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {appointment.status.toUpperCase()}
                        </span>

                        {appointment.cattleName && (
                          <span className="inline-flex items-center rounded-full border border-stone-800 bg-stone-950/40 px-3 py-1 text-xs text-stone-300">
                            {appointment.cattleName}
                          </span>
                        )}

                        <span className="text-xs text-stone-500">
                          {getStatusMessage(appointment)}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-3">
                        {appointment.reason}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-stone-400">
                          <Calendar className="h-4 w-4 text-stone-600" />
                          <span>
                            {appointment.scheduledDate.toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-stone-400">
                          <Clock className="h-4 w-4 text-stone-600" />
                          <span>
                            {appointment.scheduledTime} • {appointment.duration} min
                          </span>
                        </div>
                      </div>

                      {appointment.vetName && (
                        <p className="text-sm text-stone-400 mt-3">
                          Veterinarian: <span className="text-stone-200 font-medium">{appointment.vetName}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[180px]">
                      {canJoin(appointment) ? (
                        <Button
                          onClick={() => handleJoinCall(appointment)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-semibold"
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Join call
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="bg-stone-800 text-stone-500 cursor-not-allowed"
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Join call
                        </Button>
                      )}

                      {appointment.status === 'pending' && (
                        <Button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          variant="outline"
                          className="border-rose-900/50 text-rose-300 hover:bg-rose-950/20 hover:text-rose-200"
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

      {/* Modal */}
      <AnimatePresence>
        {showNewAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowNewAppointment(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-md"
            >
              <Card className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-2xl">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-semibold text-white">New appointment</h2>
                    <p className="text-sm text-stone-500 mt-1">Request a slot from a veterinarian.</p>
                  </div>
                  <Button
                    onClick={() => setShowNewAppointment(false)}
                    variant="ghost"
                    size="icon"
                    className="text-stone-400 hover:text-white hover:bg-stone-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleCreateAppointment} className="space-y-4">
                  {/* Cattle */}
                  <div>
                    <Label htmlFor="cattle" className="text-stone-300">Cattle (optional)</Label>
                    <select
                      id="cattle"
                      value={formData.cattleId}
                      onChange={(e) => setFormData({ ...formData, cattleId: e.target.value })}
                      className="mt-1 w-full rounded-lg bg-stone-950 border border-stone-800 px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-600/50"
                    >
                      <option value="">General consultation</option>
                      {cattle.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.cattleId} — {c.breed}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <Label htmlFor="date" className="text-stone-300">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 bg-stone-950 border-stone-800 text-white focus-visible:ring-amber-600/20 focus-visible:border-amber-600/50"
                      required
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <Label htmlFor="time" className="text-stone-300">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="mt-1 bg-stone-950 border-stone-800 text-white focus-visible:ring-amber-600/20 focus-visible:border-amber-600/50"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <Label htmlFor="duration" className="text-stone-300">Duration</Label>
                    <select
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="mt-1 w-full rounded-lg bg-stone-950 border border-stone-800 px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-600/50"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>

                  {/* Reason */}
                  <div>
                    <Label htmlFor="reason" className="text-stone-300">Reason *</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Briefly describe the issue (symptoms, duration, urgency)."
                      className="mt-1 bg-stone-950 border-stone-800 text-white focus-visible:ring-amber-600/20 focus-visible:border-amber-600/50"
                      rows={4}
                      required
                    />
                    <div className="mt-2 flex items-start gap-2 text-xs text-stone-500">
                      <AlertCircle className="h-4 w-4 text-stone-600 mt-0.5" />
                      <span>Appointments must be scheduled in the future.</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold"
                    disabled={!formData.reason.trim()}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Request appointment
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
