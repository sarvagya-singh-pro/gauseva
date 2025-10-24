'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Video, VideoOff, Mic, MicOff, Phone, Clock, X, FileText, CheckCircle2, Crown } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { collection, query, where, getDocs, addDoc, deleteDoc, Timestamp, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import SimplePeer from 'simple-peer'

interface Appointment {
  id: string
  farmerId: string
  farmerName: string
  vetId: string
  vetName: string
  cattleId?: string
  cattleName?: string
  reason: string
  duration: number
  roomUrl: string
}

export default function ConsultationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomUrl = searchParams?.get('room')
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<SimplePeer.Instance | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const signalUnsubscribeRef = useRef<(() => void) | null>(null)
  const callStartTime = useRef<number>(0)
  const timerInterval = useRef<any>(null)
  const isCleaningUp = useRef(false)
  const hasInitialized = useRef(false)
  const processedSignals = useRef(new Set<string>())
  
  const [callStatus, setCallStatus] = useState<'loading' | 'connecting' | 'connected' | 'ended'>('loading')
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isVet, setIsVet] = useState(false)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [notes, setNotes] = useState('')
  const [prescription, setPrescription] = useState('')
  
  const roomId = roomUrl?.split('/').pop() || ''

  useEffect(() => {
    if (!user || !roomUrl) {
      console.log('No user or roomUrl')
      return
    }

    if (hasInitialized.current) {
      console.log('Already initialized')
      return
    }
    hasInitialized.current = true

    console.log('Initializing call...')
    const timer = setTimeout(() => initCall(), 100)
    
    return () => {
      clearTimeout(timer)
      cleanup()
      setTimeout(() => {
        hasInitialized.current = false
        processedSignals.current.clear()
      }, 100)
    }
  }, [user, roomUrl])

  const initCall = async () => {
    try {
      console.log('Finding appointment...')
      const appt = await findAppointment()
      if (!appt) {
        setError('Appointment not found')
        return
      }

      const userIsVet = appt.vetId === user!.uid
      console.log('Role:', userIsVet ? 'VET' : 'FARMER')
      setIsVet(userIsVet)
      setAppointment(appt)

      console.log('Clearing old signals...')
      await clearOldSignals()

      console.log('Getting media...')
      const stream = await getMedia()
      if (!stream) return

      console.log('Creating peer...')
      setCallStatus('connecting')
      await createPeer(stream, userIsVet, appt)
      
      console.log('Listening for signals...')
      listenForSignals(userIsVet ? appt.farmerId : appt.vetId)
    } catch (err) {
      console.error('Init error:', err)
      setError('Failed to start call: ' + (err as Error).message)
    }
  }

  const findAppointment = async (): Promise<Appointment | null> => {
    if (!roomUrl) return null
    try {
      const q = query(collection(db, 'appointments'), where('roomUrl', '==', roomUrl))
      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        console.error('No appointment found for room:', roomUrl)
        return null
      }
      console.log('Found appointment:', snapshot.docs[0].id)
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Appointment
    } catch (err) {
      console.error('Find appointment error:', err)
      return null
    }
  }

  const clearOldSignals = async () => {
    try {
      const q = query(collection(db, 'signals'), where('roomId', '==', roomId))
      const snapshot = await getDocs(q)
      await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)))
      console.log('Cleared', snapshot.docs.length, 'signals')
    } catch (err) {
      console.error('Clear signals error:', err)
    }
  }

  const getMedia = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: { echoCancellation: true, noiseSuppression: true }
      })
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      localStreamRef.current = stream
      console.log('Media acquired')
      return stream
    } catch (err) {
      console.error('Media error:', err)
      setError('Camera/mic denied. Please allow access.')
      return null
    }
  }

  const createPeer = async (stream: MediaStream, initiator: boolean, appt: Appointment) => {
    return new Promise<void>((resolve) => {
      console.log('Creating peer, initiator:', initiator)

      const peer = new SimplePeer({
        initiator,
        stream,
        trickle: true,
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      })

      peer.on('signal', (data) => {
        if (!isCleaningUp.current) {
          console.log('Sending signal:', data.type)
          sendSignal(data, initiator ? appt.farmerId : appt.vetId)
        }
      })

      peer.on('stream', (remoteStream) => {
        console.log('Connected!')
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
        setCallStatus('connected')
        startTimer()
      })

      peer.on('error', (err) => console.error('Peer error:', err))
      peer.on('close', () => { if (!isCleaningUp.current) handleCallEnd() })

      peerRef.current = peer
      resolve()
    })
  }

  const sendSignal = async (signal: any, to: string) => {
    if (isCleaningUp.current) return
    try {
      await addDoc(collection(db, 'signals'), {
        roomId, from: user!.uid, to, signal, timestamp: Timestamp.now()
      })
    } catch (err) {
      console.error('Send signal error:', err)
    }
  }

  const listenForSignals = (expectedFrom: string) => {
    const q = query(
      collection(db, 'signals'),
      where('roomId', '==', roomId),
      where('to', '==', user!.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type !== 'added' || isCleaningUp.current) return
        
        const signalId = change.doc.id
        if (processedSignals.current.has(signalId)) return
        processedSignals.current.add(signalId)
        
        const data = change.doc.data()
        if (data.from !== expectedFrom) {
          await deleteDoc(doc(db, 'signals', signalId))
          return
        }
        
        console.log('Received signal:', data.signal.type)
        
        if (peerRef.current && !peerRef.current.destroyed) {
          try {
            peerRef.current.signal(data.signal)
            await deleteDoc(doc(db, 'signals', signalId))
          } catch (err) {
            console.error('Signal error:', err)
          }
        }
      })
    })

    signalUnsubscribeRef.current = unsubscribe
  }

  const startTimer = () => {
    callStartTime.current = Date.now()
    timerInterval.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000))
    }, 1000)
  }

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setMicEnabled(track.enabled)
    }
  }

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setCameraEnabled(track.enabled)
    }
  }

  const endCall = () => {
    peerRef.current?.destroy()
    handleCallEnd()
  }

  const handleCallEnd = async () => {
    if (isCleaningUp.current) return
    isCleaningUp.current = true
    setCallStatus('ended')
    cleanup()

    if (appointment && isVet && callDuration > 0) {
      try {
        await addDoc(collection(db, 'callLogs'), {
          appointmentId: appointment.id,
          vetId: user!.uid,
          farmerId: appointment.farmerId,
          duration: callDuration,
          notes,
          prescription,
          endedAt: Timestamp.now()
        })
        await updateDoc(doc(db, 'appointments', appointment.id), {
          status: 'completed',
          completedAt: Timestamp.now()
        })
      } catch (err) {
        console.error('Save error:', err)
      }
    }

    setTimeout(() => router.push(isVet ? '/vet-dashboard' : '/dashboard'), 2000)
  }

  const cleanup = () => {
    console.log('Cleaning up...')
    signalUnsubscribeRef.current?.()
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    peerRef.current?.destroy()
    if (timerInterval.current) clearInterval(timerInterval.current)
  }

  const saveNotes = async () => {
    if (!appointment || !isVet) return
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), {
        vetNotes: notes, prescription, lastUpdated: Timestamp.now()
      })
      alert('✅ Saved')
    } catch {
      alert('❌ Failed')
    }
  }

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  if (!user || !roomUrl) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <Card className="bg-slate-800 border-slate-700 p-12 text-center max-w-md">
            <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">Video Call</h1>
                {isVet && <Badge className="bg-yellow-500"><Crown className="h-3 w-3 mr-1" />Vet</Badge>}
              </div>
              <div className="flex items-center gap-4">
                <Badge className={callStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}>
                  {callStatus === 'connected' && <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse" />}
                  {callStatus}
                </Badge>
                {callStatus === 'connected' && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4" /><span className="font-mono">{formatTime(callDuration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  {callStatus === 'connecting' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                        <p className="text-white">Connecting...</p>
                      </div>
                    </div>
                  )}
                  {callStatus === 'ended' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-8 right-8 w-64 aspect-video bg-slate-900 rounded-lg border-2 border-slate-700 overflow-hidden">
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={toggleMic} variant={micEnabled ? 'default' : 'destructive'} className="rounded-full h-14 w-14 p-0">
                    {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button onClick={toggleCamera} variant={cameraEnabled ? 'default' : 'destructive'} className="rounded-full h-14 w-14 p-0">
                    {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  <Button onClick={endCall} variant="destructive" className="rounded-full h-14 px-8">
                    <Phone className="h-5 w-5 mr-2 rotate-135" />End
                  </Button>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-4">
              {appointment && (
                <Card className="bg-slate-800/50 border-slate-700 p-4">
                  <h3 className="text-sm font-bold text-white mb-3">Details</h3>
                  <div className="space-y-2 text-xs">
                    <div><p className="text-slate-400">Patient</p><p className="text-white">{appointment.farmerName}</p></div>
                    {appointment.cattleName && <div><p className="text-slate-400">Cattle</p><p className="text-white">{appointment.cattleName}</p></div>}
                    <div><p className="text-slate-400">Reason</p><p className="text-white">{appointment.reason}</p></div>
                  </div>
                </Card>
              )}
              {isVet && (
                <Card className="bg-slate-800/50 border-slate-700 p-4">
                  <h3 className="text-sm font-bold text-white mb-3"><FileText className="h-4 w-4 inline mr-2" />Notes</h3>
                  <div className="space-y-3">
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." className="bg-slate-900 text-white text-xs" rows={3} />
                    <Textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Prescription..." className="bg-slate-900 text-white text-xs" rows={2} />
                    <Button onClick={saveNotes} size="sm" className="w-full">Save</Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
