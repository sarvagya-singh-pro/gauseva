'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore'
import { useAppStore } from '@/lib/AppContext'
import type { User } from '@/lib/types'

interface AuthContextType {
  user: FirebaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { setUser: setStoreUser } = useAppStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          console.log('User logged in:', firebaseUser.email)
          
          // Check users collection first
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log('Found in users collection, role:', userData.role)
            
            setStoreUser({ 
              uid: firebaseUser.uid, 
              email: firebaseUser.email || '',
              ...userData,
              createdAt: userData.createdAt?.toDate() || new Date()
            } as User)
          } else {
            // Check doctors collection by email
            console.log('User not in users collection, checking doctors...')
            const doctorDocByEmail = await getDoc(doc(db, 'doctors', firebaseUser.email || ''))
            
            if (doctorDocByEmail.exists()) {
              console.log('✅ Found in doctors collection by email')
              const doctorData = doctorDocByEmail.data()
              
              const doctorUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'Doctor',
                phone: '',
                role: 'doctor' as const,
                available: doctorData.available || true,
                checkup: doctorData.checkup || [],
                meeting: doctorData.meeting || [],
                requests: doctorData.requests || [],
                unavailable_dates: doctorData.unavailable_dates || [],
                createdAt: new Date()
              }
              
              setStoreUser(doctorUser)
              
              // Migrate to users collection
              try {
                await setDoc(doc(db, 'users', firebaseUser.uid), doctorUser)
                console.log('Migrated doctor to users collection')
              } catch (e) {
                console.log('Could not migrate:', e)
              }
            } else {
              // Check doctors collection with query
              console.log('Checking doctors with query...')
              const doctorsQuery = query(
                collection(db, 'doctors'),
                where('email', '==', firebaseUser.email)
              )
              const doctorsSnapshot = await getDocs(doctorsQuery)
              
              if (!doctorsSnapshot.empty) {
                console.log('✅ Found in doctors collection via query')
                const doctorData = doctorsSnapshot.docs[0].data()
                
                const doctorUser = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  name: firebaseUser.displayName || 'Doctor',
                  phone: '',
                  role: 'doctor' as const,
                  available: doctorData.available || true,
                  checkup: doctorData.checkup || [],
                  meeting: doctorData.meeting || [],
                  requests: doctorData.requests || [],
                  unavailable_dates: doctorData.unavailable_dates || [],
                  createdAt: new Date()
                }
                
                setStoreUser(doctorUser)
                
                // Migrate to users collection
                try {
                  await setDoc(doc(db, 'users', firebaseUser.uid), doctorUser)
                  console.log('Migrated doctor to users collection')
                } catch (e) {
                  console.log('Could not migrate:', e)
                }
              } else {
                // NOT A DOCTOR - Don't create user automatically
                // Let the signup page handle user creation
                console.log('⚠️ User not found in any collection - no auto-creation')
                setStoreUser(null)
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setStoreUser(null)
        }
      } else {
        setStoreUser(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setStoreUser])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        ...userData,
        role: 'milkmen', // Always farmer for signup
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      const doctorDoc = await getDoc(doc(db, 'doctors', result.user.email || ''))
      
      if (!userDoc.exists() && !doctorDoc.exists()) {
        // Create new FARMER user document (only for Google signup from farmer page)
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || '',
          phone: '',
          role: 'milkmen',
          createdAt: new Date()
        })
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
