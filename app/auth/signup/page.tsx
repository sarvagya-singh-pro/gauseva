'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Shield, Mail, Lock, User, Eye, EyeOff, Scan, ArrowRight, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useAuth } from '@/components/AuthProvider'

// --- REUSABLE: MAGNETIC BUTTON ---
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className = "", 
  onClick, 
  disabled, 
  type = "button" 
}) => {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if(disabled || !ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    x.set((clientX - (left + width / 2)) * 0.3)
    y.set((clientY - (top + height / 2)) * 0.3)
  }

  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`relative ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </motion.button>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // --- AUTH LOGIC (Unchanged) ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    if (!emailRegex.test(email.trim())) { setError('Invalid email format'); setLoading(false); return }
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) { setError('Please fill in all fields'); setLoading(false); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: '',
        role: 'milkmen',
        location: '',
        farmBlock: '',
        createdAt: new Date()
      })
      router.push('/dashboard')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError('')
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName || '',
        email: user.email,
        phone: '',
        role: 'milkmen',
        location: '',
        farmBlock: '',
        createdAt: new Date()
      })
      router.push('/dashboard')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to sign up with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-amber-600 selection:text-white">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1917_1px,transparent_1px),linear-gradient(to_bottom,#1c1917_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-2 group">
             <div className="relative">
                <div className="absolute inset-0 bg-amber-500 blur-lg opacity-10 group-hover:opacity-30 transition-opacity" />
                <Shield className="h-10 w-10 text-stone-300 relative z-10" />
             </div>
             <div className="text-3xl font-black text-white tracking-tighter">
                GAU <span className="text-stone-800 text-stroke-white">SEVA</span>
             </div>
             <div className="text-[10px] font-mono text-stone-500 tracking-[0.2em] uppercase">Non-Profit Initiative</div>
          </Link>
        </div>

        {/* Signup Card */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-stone-800 to-stone-900 rounded-lg opacity-50 blur-sm group-hover:opacity-75 transition duration-500"></div>
            
            <Card className="relative bg-stone-900 border-stone-800 p-8 shadow-2xl overflow-hidden">
               {/* Top Accent Line */}
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stone-800 via-amber-600 to-stone-800 opacity-50" />

               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-8 border-b border-stone-800 pb-4">
                     <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                     <h1 className="text-sm font-mono text-stone-400 font-bold tracking-wider">NEW_USER_REGISTRATION</h1>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-mono text-stone-500 ml-1">FULL_NAME</label>
                      <div className="relative group/input">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 group-focus-within/input:text-amber-500 transition-colors" />
                        <input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 bg-stone-950 border border-stone-800 text-stone-200 placeholder:text-stone-700 p-3 text-sm font-mono focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600/20 transition-all rounded-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-mono text-stone-500 ml-1">EMAIL_ADDRESS</label>
                      <div className="relative group/input">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 group-focus-within/input:text-amber-500 transition-colors" />
                        <input
                          id="email"
                          type="email"
                          placeholder="access@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 bg-stone-950 border border-stone-800 text-stone-200 placeholder:text-stone-700 p-3 text-sm font-mono focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600/20 transition-all rounded-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="password" className="text-xs font-mono text-stone-500 ml-1">PASSWORD</label>
                          <div className="relative group/input">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 group-focus-within/input:text-amber-500 transition-colors" />
                            <input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-9 pr-8 bg-stone-950 border border-stone-800 text-stone-200 placeholder:text-stone-700 p-3 text-sm font-mono focus:border-amber-600 focus:outline-none transition-all rounded-sm"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-500 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="confirmPassword" className="text-xs font-mono text-stone-500 ml-1">CONFIRM</label>
                          <div className="relative group/input">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 group-focus-within/input:text-amber-500 transition-colors" />
                            <input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full pl-9 pr-8 bg-stone-950 border border-stone-800 text-stone-200 placeholder:text-stone-700 p-3 text-sm font-mono focus:border-amber-600 focus:outline-none transition-all rounded-sm"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-500 transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-red-950/20 border border-red-900/50 p-3 flex items-start gap-2 overflow-hidden"
                        >
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-red-400 text-xs font-mono leading-relaxed">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <MagneticButton
                      type="submit"
                      disabled={loading}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold h-12 flex items-center justify-center gap-2 group/btn transition-all mt-4"
                    >
                       {loading ? (
                          <span className="font-mono text-xs flex items-center gap-2">
                             <Scan className="w-4 h-4 animate-spin" /> CREATING_ID...
                          </span>
                       ) : (
                          <span className="font-mono text-xs flex items-center gap-2">
                             INITIALIZE_ACCOUNT <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </span>
                       )}
                    </MagneticButton>
                  </form>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
                      <span className="px-2 bg-stone-900 text-stone-600">Alternative Protocols</span>
                    </div>
                  </div>

                  <MagneticButton
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    className="w-full bg-stone-950 border border-stone-700 hover:border-stone-500 text-stone-300 h-12 flex items-center justify-center gap-3 transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-mono text-xs">GOOGLE_AUTH</span>
                  </MagneticButton>

                  <div className="mt-8 text-center border-t border-stone-800 pt-6">
                    <p className="text-stone-500 text-xs font-mono">
                      EXISTING_NODE?{' '}
                      <Link href="/auth/login" className="text-amber-600 hover:text-amber-500 font-bold ml-1 hover:underline">
                        ACCESS_TERMINAL
                      </Link>
                    </p>
                  </div>
               </div>
            </Card>
        </div>

        <p className="text-center text-stone-600 text-[10px] font-mono mt-8 opacity-60">
           INITIATIVE STATUS: 100% FREE && NON-PROFIT
        </p>
      </motion.div>
    </div>
  )
}
