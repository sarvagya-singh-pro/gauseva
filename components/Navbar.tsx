'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useAppStore } from '@/lib/AppContext'
import Image from 'next/image'

// --- TYPES ---
interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

// --- REUSABLE: MAGNETIC BUTTON ---
const MagneticButton: React.FC<MagneticButtonProps> = ({ children, className = "", onClick }) => {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    x.set((clientX - (left + width / 2)) * 0.3)
    y.set((clientY - (top + height / 2)) * 0.3)
  }

  const handleMouseLeave = () => { 
    x.set(0)
    y.set(0) 
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`relative ${className}`}
    >
      {children}
    </motion.button>
  )
}

export default function Navbar() {
  const { signOut } = useAuth()
  const router = useRouter()
  const { user } = useAppStore()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-6 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/50">
      <div className="flex justify-between items-center max-w-[95vw] mx-auto">
        
        {/* 1. Logo Section */}
        <Link href="/" className="flex items-center gap-4 group">
           <div className="w-10 h-10 rounded-full border border-stone-600 bg-stone-800 grayscale flex items-center justify-center overflow-hidden">
             <Image className="object-cover" width={40} height={40} src="/logo.jpeg" alt="Logo" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tighter leading-none text-white text-lg">GAU SEVA</span>
            <span className="text-[9px] font-mono text-amber-600 tracking-widest">NON-PROFIT INITIATIVE</span>
          </div>
        </Link>

        {/* 2. Navigation Routes */}
        <div className="hidden md:flex gap-8 font-mono text-xs tracking-widest text-stone-400">
          <Link href="/learn" className="hover:text-amber-500 transition-colors flex items-center gap-1">
             [ RESOURCES ]
          </Link>
          <Link href="/about" className="hover:text-amber-500 transition-colors">
             [ ABOUT ]
          </Link>
          <Link href="/dashboard" className="hover:text-amber-500 transition-colors text-white font-bold">
             [ DASHBOARD ]
          </Link>
        </div>

        {/* 3. User & Actions */}
        <div className="flex items-center gap-6">
          {user && (
            <div className="hidden md:flex items-center gap-3 bg-stone-900 border border-stone-800 rounded-full px-4 py-1.5">
              <div className="relative">
                <User className="h-3 w-3 text-stone-400" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-[10px] font-mono text-stone-300 uppercase tracking-wider">
                {user.name || 'OPERATOR'}
              </span>
            </div>
          )}
          
          <MagneticButton 
            onClick={handleSignOut}
            className="group flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-red-500 transition-colors"
          >
            <span>// LOG_OUT</span>
            <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </MagneticButton>
        </div>
      </div>
    </nav>
  )
}
