'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Mail, Lock, Eye, EyeOff, Stethoscope } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

export default function VetLoginPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVetLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      console.log('🔐 Vet login attempt:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Auth successful:', userCredential.user.uid)
      
      // Verify user is a vet
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
      const doctorDoc = await getDoc(doc(db, 'doctors', email))
      
      if (userDoc.exists() && (userDoc.data().role === 'vet' || userDoc.data().role === 'doctor')) {
        console.log('✅ Verified VET from users collection')
        router.push('/vet-dashboard')
        return
      }
      
      if (doctorDoc.exists()) {
        console.log('✅ Verified VET from doctors collection')
        router.push('/vet-dashboard')
        return
      }

      // Check with query
      const doctorsQuery = query(collection(db, 'doctors'), where('email', '==', email))
      const doctorsSnapshot = await getDocs(doctorsQuery)
      
      if (!doctorsSnapshot.empty) {
        console.log('✅ Verified VET from query')
        router.push('/vet-dashboard')
        return
      }
      
      // Not a vet
      await auth.signOut()
      setError('This account is not registered as a veterinarian. Please contact admin.')
      setLoading(false)
    } catch (err: any) {
      console.error('❌ Login error:', err)
      if (err.code === 'auth/user-not-found') {
        setError('No account found. Please contact admin to get access.')
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.')
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid credentials.')
      } else {
        setError(err.message || 'Failed to login')
      }
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    
    const provider = new GoogleAuthProvider()
    
    try {
      const result = await signInWithPopup(auth, provider)
      const email = result.user.email || ''
      
      // Verify user is a vet
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      const doctorDoc = await getDoc(doc(db, 'doctors', email))
      
      if (userDoc.exists() && (userDoc.data().role === 'vet' || userDoc.data().role === 'doctor')) {
        router.push('/vet-dashboard')
        return
      }
      
      if (doctorDoc.exists()) {
        router.push('/vet-dashboard')
        return
      }

      const doctorsQuery = query(collection(db, 'doctors'), where('email', '==', email))
      const doctorsSnapshot = await getDocs(doctorsQuery)
      
      if (!doctorsSnapshot.empty) {
        router.push('/vet-dashboard')
        return
      }
      
      // Not a vet
      await auth.signOut()
      setError('This Google account is not registered as a veterinarian.')
      setLoading(false)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to login with Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white text-3xl font-bold mb-2">
            <Shield className="h-8 w-8 text-blue-500" />
            GauSeva
          </Link>
          <p className="text-slate-400 text-sm">Veterinarian Portal</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 p-8 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <Stethoscope className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Veterinarian Login</h1>
            <p className="text-slate-400 text-sm">Access your vet dashboard</p>
          </div>

          <form onSubmit={handleVetLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vet@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-lg p-3"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
            >
              {loading ? 'Logging in...' : 'Login as Veterinarian'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/50 text-slate-400">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border-slate-700 text-black hover:bg-slate-700/50 h-12"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Are you a farmer?{' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-xs text-center">
            🔒 Veterinarian access is restricted. Contact admin if you need an account.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
