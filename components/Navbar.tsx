'use client'

import { Shield, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/AppContext'

export default function Navbar() {
  const { signOut } = useAuth()
  const router = useRouter()
  
  // Always call hooks unconditionally at the top level
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
    <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
    <nav className="border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-lg z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
          
            <span className="text-xl font-bold text-white">GauSeva</span>
          </Link>

          <div className="hidden md:flex gap-6">
          <Link href="/learn" className="text-slate-300 hover:text-white transition-colors">
              Resources
            </Link>
            <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
             About
            </Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
          
           
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-slate-300">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.name || 'User'}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-300 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
    </div>
  )
}
