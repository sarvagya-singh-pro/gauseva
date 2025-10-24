'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Video, Activity, Heart, Thermometer, AlertTriangle,
  Brain, Plus, Bell, Shield, Phone, X, MapPin, Scale
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { redirect, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { useCattleData, useVitalSigns, useDiagnoses } from '@/lib/hooks/useCattleData'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

function DashboardSkeleton() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-10 w-48 bg-slate-800 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-slate-800 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 p-6">
                <div className="h-5 w-5 bg-slate-700 rounded animate-pulse mb-4"></div>
                <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default function Dashboard() {
  const { user: authUser } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedCattleId, setSelectedCattleId] = useState<string | null>(null)
  const [showAddCattle, setShowAddCattle] = useState(false)
  const [newCattle, setNewCattle] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    location: '',
    gender: 'female'
  })

  const { cattle, loading: cattleLoading } = useCattleData()
  const { vitals, loading: vitalsLoading } = useVitalSigns(selectedCattleId || '')
  const { diagnoses, loading: diagnosesLoading } = useDiagnoses(selectedCattleId || '')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authUser) {
      redirect('/auth/login')
    }
  }, [authUser, mounted])

  useEffect(() => {
    if (cattle.length > 0 && !selectedCattleId) {
      setSelectedCattleId(cattle[0].id)
    }
  }, [cattle, selectedCattleId])

  const selectedCattle = cattle.find(c => c.id === selectedCattleId)

  const handleAddCattle = async () => {
    if (!authUser || !newCattle.name || !newCattle.breed || !newCattle.age) return
    
    try {
      const cattleRef = await addDoc(collection(db, 'cattle'), {
        cattleId: `CTL-${Date.now().toString().slice(-4)}`,
        name: newCattle.name,
        breed: newCattle.breed,
        age: parseInt(newCattle.age),
        weight: parseFloat(newCattle.weight) || 500,
        location: newCattle.location || 'Farm Block A',
        gender: newCattle.gender,
        ownerId: authUser.uid,
        ownerName: authUser.displayName || 'Owner',
        createdAt: Timestamp.now()
      })

      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        
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
      console.error('Error adding cattle:', error)
      alert('Failed to add cattle. Please try again.')
    }
  }

  const handleCallVet = async () => {
    if (!authUser) {
      alert('Please log in first')
      return
    }
    
    try {
      const response = await fetch('/api/create-room', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) throw new Error('Failed to create room')
      
      const data = await response.json()
      if (!data.url) throw new Error('No room URL received')
      
      await addDoc(collection(db, 'meetings'), {
        roomUrl: data.url,
        userId: authUser.uid,
        cattleId: selectedCattle?.id || null,
        status: 'scheduled',
        participants: [authUser.uid],
        createdAt: Timestamp.now()
      })
      
      window.location.href = `/consultation?room=${encodeURIComponent(data.url)}`
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to start consultation. Please try again.')
    }
  }

  const totalCattle = cattle.length
  const activeAlerts = diagnoses.filter(d => d.severity === 'High' || d.severity === 'Medium').length
  const healthyCattle = cattle.length - diagnoses.filter(d => d.severity === 'High').length

  const formattedVitals = vitals.slice(-7).map((v) => ({
    day: new Date(v.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    heartRate: Math.round(v.heartRate),
    temperature: parseFloat(v.temperature.toFixed(1)),
    activity: Math.round(v.activity)
  }))

  const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null

  if (!mounted || cattleLoading) {
    return <DashboardSkeleton />
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-slate-300">Monitor your herd's health in real-time</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push('/schedule')} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Video className="mr-2 h-4 w-4" />
                Schedule
              </Button>
              <Button onClick={() => setShowAddCattle(true)} variant="outline" className="border-slate-600 text-black hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" />
                Add Cattle
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <Shield className="h-5 w-5 text-blue-400 mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{totalCattle}</p>
              <p className="text-slate-300 text-sm">Total Cattle</p>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <Bell className="h-5 w-5 text-red-400 mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{activeAlerts}</p>
              <p className="text-slate-300 text-sm">Active Alerts</p>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <Heart className="h-5 w-5 text-green-400 mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{healthyCattle}</p>
              <p className="text-slate-300 text-sm">Healthy Cattle</p>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <Activity className="h-5 w-5 text-purple-400 mb-3" />
              <p className="text-3xl font-bold text-white mb-1">
                {latestVital ? Math.round(latestVital.heartRate) : '--'}
              </p>
              <p className="text-slate-300 text-sm">Avg Heart Rate</p>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cattle List */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700">
                <div className="p-4 border-b border-slate-600">
                  <h2 className="text-lg font-bold text-white flex items-center justify-between">
                    Your Herd
                    <Badge className="bg-blue-500 text-white">{cattle.length}</Badge>
                  </h2>
                </div>
                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {cattle.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-300 text-sm mb-4">No cattle added yet</p>
                      <Button onClick={() => setShowAddCattle(true)} size="sm" className="bg-blue-600 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Cattle
                      </Button>
                    </div>
                  ) : (
                    cattle.map((animal) => {
                      const cattleDiagnoses = diagnoses.filter(d => d.cattleId === animal.id)
                      const hasHighAlert = cattleDiagnoses.some(d => d.severity === 'High')
                      
                      return (
                        <Card
                          key={animal.id}
                          onClick={() => setSelectedCattleId(animal.id)}
                          className={`p-4 cursor-pointer transition-all ${
                            selectedCattleId === animal.id 
                              ? 'bg-blue-500/20 border-blue-500' 
                              : 'bg-slate-900 border-slate-600 hover:border-blue-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-bold text-lg">{animal.name}</h3>
                              <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">{animal.cattleId}</Badge>
                            </div>
                            {hasHighAlert && (
                              <Badge className="bg-red-500 text-white text-xs animate-pulse">Alert</Badge>
                            )}
                          </div>
                          <p className="text-slate-300 text-sm mb-2">{animal.breed}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>{animal.age} years</span>
                            <span>•</span>
                            <span>{animal.weight} kg</span>
                            <span>•</span>
                            <span className="capitalize">{animal.gender}</span>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>
              </Card>
            </div>

            {/* Details Panel */}
            <div className="lg:col-span-2 space-y-6">
              {selectedCattle ? (
                <>
                  <Card className="bg-slate-800 border-slate-700 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-3xl font-bold text-white">{selectedCattle.name}</h2>
                          <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">{selectedCattle.cattleId}</Badge>
                        </div>
                        <p className="text-slate-300 mb-4">{selectedCattle.breed} • {selectedCattle.location}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {selectedCattle.gender === 'female' ? '♀' : '♂'} {selectedCattle.gender}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            Age: {selectedCattle.age}y
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            Weight: {selectedCattle.weight}kg
                          </Badge>
                        </div>
                      </div>
                    
                    </div>
                  </Card>

                  {vitalsLoading ? (
                    <Card className="bg-slate-800 border-slate-700 p-6">
                      <div className="h-64 bg-slate-700 rounded animate-pulse"></div>
                    </Card>
                  ) : vitals.length === 0 ? (
                    <Card className="bg-slate-800 border-slate-700 p-12 text-center">
                      <Activity className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No Vital Signs Data</h3>
                      <p className="text-slate-300">Start monitoring to see health data</p>
                    </Card>
                  ) : (
                    <Card className="bg-slate-800 border-slate-700 p-6">
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-400" />
                        Live Vital Signs
                        <Badge className="ml-auto bg-green-500 text-white">
                          <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
                          Live
                        </Badge>
                      </h2>
                      
                      {latestVital && (
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <Card className="bg-red-500/10 border-red-500/30 p-4">
                            <Heart className="h-5 w-5 text-red-400 mb-2" />
                            <p className="text-2xl font-bold text-white">{Math.round(latestVital.heartRate)}</p>
                            <p className="text-slate-300 text-sm">bpm</p>
                          </Card>
                          <Card className="bg-orange-500/10 border-orange-500/30 p-4">
                            <Thermometer className="h-5 w-5 text-orange-400 mb-2" />
                            <p className="text-2xl font-bold text-white">{latestVital.temperature.toFixed(1)}</p>
                            <p className="text-slate-300 text-sm">°C</p>
                          </Card>
                          <Card className="bg-blue-500/10 border-blue-500/30 p-4">
                            <Activity className="h-5 w-5 text-blue-400 mb-2" />
                            <p className="text-2xl font-bold text-white">{Math.round(latestVital.activity)}</p>
                            <p className="text-slate-300 text-sm">%</p>
                          </Card>
                        </div>
                      )}

                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={formattedVitals}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="day" stroke="#cbd5e1" fontSize={12} />
                          <YAxis stroke="#cbd5e1" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #475569', 
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                          />
                          <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} name="Heart Rate" />
                          <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temperature" />
                          <Line type="monotone" dataKey="activity" stroke="#3b82f6" strokeWidth={2} name="Activity" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  )}

                  {!diagnosesLoading && diagnoses.length > 0 && (
                    <Card className="bg-purple-500/10 border-purple-500/30 p-6">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-400" />
                        AI Health Analysis
                      </h2>
                      <div className="space-y-3">
                        {diagnoses.map((diagnosis) => (
                          <Card key={diagnosis.id} className="bg-slate-800 border-slate-600 p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className={`h-5 w-5 mt-1 ${
                                diagnosis.severity === 'High' ? 'text-red-400' :
                                diagnosis.severity === 'Medium' ? 'text-yellow-400' :
                                'text-blue-400'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="text-white font-semibold">{diagnosis.disease}</h3>
                                  <Badge className={diagnosis.severity === 'High' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}>
                                    {diagnosis.severity}
                                  </Badge>
                                </div>
                                <p className="text-slate-300 text-sm mb-2">{diagnosis.treatment}</p>
                                <div className="flex flex-wrap gap-1">
                                  {diagnosis.symptoms?.map((symptom, i) => (
                                    <Badge key={i} variant="outline" className="text-xs border-slate-500 text-slate-300">
                                      {symptom}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      <Button onClick={handleCallVet} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                        <Video className="mr-2 h-4 w-4" />
                        Consult Veterinarian Now
                      </Button>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="bg-slate-800 border-slate-700 p-12 text-center">
                  <Shield className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Cattle Selected</h3>
                  <p className="text-slate-300 mb-6">
                    {cattle.length === 0 
                      ? 'Add your first cattle to start monitoring'
                      : 'Select a cattle from the list to view details'}
                  </p>
                  {cattle.length === 0 && (
                    <Button onClick={() => setShowAddCattle(true)} className="bg-blue-600 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Cattle
                    </Button>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Cattle Modal - Perfect Contrast */}
      <AnimatePresence>
        {showAddCattle && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <Card className="bg-slate-900 border-slate-700 p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Add New Cattle</h2>
                    <p className="text-slate-300 text-sm">Register a new animal to your herd</p>
                  </div>
                  <Button 
                    onClick={() => setShowAddCattle(false)} 
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white text-base font-medium flex items-center gap-2">
                      Cattle Name *
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">Required</Badge>
                    </Label>
                    <Input
                      id="name"
                      value={newCattle.name}
                      onChange={(e) => setNewCattle({...newCattle, name: e.target.value})}
                      placeholder="e.g., Bella, Daisy, Lucky"
                      className="bg-slate-800 border-slate-600 text-white h-12 text-base placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    <p className="text-slate-400 text-xs">Give your cattle a memorable name</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="breed" className="text-white text-base font-medium">Breed *</Label>
                      <Input
                        id="breed"
                        value={newCattle.breed}
                        onChange={(e) => setNewCattle({...newCattle, breed: e.target.value})}
                        placeholder="e.g., Holstein Friesian"
                        className="bg-slate-800 border-slate-600 text-white h-12 text-base placeholder:text-slate-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-white text-base font-medium">Gender *</Label>
                      <select
                        id="gender"
                        value={newCattle.gender}
                        onChange={(e) => setNewCattle({...newCattle, gender: e.target.value})}
                        className="w-full h-12 bg-slate-800 border border-slate-600 text-white rounded-md px-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="female" className="bg-slate-800 text-white">♀ Female</option>
                        <option value="male" className="bg-slate-800 text-white">♂ Male</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-white text-base font-medium">Age (years) *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={newCattle.age}
                        onChange={(e) => setNewCattle({...newCattle, age: e.target.value})}
                        placeholder="e.g., 3"
                        className="bg-slate-800 border-slate-600 text-white h-12 text-base placeholder:text-slate-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-white text-base font-medium flex items-center gap-2">
                        <Scale className="h-4 w-4 text-blue-400" />
                        Weight (kg)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        value={newCattle.weight}
                        onChange={(e) => setNewCattle({...newCattle, weight: e.target.value})}
                        placeholder="e.g., 500"
                        className="bg-slate-800 border-slate-600 text-white h-12 text-base placeholder:text-slate-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-white text-base font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      Location / Shed
                    </Label>
                    <Input
                      id="location"
                      value={newCattle.location}
                      onChange={(e) => setNewCattle({...newCattle, location: e.target.value})}
                      placeholder="e.g., Farm Block A, Shed 2"
                      className="bg-slate-800 border-slate-600 text-white h-12 text-base placeholder:text-slate-500 focus:border-blue-500"
                    />
                    <p className="text-slate-400 text-xs">Where is this cattle housed?</p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-200 text-sm font-semibold mb-1">Automatic Health Monitoring</p>
                        <p className="text-blue-100 text-xs">
                          Initial health data will be generated for the past 7 days to help you get started with monitoring.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={() => setShowAddCattle(false)}
                      variant="outline"
                      className="flex-1 h-12 border-slate-600 text-black hover:bg-slate-800 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddCattle} 
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
                      disabled={!newCattle.name || !newCattle.breed || !newCattle.age}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Add Cattle
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
