'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, Search, AlertTriangle, Stethoscope, 
  Shield, ArrowLeft, Phone, CheckCircle2, 
  TrendingUp, Droplet, Bug, Heart, Flame
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'

interface Disease {
  id: string
  name: string
  icon: any
  severity: 'critical' | 'high' | 'moderate'
  description: string
  symptoms: string[]
  treatment: string[]
  prevention: string[]
  color: string
}

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null)

  const diseases: Disease[] = [
    {
      id: 'fmd',
      name: 'Foot & Mouth Disease',
      icon: Flame,
      severity: 'critical',
      color: 'from-red-500 to-orange-500',
      description: 'Highly contagious viral disease causing fever and blisters. Most common in India with free vaccination available under NADCP.',
      symptoms: [
        'High fever (104-106°F)',
        'Excessive drooling and frothy saliva',
        'Painful blisters on tongue and mouth',
        'Blisters between hooves',
        'Sudden drop in milk (30-50%)',
        'Lameness and reluctance to walk'
      ],
      treatment: [
        'NO cure - isolate immediately',
        'Antiseptic mouthwash daily',
        'Foot dips with copper sulfate',
        'Soft diet and pain relief',
        'Recovery takes 1-3 weeks'
      ],
      prevention: [
        'Free vaccination every 6 months',
        'Vaccinate all cattle above 4 months',
        'Disinfect farm entry points',
        'Quarantine new animals 2 weeks',
        'Report to vet officer immediately'
      ]
    },
    {
      id: 'mastitis',
      name: 'Mastitis',
      icon: Droplet,
      severity: 'critical',
      color: 'from-pink-500 to-red-500',
      description: 'Udder inflammation causing severe milk production loss. Most expensive disease for dairy farmers worldwide.',
      symptoms: [
        'Swollen, hot, painful udder',
        'Clots or blood in milk',
        'Reduced milk production',
        'Fever and loss of appetite',
        'Hardening of udder tissue'
      ],
      treatment: [
        'Immediate vet examination',
        'Intramammary antibiotics',
        'Frequent milking of affected quarter',
        'Hot water fomentation',
        'Discard milk during treatment'
      ],
      prevention: [
        'Clean, dry bedding always',
        'Proper milking hygiene',
        'Teat dipping after milking',
        'Dry cow therapy',
        'Regular equipment cleaning'
      ]
    },
    {
      id: 'blackquarter',
      name: 'Black Quarter',
      icon: AlertTriangle,
      severity: 'critical',
      color: 'from-purple-500 to-indigo-500',
      description: 'Fatal bacterial disease in young cattle (6-24 months). Death within 12-48 hours if not treated early.',
      symptoms: [
        'Very high fever (106-108°F)',
        'Severe depression',
        'Lameness in one leg',
        'Hot swelling that crepitates',
        'Sudden death common'
      ],
      treatment: [
        'EMERGENCY - call vet immediately',
        'High-dose Penicillin',
        'Early treatment can save life',
        'Very high mortality if delayed'
      ],
      prevention: [
        'Annual vaccination mandatory',
        'Vaccinate calves at 6 months',
        'Avoid marshy areas in monsoon',
        'Vaccinate before rainy season'
      ]
    },
    {
      id: 'tickfever',
      name: 'Tick Fever',
      icon: Bug,
      severity: 'high',
      color: 'from-yellow-500 to-orange-500',
      description: 'Blood parasite transmitted by ticks causing severe anemia. Common in endemic areas during summer.',
      symptoms: [
        'High fever',
        'Dark red or coffee-colored urine',
        'Severe anemia - pale gums',
        'Weakness and depression',
        'Difficulty breathing'
      ],
      treatment: [
        'Anti-protozoal injections',
        'Blood transfusion if severe',
        'IV fluids and iron supplements',
        'Keep in cool, shaded area'
      ],
      prevention: [
        'Regular tick control - dipping every 4-6 weeks',
        'Vaccination highly effective',
        'Inspect animals for ticks daily',
        'Keep pastures short'
      ]
    },
    {
      id: 'brucellosis',
      name: 'Brucellosis',
      icon: Heart,
      severity: 'high',
      color: 'from-rose-500 to-pink-500',
      description: 'Causes abortion and infertility. Can spread to humans. Free vaccination available for female calves.',
      symptoms: [
        'Abortion in last trimester',
        'Retained placenta',
        'Repeat breeding problems',
        'Swollen joints',
        'Reduced milk production'
      ],
      treatment: [
        'NO treatment - cull infected animals',
        'Focus only on prevention'
      ],
      prevention: [
        'Free one-time vaccination (4-8 months)',
        'Test and cull positive animals',
        'Quarantine new animals',
        'Use AI from certified bulls',
        'Wear gloves when handling'
      ]
    },
    {
      id: 'milkfever',
      name: 'Milk Fever',
      icon: TrendingUp,
      severity: 'moderate',
      color: 'from-blue-500 to-cyan-500',
      description: 'Calcium deficiency after calving in high-producing cows. Occurs within 72 hours of delivery.',
      symptoms: [
        'Occurs within 3 days of calving',
        'Weakness in hind legs',
        'Unable to stand',
        'Cold ears and legs',
        'S-shaped neck position'
      ],
      treatment: [
        'EMERGENCY calcium injection',
        'Response within 30 minutes',
        'Keep animal warm',
        'May need repeat dose'
      ],
      prevention: [
        'Calcium supplements before calving',
        'Vitamin D3 supplementation',
        'Monitor high-producers closely',
        'Oral calcium gel after calving'
      ]
    }
  ]

  const filteredDiseases = diseases.filter(disease =>
    disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    disease.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative max-w-7xl mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-semibold">Learning Center</span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Cattle Disease Guide
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Essential information for Indian farmers to identify, treat, and prevent common cattle diseases
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search diseases, symptoms, treatments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-slate-800/50 backdrop-blur-sm border-slate-700 text-white text-lg focus:border-blue-500"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <AnimatePresence mode="wait">
            {!selectedDisease ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Disease Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDiseases.map((disease, index) => {
                    const Icon = disease.icon
                    return (
                      <motion.div
                        key={disease.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          onClick={() => setSelectedDisease(disease)}
                          className="group relative overflow-hidden bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-blue-500 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                        >
                          {/* Gradient Header */}
                          <div className={`h-2 bg-gradient-to-r ${disease.color}`} />
                          
                          <div className="p-6">
                            {/* Icon & Badge */}
                            <div className="flex items-start justify-between mb-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${disease.color} shadow-lg`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <Badge className={
                                disease.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                disease.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              }>
                                {disease.severity}
                              </Badge>
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                              {disease.name}
                            </h3>

                            {/* Description */}
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                              {disease.description}
                            </p>

                            {/* Stats */}
                            <div className="flex gap-4 text-xs">
                              <div className="flex items-center gap-1 text-slate-500">
                                <AlertTriangle className="h-3 w-3" />
                                <span>{disease.symptoms.length} symptoms</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <Stethoscope className="h-3 w-3" />
                                <span>{disease.treatment.length} treatments</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <Shield className="h-3 w-3" />
                                <span>{disease.prevention.length} prevention</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Emergency Info Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-12 grid md:grid-cols-2 gap-6"
                >
                  <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/20">
                        <Phone className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">Emergency Helplines</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Veterinary Helpline</span>
                            <span className="text-white font-semibold">1962</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Kisan Call Center</span>
                            <span className="text-white font-semibold">1800-180-1551</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-green-500/20">
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">Free Government Schemes</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-white font-semibold">NADCP Vaccination</p>
                            <p className="text-slate-400">Free FMD shots every 6 months</p>
                          </div>
                          <div>
                            <p className="text-white font-semibold">Brucellosis Program</p>
                            <p className="text-slate-400">Free for female calves (4-8 months)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Back Button */}
                <Button
                  onClick={() => setSelectedDisease(null)}
                  variant="ghost"
                  className="mb-6 text-white hover:bg-slate-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Diseases
                </Button>

                {/* Disease Detail Card */}
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 overflow-hidden">
                  {/* Header with Gradient */}
                  <div className={`relative p-8 bg-gradient-to-r ${selectedDisease.color}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          {(() => {
                            const Icon = selectedDisease.icon
                            return <Icon className="h-8 w-8 text-white" />
                          })()}
                          <Badge className="bg-white/20 text-white border-white/30">
                            {selectedDisease.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-2">
                          {selectedDisease.name}
                        </h2>
                        <p className="text-white/90 text-lg max-w-3xl">
                          {selectedDisease.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content Sections */}
                  <div className="p-8 grid md:grid-cols-3 gap-8">
                    {/* Symptoms */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-red-500/20">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Symptoms</h3>
                      </div>
                      <ul className="space-y-3">
                        {selectedDisease.symptoms.map((symptom, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                            <div className="min-w-[6px] h-[6px] rounded-full bg-red-400 mt-2" />
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Treatment */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <Stethoscope className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Treatment</h3>
                      </div>
                      <ul className="space-y-3">
                        {selectedDisease.treatment.map((treat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                            <div className="min-w-[6px] h-[6px] rounded-full bg-blue-400 mt-2" />
                            <span>{treat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prevention */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <Shield className="h-5 w-5 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Prevention</h3>
                      </div>
                      <ul className="space-y-3">
                        {selectedDisease.prevention.map((prev, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                            <div className="min-w-[6px] h-[6px] rounded-full bg-green-400 mt-2" />
                            <span>{prev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="mx-8 mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-yellow-400 text-sm font-semibold flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Always consult a qualified veterinarian for diagnosis and treatment. This information is for educational purposes only.</span>
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
