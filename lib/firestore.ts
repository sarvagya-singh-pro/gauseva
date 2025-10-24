import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    setDoc
  } from 'firebase/firestore'
  import { db } from './firebase'
  import type { User, Cattle, VitalSign, Diagnosis, Consultation, Doctor, Meeting } from './types'
  
  // Users
  export const createUser = async (userId: string, userData: Partial<User>) => {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      ...userData,
      createdAt: Timestamp.now()
    })
  }
  
  export const getUser = async (userId: string) => {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return null

    const data = userSnap.data()
    return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } as unknown as User : null


  }
  
  // Doctors (from your existing structure)
  export const getDoctors = async () => {
    const doctorsRef = collection(db, 'doctors')
    const querySnapshot = await getDocs(doctorsRef)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Doctor & { id: string }))
  }
  
  export const getDoctor = async (doctorId: string) => {
    const doctorRef = doc(db, 'doctors', doctorId)
    const doctorSnap = await getDoc(doctorRef)
    return doctorSnap.exists() ? { id: doctorSnap.id, ...doctorSnap.data() } as unknown as Doctor : null

  }
  
  export const updateDoctorAvailability = async (doctorId: string, available: boolean) => {
    const doctorRef = doc(db, 'doctors', doctorId)
    await updateDoc(doctorRef, { available })
  }
  
  // Meetings (from your existing structure)
  export const getMeetings = async (userId: string) => {
    const meetingsRef = collection(db, 'meetings')
    const querySnapshot = await getDocs(meetingsRef)
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Meeting))
      .filter(meeting => 
        meeting.participants?.includes(userId) || 
        meeting.doctorId === userId || 
        meeting.userId === userId
      )
  }
  
  export const createMeeting = async (meetingData: Partial<Meeting>) => {
    const meetingRef = await addDoc(collection(db, 'meetings'), {
      ...meetingData,
      createdAt: Timestamp.now()
    })
    return meetingRef.id
  }
  
  export const getMeeting = async (meetingId: string) => {
    const meetingRef = doc(db, 'meetings', meetingId)
    const meetingSnap = await getDoc(meetingRef)
    return meetingSnap.exists() ? { id: meetingSnap.id, ...meetingSnap.data() } as Meeting : null
  }
  
  // Cattle
  export const createCattle = async (cattleData: Omit<Cattle, 'id' | 'createdAt'>) => {
    const cattleRef = await addDoc(collection(db, 'cattle'), {
      ...cattleData,
      createdAt: Timestamp.now()
    })
    return cattleRef.id
  }
  
  export const getCattle = async (cattleId: string) => {
    const cattleRef = doc(db, 'cattle', cattleId)
    const cattleSnap = await getDoc(cattleRef)
    return cattleSnap.exists() ? { id: cattleSnap.id, ...cattleSnap.data() } as Cattle : null
  }
  
  export const getCattleByOwner = async (ownerId: string) => {
    const q = query(collection(db, 'cattle'), where('ownerId', '==', ownerId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cattle))
  }
  
  // Vital Signs
  export const addVitalSign = async (vitalData: Omit<VitalSign, 'id' | 'date'>) => {
    const vitalRef = await addDoc(collection(db, 'vitalSigns'), {
      ...vitalData,
      date: Timestamp.now()
    })
    return vitalRef.id
  }
  
  export const getVitalSigns = async (cattleId: string, days: number = 7) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - days)
    
    const q = query(
      collection(db, 'vitalSigns'),
      where('cattleId', '==', cattleId),
      where('date', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('date', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      date: doc.data().date?.toDate() 
    } as VitalSign))
  }
  
  // Diagnoses
  export const addDiagnosis = async (diagnosisData: Omit<Diagnosis, 'id' | 'detectedAt'>) => {
    const diagnosisRef = await addDoc(collection(db, 'diagnoses'), {
      ...diagnosisData,
      detectedAt: Timestamp.now()
    })
    return diagnosisRef.id
  }
  
  export const getDiagnoses = async (cattleId: string) => {
    const q = query(
      collection(db, 'diagnoses'),
      where('cattleId', '==', cattleId),
      orderBy('detectedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      detectedAt: doc.data().detectedAt?.toDate()
    } as Diagnosis))
  }
  
  // Consultations
  export const createConsultation = async (consultData: Omit<Consultation, 'id' | 'createdAt'>) => {
    const consultRef = await addDoc(collection(db, 'consultations'), {
      ...consultData,
      createdAt: Timestamp.now()
    })
    return consultRef.id
  }
  
  export const updateConsultationStatus = async (consultId: string, status: string, notes?: string) => {
    const consultRef = doc(db, 'consultations', consultId)
    await updateDoc(consultRef, { status, ...(notes && { notes }) })
  }
  
  export const getConsultations = async (userId: string, role: 'milkmen' | 'vet') => {
    const field = role === 'milkmen' ? 'milkmenId' : 'vetId'
    const q = query(
      collection(db, 'consultations'),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    } as Consultation))
  }
  