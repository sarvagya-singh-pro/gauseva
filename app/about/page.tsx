'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { 
  Shield, Heart, Users, Target, Sparkles, Video, 
  Brain, Camera, Activity, Mail, MapPin, 
  ArrowRight, LucideIcon 
} from 'lucide-react'
import Navbar from '@/components/Navbar'

// --- TYPES ---

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

interface TechCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: LucideIcon
}

interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
}

// --- REUSED: MAGNETIC BUTTON ---
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

// --- REUSED: TECH CARD ---
const TechCard: React.FC<TechCardProps> = ({ children, className = "", title, icon: Icon }) => (
  <div className={`relative bg-stone-900 border border-stone-800 p-8 overflow-hidden group ${className}`}>
    {/* Corner Accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-600/50" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-600/50" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-600/50" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-600/50" />
    
    {/* Scan Line Effect on Hover */}
    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    <motion.div 
      initial={{ top: "-100%" }}
      whileHover={{ top: "100%" }}
      transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
      className="absolute left-0 right-0 h-[1px] bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.5)] pointer-events-none"
    />

    {(title || Icon) && (
      <div className="flex items-center gap-3 mb-6 border-b border-stone-800 pb-4">
        {Icon && (
          <div className="p-2 bg-stone-950 border border-stone-800 rounded">
            <Icon className="w-5 h-5 text-amber-600" />
          </div>
        )}
        {title && <h3 className="text-xl font-bold text-stone-200 tracking-tight">{title}</h3>}
      </div>
    )}
    {children}
  </div>
)

