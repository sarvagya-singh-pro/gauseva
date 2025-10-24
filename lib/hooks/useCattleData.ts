import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/AuthProvider'
import type { Cattle, VitalSign, Diagnosis, Meeting } from '@/lib/types'

export function useCattleData() {
  const { user } = useAuth()
  const [cattle, setCattle] = useState<Cattle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setCattle([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'cattle'),
      where('ownerId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cattleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Cattle))
      
      setCattle(cattleData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching cattle:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  return { cattle, loading }
}

export function useVitalSigns(cattleId: string) {
  const [vitals, setVitals] = useState<VitalSign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!cattleId) {
      setVitals([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'vitalSigns'),
      where('cattleId', '==', cattleId),
      orderBy('date', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vitalData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      } as VitalSign))
      
      setVitals(vitalData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching vitals:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [cattleId])

  return { vitals, loading }
}

export function useDiagnoses(cattleId: string) {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!cattleId) {
      setDiagnoses([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'diagnoses'),
      where('cattleId', '==', cattleId),
      orderBy('detectedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const diagnosisData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        detectedAt: doc.data().detectedAt?.toDate() || new Date()
      } as Diagnosis))
      
      setDiagnoses(diagnosisData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching diagnoses:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [cattleId])

  return { diagnoses, loading }
}

export function useMeetings() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setMeetings([])
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      collection(db, 'meetings'),
      (snapshot) => {
        const meetingData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          } as Meeting))
          .filter(m => 
            m.participants?.includes(user.uid) ||
            m.doctorId === user.uid ||
            m.userId === user.uid
          )
        
        setMeetings(meetingData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching meetings:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  return { meetings, loading }
}
