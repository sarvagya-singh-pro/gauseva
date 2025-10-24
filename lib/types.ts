export interface User {
    uid: string
    email: string
    name: string
    phone: string
    role: 'milkmen' | 'vet' | 'doctor'
    createdAt: Date
    
    // Milkmen specific
    location?: string
    farmBlock?: string
    
    // Vet/Doctor specific
    specialization?: string
    licenseNo?: string
    availableHours?: string
    available?: boolean
    checkup?: any[]
    meeting?: string[]
    requests?: any[]
    unavailable_dates?: any[]
  }
  
  export interface Doctor {
    email: string
    available: boolean
    checkup: any[]
    meeting: string[]
    requests: any[]
    unavailable_dates: any[]
  }
  
  export interface Meeting {
    id: string
    participants: string[]
    roomUrl: string
    status: 'scheduled' | 'active' | 'completed'
    createdAt: Date
    doctorId?: string
    userId?: string
  }
  
  export interface Cattle {
    id: string
    cattleId: string
    breed: string
    age: number
    weight: number
    name: string   
    gender: string
    location: string
    ownerId: string
    ownerName: string
    createdAt: Date
  }
  
  export interface VitalSign {
    id: string
    cattleId: string
    heartRate: number
    temperature: number
    activity: number
    date: Date
  }
  
  export interface Diagnosis {
    id: string
    cattleId: string
    disease: string
    severity: 'Low' | 'Medium' | 'High'
    symptoms: string[]
    treatment: string
    detectedAt: Date
  }
  
  export interface Consultation {
    id: string
    milkmenId: string
    milkmenName: string
    vetId: string
    vetName: string
    cattleId?: string
    roomUrl: string
    status: 'scheduled' | 'active' | 'completed'
    notes?: string
    createdAt: Date
  }
  