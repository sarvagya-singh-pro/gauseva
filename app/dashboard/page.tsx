'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { 
  Video, Activity, Heart, Thermometer, AlertTriangle,
  Brain, Plus, Bell, Shield, X, MapPin, Scale, 
  Search, ArrowRight, Scan, Signal, Wifi, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { redirect, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useCattleData, useVitalSigns, useDiagnoses } from '@/lib/hooks/useCattleData'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// --- 1. REFINED UI COMPONENTS ---

const MagneticButton = ({ children, className = "", onClick, disabled, variant = "primary" }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e) => {
    if(disabled) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    x.set((clientX - (left + width / 2)) * 0.3)
    y.set((clientY - (top + height / 2)) * 0.3)
  }

  const handleMouseLeave = () => { x.set(0); y.set(0) }

  // Professional styling variants
  const baseStyle = "relative px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
  const variants = {
    primary: "bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-900/20",
    secondary: "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700",
    outline: "bg-transparent border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500"
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </motion.button>
  )
}

// Clean, Professional Card Component
const DashboardCard = ({ children, className = "", title, subtitle, icon: Icon, action }) => (
  <div className={`bg-stone-900/40 backdrop-blur-md border border-stone-800 rounded-xl p-6 ${className}`}>
    {(title || Icon) && (
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-stone-800 rounded-lg border border-stone-700/50">
              <Icon className="w-4 h-4 text-amber-500" />
            </div>
          )}
          <div>
            {title && <h3 className="text-stone-200 font-semibold text-sm tracking-wide">{title}</h3>}
            {subtitle && <p className="text-stone-500 text-xs mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
)

const StatCard = ({ label, value, subtext, icon: Icon, trend }) => (
  <DashboardCard className="hover:border-stone-700 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-stone-800/50 rounded-lg">
        <Icon className="w-5 h-5 text-stone-400" />
      </div>
      {trend && (
        <span className={`text-xs font-mono px-2 py-1 rounded ${trend === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
          {trend === 'critical' ? 'CRITICAL' : 'OPTIMAL'}
        </span>
      )}
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-stone-500 font-medium">{label}</div>
    {subtext && <div className="text-xs text-stone-600 font-mono mt-2 pt-2 border-t border-stone-800/50">{subtext}</div>}
  </DashboardCard>
)

// --- SKELETON ---
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-stone-950 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
         <div className="h-10 w-48 bg-stone-900 rounded-lg" />
         <div className="grid grid-cols-4 gap-4">
           {[...Array(4)].map((_,i) => <div key={i} className="h-40 bg-stone-900 rounded-xl" />)}
         </div>
         <div className="grid grid-cols-3 gap-6 h-[500px]">
           <div className="col-span-1 bg-stone-900 rounded-xl" />
           <div className="col-span-2 bg-stone-900 rounded-xl" />
         </div>
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---

export default function Dashboard() {
  const { user: authUser } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedCattleId, setSelectedCattleId] = useState(null)
  const [showAddCattle, setShowAddCattle] = useState(false)
  
  // Form State
  const [newCattle, setNewCattle] = useState({
    name: '', breed: '', age: '', weight: '', location: '', gender: 'female'
  })

  // Data Hooks
  const { cattle, loading: cattleLoading } = useCattleData()
  const { vitals, loading: vitalsLoading } = useVitalSigns(selectedCattleId || '')
  const { diagnoses, loading: diagnosesLoading } = useDiagnoses(selectedCattleId || '')

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (mounted && !authUser) redirect('/auth/login') }, [authUser, mounted])
  
  // Select first cattle by default
  useEffect(() => {
    if (cattle.length > 0 && !selectedCattleId) {
      setSelectedCattleId(cattle[0].id)
    }
  }, [cattle, selectedCattleId])

  const selectedCattle = cattle.find(c => c.id === selectedCattleId)

  // --- ACTIONS ---

  const handleAddCattle = async () => {
    if (!authUser || !newCattle.name) return
    try {
      const cattleRef = await addDoc(collection(db, 'cattle'), {
        cattleId: `CTL-${Date.now().toString().slice(-4)}`,
        name: newCattle.name,
        breed: newCattle.breed,
        age: newCattle.age,
        weight: newCattle.weight,
        location: newCattle.location,
        gender: newCattle.gender,
        ownerId: authUser.uid,
        createdAt: Timestamp.now()
      })
      // Dummy Vitals Generation
      for (let i = 0; i < 7; i++) {
        const date = new Date(); date.setDate(date.getDate() - (6 - i))
        await addDoc(collection(db, 'vitalSigns'), {
          cattleId: cattleRef.id,
          heartRate: 65 + Math.random() * 15,
          temperature: 38.5 + Math.random() * 1.5,
          activity: 70 + Math.random() * 20,
          date: Timestamp.fromDate(date)
        })
      }
      setShowAddCattle(false)
      setNewCattle({ name: '', breed: '', age: '', weight: '', location: '', gender: 'female' })
    } catch (error) {
      console.error(error)
      alert('Error creating entry')
    }
  }

  const handleCallVet = async () => {
    // (Same logic as before)
    window.location.href = `/consultation?room=demo-room` 
  }

  // --- DERIVED DATA ---
  const totalCattle = cattle.length
  const activeAlerts = diagnoses.filter(d => d.severity === 'High').length
  const healthyCattle = totalCattle - activeAlerts
  const latestVital = vitals[vitals.length - 1]
  
  const chartData = vitals.slice(-7).map(v => ({
    day: new Date(v.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    heartRate: Math.round(v.heartRate),
    temperature: parseFloat(v.temperature.toFixed(1))
  }))

  if (!mounted || cattleLoading) return <DashboardSkeleton />

  return (
    <div className="bg-stone-950 min-h-screen text-stone-200 font-sans selection:bg-amber-600/30">
      <Navbar />
      
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#292524_1px,transparent_1px),linear-gradient(to_bottom,#292524_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-[0.03] pointer-events-none" />

      <main className="relative max-w-7xl mx-auto px-6 pt-32 pb-12">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Herd Overview</h1>
            <p className="text-stone-500 text-sm">Real-time telemetry and health monitoring.</p>
          </div>
          <div className="flex gap-3">
             <MagneticButton variant="secondary" onClick={() => router.push('/schedule')}>
               <Video className="w-4 h-4" /> Schedule Vet
             </MagneticButton>
             <MagneticButton variant="primary" onClick={() => setShowAddCattle(true)}>
               <Plus className="w-4 h-4" /> Add Cattle
             </MagneticButton>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Head" value={totalCattle} icon={Shield} subtext="Active Monitoring" />
          <StatCard label="Critical Alerts" value={activeAlerts} icon={Bell} trend={activeAlerts > 0 ? 'critical' : 'optimal'} subtext="Requires Attention" />
          <StatCard label="Healthy Status" value={healthyCattle} icon={Heart} trend="optimal" subtext="Within Parameters" />
          <StatCard label="Avg Heart Rate" value={latestVital ? `${Math.round(latestVital.heartRate)} BPM` : '--'} icon={Activity} subtext="Last 24 Hours" />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Sidebar: Cattle List */}
          <DashboardCard title="Livestock Directory" icon={Scan} className="lg:col-span-1 h-[600px] flex flex-col p-0 overflow-hidden">
             <div className="p-4 border-b border-stone-800 bg-stone-900/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input 
                    placeholder="Search ID or Name..." 
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-4 py-2 text-sm text-stone-300 focus:outline-none focus:border-amber-600/50 transition-colors"
                  />
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {cattle.map(animal => {
                  const isActive = selectedCattleId === animal.id
                  const hasAlert = diagnoses.some(d => d.cattleId === animal.id && d.severity === 'High')
                  
                  return (
                    <div 
                      key={animal.id}
                      onClick={() => setSelectedCattleId(animal.id)}
                      className={`
                        w-full p-3 rounded-lg cursor-pointer transition-all border flex items-center justify-between group
                        ${isActive 
                          ? 'bg-amber-600/10 border-amber-600/20 shadow-inner' 
                          : 'bg-transparent border-transparent hover:bg-stone-800/50 hover:border-stone-800'
                        }
                      `}
                    >
                       <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${hasAlert ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                          <div>
                            <div className={`font-medium text-sm ${isActive ? 'text-amber-500' : 'text-stone-300'}`}>
                              {animal.name}
                            </div>
                            <div className="text-xs font-mono text-stone-600">{animal.cattleId}</div>
                          </div>
                       </div>
                       <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-stone-700'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                  )
                })}
             </div>
          </DashboardCard>

          {/* Main Panel: Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCattle ? (
              <>
                {/* Header Card */}
                <DashboardCard className="relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Scan className="w-32 h-32 text-stone-500" />
                   </div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                         <h2 className="text-2xl font-bold text-white">{selectedCattle.name}</h2>
                         <span className="px-2 py-1 bg-stone-800 border border-stone-700 rounded text-xs font-mono text-stone-400">
                           {selectedCattle.cattleId}
                         </span>
                      </div>
                      <div className="flex gap-6 text-sm text-stone-400">
                         <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-stone-600" /> {selectedCattle.location}
                         </div>
                         <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-stone-600" /> {selectedCattle.weight} kg
                         </div>
                         <div className="flex items-center gap-2 uppercase">
                            <Activity className="w-4 h-4 text-stone-600" /> {selectedCattle.breed}
                         </div>
                      </div>
                   </div>
                </DashboardCard>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                   <DashboardCard title="Heart Rate History" icon={Activity} className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={chartData}>
                            <CartesianGrid stroke="#44403c" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis dataKey="day" stroke="#78716c" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                            <YAxis stroke="#78716c" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip 
                               contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #44403c', borderRadius: '8px' }}
                               itemStyle={{ fontSize: '12px' }}
                            />
                            <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{r:4}} />
                         </LineChart>
                      </ResponsiveContainer>
                   </DashboardCard>

                   <DashboardCard title="Health Analysis" icon={Brain}>
                      {diagnoses.length > 0 ? (
                        <div className="space-y-3">
                           {diagnoses.map(d => (
                             <div key={d.id} className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                <div>
                                   <div className="text-sm font-bold text-red-200">{d.disease}</div>
                                   <div className="text-xs text-red-300/70 mt-1">{d.treatment}</div>
                                </div>
                             </div>
                           ))}
                           <button onClick={handleCallVet} className="w-full mt-2 py-2 bg-stone-800 hover:bg-stone-700 rounded text-xs text-stone-300 font-medium transition-colors">
                              Contact Veterinarian
                           </button>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-stone-600 opacity-60">
                           <Shield className="w-12 h-12 mb-2" />
                           <p className="text-sm">No anomalies detected</p>
                        </div>
                      )}
                   </DashboardCard>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-stone-800 rounded-xl">
                 <p className="text-stone-500">Select an animal to view telemetry</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL - Professional Style */}
      <AnimatePresence>
        {showAddCattle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAddCattle(false)}
             />
             <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative bg-stone-900 border border-stone-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
             >
                <div className="px-6 py-4 border-b border-stone-800 flex justify-between items-center bg-stone-900/50">
                   <h3 className="font-bold text-white">Register New Animal</h3>
                   <button onClick={() => setShowAddCattle(false)} className="text-stone-500 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-6 space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-400">Name / Identifier</label>
                      <input 
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600/50 outline-none transition-all"
                        placeholder="e.g. Bessie 01"
                        value={newCattle.name}
                        onChange={e => setNewCattle({...newCattle, name: e.target.value})}
                      />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-stone-400">Breed</label>
                        <input 
                           className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white focus:border-amber-600/50 outline-none"
                           value={newCattle.breed}
                           onChange={e => setNewCattle({...newCattle, breed: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-stone-400">Weight (kg)</label>
                        <input 
                           type="number"
                           className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white focus:border-amber-600/50 outline-none"
                           value={newCattle.weight}
                           onChange={e => setNewCattle({...newCattle, weight: e.target.value})}
                        />
                      </div>
                   </div>

                   <div className="flex gap-3 mt-6 pt-2">
                      <button onClick={() => setShowAddCattle(false)} className="flex-1 py-2.5 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800 font-medium text-sm transition-colors">
                         Cancel
                      </button>
                      <button onClick={handleAddCattle} className="flex-1 py-2.5 rounded-lg bg-amber-600 text-stone-950 font-bold text-sm hover:bg-amber-500 shadow-lg shadow-amber-900/20 transition-all">
                         Register Animal
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
