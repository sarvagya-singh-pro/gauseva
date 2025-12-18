'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, Search, AlertTriangle, Stethoscope, 
  Shield, ArrowLeft, Phone, CheckCircle2, 
  TrendingUp, Droplet, Bug, Heart, Flame,
  Activity, ArrowRight
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDisease, setSelectedDisease] = useState(null)

  const diseases = [
    {
      id: 'fmd',
      name: 'Foot & Mouth Disease',
      icon: Flame,
      severity: 'critical',
      code: 'VIRAL-01',
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
      code: 'BACT-04',
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
      code: 'BACT-09',
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
      code: 'PARA-02',
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
      code: 'BACT-07',
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
      code: 'META-01',
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
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans selection:bg-amber-600/30">
      <Navbar />
      
      {/* Background Texture */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1c1917_1px,transparent_1px),linear-gradient(to_bottom,#1c1917_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none z-0" />

      {/* Hero Section */}
      <div className="relative z-10 pt-40 pb-12 px-6 border-b border-stone-900 bg-stone-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
             <span className="font-mono text-xs text-amber-600 tracking-widest uppercase">KNOWLEDGE_BASE // PATHOLOGY</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            VETERINARY <span className="text-stone-700">INDEX</span>
          </h1>
          <p className="text-lg text-stone-400 max-w-2xl mb-8">
            Comprehensive diagnostic protocols for common bovine ailments. 
            <br/><span className="text-stone-500 text-sm font-mono">UPDATED: 2025.12.18</span>
          </p>

          {/* Search Bar */}
          <div className="max-w-xl relative group">
            <div className="absolute inset-0 bg-amber-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-stone-900 border border-stone-800 focus-within:border-amber-600 transition-colors rounded-lg overflow-hidden">
               <Search className="w-5 h-5 text-stone-500 ml-4" />
               <input
                 type="text"
                 placeholder="SEARCH PROTOCOLS (EX: FMD, MASTITIS)..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-transparent border-none text-white p-4 focus:ring-0 placeholder:text-stone-600 font-mono text-sm"
               />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!selectedDisease ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredDiseases.map((disease, index) => {
                const Icon = disease.icon
                const severityColor = 
                    disease.severity === 'critical' ? 'bg-red-500' :
                    disease.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                
                return (
                  <motion.div
                    key={disease.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      onClick={() => setSelectedDisease(disease)}
                      className="h-full bg-stone-900 border border-stone-800 hover:border-amber-600/50 p-6 cursor-pointer group transition-all relative overflow-hidden flex flex-col"
                    >
                      {/* Left Border Indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${severityColor}`} />

                      <div className="flex justify-between items-start mb-4 pl-3">
                        <div className="p-2 bg-stone-950 border border-stone-800 rounded group-hover:border-amber-600/30 transition-colors">
                          <Icon className="h-5 w-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <span className="font-mono text-[10px] text-stone-600 tracking-widest">{disease.code}</span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 pl-3 group-hover:text-amber-500 transition-colors">
                        {disease.name}
                      </h3>
                      
                      <p className="text-stone-500 text-sm leading-relaxed pl-3 flex-1 mb-6">
                         {disease.description}
                      </p>

                      <div className="pl-3 mt-auto pt-4 border-t border-stone-800/50 flex items-center justify-between text-xs font-mono text-stone-500">
                         <span>SEVERITY: <span className={
                            disease.severity === 'critical' ? 'text-red-500' : 
                            disease.severity === 'high' ? 'text-orange-500' : 'text-blue-500'
                         }>{disease.severity.toUpperCase()}</span></span>
                         <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setSelectedDisease(null)}
                className="mb-8 flex items-center gap-2 text-stone-500 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest"
              >
                <ArrowLeft className="h-4 w-4" /> Return_To_Index
              </button>

              <div className="bg-stone-900 border border-stone-800 overflow-hidden relative">
                 {/* Detail Header */}
                 <div className="p-8 border-b border-stone-800 bg-stone-950/50 relative">
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-600" />
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="flex items-center gap-3 mb-3">
                             <div className="px-2 py-0.5 bg-stone-800 text-stone-400 text-[10px] font-mono rounded border border-stone-700">
                                {selectedDisease.code}
                             </div>
                             <div className={`px-2 py-0.5 text-[10px] font-mono rounded border ${
                                selectedDisease.severity === 'critical' ? 'bg-red-950/30 text-red-500 border-red-900/50' : 
                                selectedDisease.severity === 'high' ? 'bg-orange-950/30 text-orange-500 border-orange-900/50' : 
                                'bg-blue-950/30 text-blue-500 border-blue-900/50'
                             }`}>
                                {selectedDisease.severity.toUpperCase()} PRIORITY
                             </div>
                          </div>
                          <h2 className="text-4xl font-black text-white mb-4">{selectedDisease.name.toUpperCase()}</h2>
                          <p className="text-lg text-stone-400 max-w-3xl leading-relaxed">{selectedDisease.description}</p>
                       </div>
                       
                       {(() => {
                          const Icon = selectedDisease.icon
                          return <Icon className="w-16 h-16 text-stone-800" />
                       })()}
                    </div>
                 </div>

                 <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-800">
                    
                    {/* Symptoms Column */}
                    <div className="p-8">
                       <div className="flex items-center gap-2 mb-6 text-red-500">
                          <AlertTriangle className="w-4 h-4" />
                          <h3 className="font-bold font-mono text-sm tracking-wider">CLINICAL_SIGNS</h3>
                       </div>
                       <ul className="space-y-4">
                          {selectedDisease.symptoms.map((s, i) => (
                             <li key={i} className="flex gap-3 text-stone-300 text-sm leading-relaxed">
                                <span className="text-red-900 mt-1.5 text-[8px] font-mono">0{i+1}</span>
                                {s}
                             </li>
                          ))}
                       </ul>
                    </div>

                    {/* Treatment Column */}
                    <div className="p-8">
                       <div className="flex items-center gap-2 mb-6 text-blue-500">
                          <Stethoscope className="w-4 h-4" />
                          <h3 className="font-bold font-mono text-sm tracking-wider">INTERVENTION</h3>
                       </div>
                       <ul className="space-y-4">
                          {selectedDisease.treatment.map((t, i) => (
                             <li key={i} className="flex gap-3 text-stone-300 text-sm leading-relaxed">
                                <span className="text-blue-900 mt-1.5 text-[8px] font-mono">0{i+1}</span>
                                {t}
                             </li>
                          ))}
                       </ul>
                    </div>

                    {/* Prevention Column */}
                    <div className="p-8 bg-stone-900/50">
                       <div className="flex items-center gap-2 mb-6 text-green-500">
                          <Shield className="w-4 h-4" />
                          <h3 className="font-bold font-mono text-sm tracking-wider">PROPHYLAXIS</h3>
                       </div>
                       <ul className="space-y-4">
                          {selectedDisease.prevention.map((p, i) => (
                             <li key={i} className="flex gap-3 text-stone-300 text-sm leading-relaxed">
                                <span className="text-green-900 mt-1.5 text-[8px] font-mono">0{i+1}</span>
                                {p}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>

              {/* Disclaimer Footer */}
              <div className="mt-6 p-4 border border-amber-900/30 bg-amber-950/10 flex gap-4 items-start">
                 <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                 <p className="text-xs text-stone-500 font-mono leading-relaxed">
                    <span className="text-amber-600 font-bold block mb-1">MEDICAL DISCLAIMER</span>
                    Data provided is for reference only. Diagnosis confirmation requires licensed veterinary inspection. Initiate Vet Uplink for professional consultation.
                 </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper Footer */}
      <div className="border-t border-stone-900 bg-stone-950 py-12 px-6">
         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-stone-900 border border-stone-800 p-6 flex items-center justify-between group hover:border-blue-900/50 transition-colors">
               <div>
                  <div className="text-xs font-mono text-blue-500 mb-1">EMERGENCY_HELPLINE</div>
                  <div className="text-2xl font-black text-white">1962</div>
                  <div className="text-xs text-stone-500 mt-1">NATIONAL VETERINARY SERVICE</div>
               </div>
               <Phone className="w-8 h-8 text-stone-800 group-hover:text-blue-900 transition-colors" />
            </div>

            <div className="bg-stone-900 border border-stone-800 p-6 flex items-center justify-between group hover:border-green-900/50 transition-colors">
               <div>
                  <div className="text-xs font-mono text-green-500 mb-1">GOV_SUBSIDY_DATA</div>
                  <div className="text-white font-bold">NADCP PROGRAM</div>
                  <div className="text-xs text-stone-500 mt-1">FREE VACCINATION SCHEDULES</div>
               </div>
               <CheckCircle2 className="w-8 h-8 text-stone-800 group-hover:text-green-900 transition-colors" />
            </div>
         </div>
      </div>
    </div>
  )
}