export default function AboutPage() {
  const features: FeatureItem[] = [
    {
      icon: Camera,
      title: 'VISUAL_MONITORING',
      description: '24/7 AI-powered optical surveillance detecting behavioral anomalies and physical distress markers.',
    },
    {
      icon: Activity,
      title: 'IOT_TELEMETRY',
      description: 'Biometric sensors tracking heart rate, rumination patterns, and core temperature in real-time.',
    },
    {
      icon: Brain,
      title: 'NEURAL_DIAGNOSTICS',
      description: 'Predictive machine learning models identifying pathology vectors before clinical symptoms manifest.',
    },
    {
      icon: Video,
      title: 'VET_UPLINK',
      description: 'Instantaneous, low-latency video consultations with a decentralized network of volunteer specialists.',
    }
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-stone-950 text-stone-200 font-sans selection:bg-amber-600 selection:text-white pb-20">
        
        {/* Background Texture */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#1c1917_1px,transparent_1px),linear-gradient(to_bottom,#1c1917_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none z-0" />

        {/* Hero Section */}
        <section className="relative z-10 pt-40 pb-20 px-6 border-b border-stone-900">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                 <span className="font-mono text-xs text-amber-600 tracking-widest uppercase">Initiative_Overview</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                SYSTEM <br />
                <span className="text-stone-800 text-stroke-white">MANIFESTO.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-stone-400 leading-relaxed border-l-2 border-amber-600 pl-6 max-w-2xl">
                Democratizing advanced biotelemetry. We engineer open-source monitoring infrastructure for the Indian dairy ecosystem.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            
            {/* Mission Card */}
            <TechCard title="MISSION_PROTOCOL" icon={Target}>
              <p className="text-stone-400 leading-relaxed mb-6 font-mono text-sm">
                To deploy enterprise-grade health monitoring and veterinary diagnostics to every pastoral node in India, independent of economic constraints.
              </p>
              <p className="text-stone-500 leading-relaxed text-sm">
                We reject the commodification of animal welfare. By fusing low-cost IoT hardware with high-efficiency AI, we construct a sustainable grid where cattle health is a fundamental constant.
              </p>
            </TechCard>

            {/* Vision Card */}
            <TechCard title="VISION_PARAMETER" icon={Sparkles}>
              <p className="text-stone-400 leading-relaxed mb-6 font-mono text-sm">
                A connected ecosystem where preventative care replaces reactive treatment. Zero preventable loss through early algorithmic detection.
              </p>
              <p className="text-stone-500 leading-relaxed text-sm">
                We envision a decentralized mesh of empowered farmers and volunteer specialists, united by data-driven insights to elevate livestock welfare standards nationwide.
              </p>
            </TechCard>
            
          </div>
        </section>

        {/* System Architecture (How It Works) */}
        <section className="relative z-10 py-20 px-6 bg-stone-900/30 border-y border-stone-900">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-16">
               <div>
                  <h2 className="text-4xl font-black text-white mb-2">SYSTEM ARCHITECTURE</h2>
                  <p className="text-stone-500 font-mono text-sm">OPERATIONAL WORKFLOW</p>
               </div>
               <Activity className="w-8 h-8 text-stone-800" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="bg-stone-950 border border-stone-800 p-6 h-full hover:border-amber-600/50 transition-colors group">
                    <div className="w-12 h-12 bg-stone-900 border border-stone-800 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-black transition-colors">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-mono text-sm font-bold text-amber-600 mb-3 tracking-wider">{feature.title}</h3>
                    <p className="text-stone-500 text-xs leading-relaxed font-mono">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Non-Profit Philosophy */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-stone-900 border border-stone-800 p-8 md:p-12 overflow-hidden">
               {/* Background Noise */}
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
               
               <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                  <div className="p-4 bg-amber-600/10 border border-amber-600/30 rounded-none">
                     <Heart className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black text-white mb-6">ZERO_COST_INITIATIVE</h2>
                     <p className="text-stone-400 leading-relaxed mb-6">
                        GauSeva operates on a strict <strong className="text-white">non-profit kernel</strong>. We engineer this platform because technological barriers should never compromise animal welfare.
                     </p>
                     <p className="text-stone-500 text-sm leading-relaxed mb-8 font-mono">
                        // PLATFORM FUNDING: GRANTS && DONATIONS <br/>
                        // VETERINARY NETWORK: 100% VOLUNTEER
                     </p>
                     
                     <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-900/50 text-green-500 text-xs font-mono">
                           <Shield className="w-3 h-3" /> FREE_FOR_FARMERS
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-stone-800 border border-stone-700 text-stone-400 text-xs font-mono">
                           <Users className="w-3 h-3" /> VOLUNTEER_DRIVEN
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Footer / Contact */}
        <section className="relative z-10 py-20 px-6 border-t border-stone-900 bg-stone-950">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
               <div>
                  <h2 className="text-5xl font-black text-white mb-6">ESTABLISH <br/><span className="text-amber-600">CONNECTION.</span></h2>
                  <p className="text-stone-400 mb-8 max-w-md">Whether you operate a farm node or wish to contribute veterinary expertise, the network requires your input.</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="p-4 bg-stone-900 border border-stone-800">
                        <Mail className="w-5 h-5 text-amber-600 mb-2" />
                        <div className="text-xs font-mono text-stone-500">DIGITAL_MAIL</div>
                        <div className="text-white font-bold text-sm">contact@gauseva.org</div>
                     </div>
                     <div className="p-4 bg-stone-900 border border-stone-800">
                        <MapPin className="w-5 h-5 text-amber-600 mb-2" />
                        <div className="text-xs font-mono text-stone-500">OPERATIONAL_REGION</div>
                        <div className="text-white font-bold text-sm">PAN_INDIA</div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="bg-stone-900 p-8 border border-stone-800 relative group overflow-hidden">
                     <div className="absolute inset-0 bg-amber-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                     <h3 className="text-xl font-bold text-white mb-2 relative z-10">JOIN_NETWORK // FARMER</h3>
                     <p className="text-stone-500 text-xs font-mono mb-6 relative z-10">Initialize monitoring for your herd.</p>
                     <MagneticButton onClick={() => window.location.href='/auth/signup'} className="w-full py-4 bg-amber-600 text-black font-bold font-mono text-sm hover:bg-amber-500 transition-colors">
                        REGISTER_NODE <ArrowRight className="w-4 h-4 ml-2 inline" />
                     </MagneticButton>
                  </div>

                  <div className="bg-stone-900 p-8 border border-stone-800 relative group overflow-hidden">
                     <div className="absolute inset-0 bg-stone-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                     <h3 className="text-xl font-bold text-white mb-2 relative z-10">JOIN_NETWORK // SPECIALIST</h3>
                     <p className="text-stone-500 text-xs font-mono mb-6 relative z-10">Volunteer veterinary expertise.</p>
                     <MagneticButton onClick={() => window.location.href='/auth/vet-signup'} className="w-full py-4 bg-transparent border border-stone-700 text-stone-300 font-mono text-sm hover:text-white hover:border-white transition-colors">
                        VOLUNTEER_ACCESS
                     </MagneticButton>
                  </div>
               </div>
            </div>
          </div>
        </section>

        <style jsx global>{`
          .text-stroke-white {
            -webkit-text-stroke: 1px rgba(255,255,255,0.8);
            color: transparent;
          }
        `}</style>
      </div>
    </>
  )
}
