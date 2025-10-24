'use client'

import { Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="inline-block mb-4"
        >
          <Shield className="h-16 w-16 text-blue-500" />
        </motion.div>
        <h2 className="text-white text-xl font-semibold mb-2">GauSeva</h2>
        <p className="text-slate-400 text-sm">Loading...</p>
      </motion.div>
    </div>
  )
}
