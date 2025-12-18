'use client'

import React, { useRef, useState } from 'react'
import { motion, useScroll, useSpring, useMotionValue } from 'framer-motion'
import { ArrowRight, Wifi, Video, Brain, Activity, Heart, Thermometer, Database, Upload, Scan, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { TrendingUp,User,Signal,ShieldCheck,Mic,PhoneOff } from 'lucide-react'
// --- 1. PHYSICS COMPONENTS ---

const MagneticButton = ({ children, className = "", onClick }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2
    x.set((clientX - centerX) * 0.3)
    y.set((clientY - centerY) * 0.3)
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

// --- 2. NEW: INTERACTIVE AI DEMO COMPONENT ---

const InteractiveAIDemo = () => {
  const [file, setFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile))
      setResult(null)
      simulateAnalysis()
    }
  }

  const simulateAnalysis = () => {
    setIsAnalyzing(true)
    // Simulate network delay and processing
    setTimeout(() => {
      setIsAnalyzing(false)
      // Randomly assign a status for the demo
      const statuses = ["STANDING", "SITTING", "EATING", "RUMINATING"]
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      setResult({
        status: randomStatus,
        confidence: (85 + Math.random() * 14).toFixed(1) + "%",
        health: "OPTIMAL"
      })
    }, 2500)
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="bg-stone-950 border-b border-stone-800 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="font-mono text-xs text-stone-500">AI_INFERENCE_ENGINE_V2.4</div>
        </div>

        <div className="grid md:grid-cols-2 min-h-[400px]">
            {/* Input Area */}
            <div className="p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-stone-800 bg-stone-900/50">
                {!file ? (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-700">
                            <Upload className="w-8 h-8 text-stone-400" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-200 mb-2">Upload Footage</h3>
                        <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
                            Upload an image or video clip of your cattle to test our behavior recognition model.
                        </p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*,video/*" 
                            className="hidden" 
                        />
                        <Button 
                            onClick={() => fileInputRef.current.click()}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        >
                            Select File
                        </Button>
                    </div>
                ) : (
                    <div className="relative w-full h-full min-h-[300px] bg-black rounded-lg overflow-hidden group">
                        <img src={file} alt="Upload" className="w-full h-full object-contain opacity-80" />
                        
                        {/* Scanning Effect Overlay */}
                        {isAnalyzing && (
                             <motion.div 
                                initial={{ top: "0%" }}
                                animate={{ top: "100%" }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)] z-10"
                             />
                        )}

                        {/* Bounding Box (Visible after analysis) */}
                        {!isAnalyzing && result && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-10 border-2 border-amber-500/50 rounded-lg flex flex-col justify-between p-2"
                            >
                                <div className="flex justify-between">
                                    <span className="bg-amber-600 text-black text-[10px] font-bold px-1 py-0.5">ID: COW_01</span>
                                    <span className="text-amber-500 text-[10px] font-mono">{result.confidence}</span>
                                </div>
                                <div className="text-right">
                                    <Scan className="w-4 h-4 text-amber-500 ml-auto" />
                                </div>
                            </motion.div>
                        )}
                        
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => { setFile(null); setResult(null); }}
                            className="absolute top-2 right-2 text-white hover:bg-stone-800/80"
                        >
                            Reset
                        </Button>
                    </div>
                )}
            </div>

            {/* Output / Console Area */}
            <div className="bg-black p-8 font-mono text-sm overflow-hidden flex flex-col relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                
                <div className="text-stone-500 mb-4 border-b border-stone-800 pb-2">
                     SYSTEM_LOG
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="text-stone-400">Initializing neural network...</div>
                    <div className="text-stone-400"> Loading weights (YOLOv8_custom)... OK</div>
                    {file && <div className="text-amber-600"> Input source detected.</div>}
                    
                    {isAnalyzing && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-stone-300">
                                <Loader2 className="w-3 h-3 animate-spin" /> 
                                Processing frames...
                            </div>
                            <div className="text-stone-600 pl-4"> Extracting features...</div>
                            <div className="text-stone-600 pl-4"> Normalizing inputs...</div>
                        </div>
                    )}

                    {!isAnalyzing && result && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mt-4 p-4 border border-stone-800 bg-stone-900/50 rounded"
                        >
                            <div className="flex items-center gap-2 text-green-500 mb-2">
                                <CheckCircle2 className="w-4 h-4" /> ANALYSIS COMPLETE
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <div className="text-stone-500 text-xs">DETECTED STATE</div>
                                    <div className="text-2xl font-bold text-white">{result.status}</div>
                                </div>
                                <div>
                                    <div className="text-stone-500 text-xs">CONFIDENCE</div>
                                    <div className="text-2xl font-bold text-amber-500">{result.confidence}</div>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-stone-800">
                                     <div className="text-stone-500 text-xs">HEALTH ASSESSMENT</div>
                                     <div className="text-stone-300 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-green-500" /> 
                                        {result.health} - No anomalies detected.
                                     </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

// --- 3. EXISTING COMPONENTS (Schematic, Stack) ---

// The "Schematic" Scanner (Scroll-Triggered)
const SchematicReveal = () => {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-stone-900 border-y border-stone-800 my-12 md:my-24 flex items-center justify-center group">
        <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20%" }}
            className="relative w-full h-full flex items-center justify-center"
        >
            <motion.div 
                variants={{
                    hidden: { opacity: 0, scale: 1.1 },
                    visible: { opacity: 0.4, scale: 1, transition: { duration: 1.5, ease: "circOut" } }
                }}
                className="absolute inset-0 z-0"
            >
                <img src="/demo.jpg" className="w-full h-full object-cover grayscale contrast-125 opacity-50" alt="Cattle Monitoring" />
                <div className="absolute inset-0 bg-stone-950/60" />
            </motion.div>

            <div className="relative z-10 overflow-hidden text-center">
                <motion.h2 
                    variants={{
                        hidden: { y: 120, opacity: 0, color: "#292524" }, 
                        visible: { y: 0, opacity: 1, color: "#d97706", textShadow: "0 0 40px rgba(217, 119, 6, 0.3)", transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.2 } }
                    }}
                    className="text-[15vw] md:text-[12vw] leading-none font-black tracking-tighter select-none"
                >
                    LIVE_FEED
                </motion.h2>
            </div>

            <motion.div 
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } } }}
                className="absolute inset-0 pointer-events-none"
            >
                <div className="absolute inset-8 border border-amber-500/30 rounded-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500" />
                </div>
                <motion.div 
                    initial={{ top: "0%" }} animate={{ top: "100%" }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-8 right-8 h-[1px] bg-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                />
            </motion.div>
        </motion.div>
    </div>
  )
}

// 3D Card Stack
const FeatureStack = () => {
    const features = [
        { 
            title: "IOT COLLAR", 
            sub: "Telemetry", 
            desc: "Real-time vitals tracking: Heart rate, Temperature, and Activity levels synced wirelessly.",
            icon: Wifi 
        },
        { 
            title: "AI DIAGNOSIS", 
            sub: "Neural Net", 
            desc: "Computer vision detects lameness, mastitis, and heat stress before symptoms escalate.",
            icon: Brain
        },
        { 
            title: "VET UPLINK", 
            sub: "Network", 
            desc: "Instant video consultation with volunteer veterinarians sharing live camera feeds.",
            icon: Video
        }
    ]

    return (
        <div className="relative py-24">
            {features.map((f, i) => (
                <div key={i} className="sticky top-24 mx-auto max-w-4xl mb-24 px-6">
                    <motion.div 
                        initial={{ rotateX: 20, y: 100, opacity: 0 }}
                        whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        viewport={{ margin: "-100px" }}
                        className="bg-stone-900 border border-stone-800 rounded-xl p-8 md:p-12 shadow-2xl relative overflow-hidden group"
                        style={{ transformOrigin: "top center" }}
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <div className="text-amber-600 font-mono text-xs mb-2 tracking-widest uppercase flex items-center gap-2">
                                    <f.icon className="w-4 h-4" /> {f.sub}
                                </div>
                                <h3 className="text-4xl md:text-6xl font-black text-stone-200 mb-6">{f.title}</h3>
                                <p className="text-lg md:text-xl text-stone-400 max-w-md leading-relaxed">{f.desc}</p>
                            </div>
                            <div className="text-8xl font-black text-stone-800/50 absolute right-0 top-0 -z-10 group-hover:text-amber-900/20 transition-colors duration-500 hidden md:block">
                                0{i+1}
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 bg-amber-600 w-0 group-hover:w-full transition-all duration-700 ease-in-out" />
                    </motion.div>
                </div>
            ))}
        </div>
    )
}

// --- 4. MAIN PAGE ---

export default function GauSevaEngineering() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  
  return (
    <div className="bg-stone-950 min-h-screen text-stone-200 font-sans selection:bg-amber-600 selection:text-white overflow-x-hidden">
      
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-amber-600 origin-left z-[100]" style={{ scaleX }} />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-stone-950/80 backdrop-blur-md border-b border-stone-800/50">
    {/* 1. Logo Section (Unchanged) */}
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full border border-stone-600 bg-stone-800 grayscale flex items-center justify-center overflow-hidden">
            <Image className="object-cover" width={40} height={40} src="/logo.jpeg" alt="Logo" />
        </div>
        <div className="flex flex-col">
            <span className="font-bold tracking-tighter leading-none text-white">GAU SEVA</span>
            <span className="text-[9px] font-mono text-amber-600">NON-PROFIT INITIATIVE</span>
        </div>
    </div>
    
    {/* 2. New Routes (Adapted to your Design) */}
    {/* Changed 'hidden md:flex' to 'hidden lg:flex' if space gets tight, or keep 'md:flex' */}
    <div className="hidden md:flex gap-6 font-mono text-xs tracking-widest text-stone-400">
        <a href="#resources" className="hover:text-amber-500 transition-colors">[ RESOURCES ]</a>
        <a href="#about" className="hover:text-amber-500 transition-colors">[ ABOUT ]</a>
        <a href="#dashboard" className="hover:text-amber-500 transition-colors">[ DASHBOARD ]</a>
        <a href="#vet" className="hover:text-amber-500 transition-colors text-amber-600/50 hover:text-amber-500">[ VET DASHBOARD ]</a>
    </div>

    {/* 3. Actions: Login + Get Started */}
    <div className="flex items-center gap-6">
        {/* Added Login Link */}
        <a href="/login" className="hidden md:block font-mono text-xs font-bold text-stone-500 hover:text-white transition-colors">
            // LOGIN
        </a>

        {/* Updated Button Text */}
        <MagneticButton className="px-6 py-2 bg-amber-600 border border-amber-600 text-stone-950 rounded-full hover:bg-amber-500 transition-colors duration-300">
            <span className="font-bold text-xs">GET STARTED</span>
        </MagneticButton>
    </div>
</nav>


      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col justify-center px-6 pt-32 pb-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1917_1px,transparent_1px),linear-gradient(to_bottom,#1c1917_1px,transparent_1px)] bg-[size:4rem_4rem] -z-10 mask-image-gradient" />
          
          <div className="max-w-[90vw] mx-auto">
              <div className="border-l border-amber-600/30 pl-8 mb-12">
                  <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 1 }}
                      className="font-mono text-amber-600 text-sm mb-4 flex items-center gap-2"
                  >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                     
                  </motion.div>
                  <motion.h1 
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[12vw] leading-[0.85] font-black tracking-tighter text-stone-200"
                  >
                      GAU<br />
                      <span className="text-stroke-white text-amber-600  duration-300 cursor-default">Seva.</span>
                  </motion.h1>
              </div>

              <div className="flex flex-col md:flex-row gap-12 items-end justify-between border-t border-stone-800 pt-8">
                  <p className="max-w-xl text-stone-400 text-lg md:text-xl leading-relaxed">
                      We engineer digital twins for livestock. <span className="text-amber-500 font-bold">Free for every Indian farmer.</span> Real-time camera monitoring, IoT health sensors, and AI-powered veterinary diagnostics.
                  </p>
                  
                  <div className="flex gap-4">
                      <MagneticButton className="w-16 h-16 rounded-full border border-stone-700 flex items-center justify-center hover:bg-amber-600 hover:border-amber-600 hover:text-black transition-all group">
                           <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </MagneticButton>
                  </div>
              </div>
          </div>
      </header>

   <section className="px-6 py-32 bg-stone-950 border-t border-stone-900">
            <div className="max-w-[90vw] mx-auto mb-16">
                 {/* Section Header */}
                 <div className="flex justify-between items-end border-b border-stone-800 pb-4 mb-12">
                     <h2 className="text-sm font-mono text-stone-500">02. TEMPORAL INTELLIGENCE</h2>
                     <TrendingUp className="w-4 h-4 text-amber-600" />
                 </div>
                 
                 <div className="max-w-6xl mx-auto">
                    {/* Main Dashboard Container */}
                    <div className="w-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl relative group">
                        {/* Background Noise Texture */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                        
                        <div className="grid md:grid-cols-3">
                            {/* Left Panel: Explanation */}
                            <div className="p-8 md:p-12 md:col-span-1 border-b md:border-b-0 md:border-r border-stone-800 flex flex-col justify-between bg-stone-900/50">
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        <span className="font-mono text-xs text-amber-500 font-bold tracking-widest">LSTM_MODEL_ACTIVE</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-4">PREDICTIVE<br/><span className="text-amber-600">HEALTH.</span></h3>
                                    <p className="text-stone-400 text-sm leading-relaxed mb-6">
                                        While cameras see the <i>present</i>, our LSTM (Long Short-Term Memory) networks analyze the <i>past</i>.
                                    </p>
                                    <p className="text-stone-500 text-sm leading-relaxed">
                                        By processing 72-hour windows of heart rate and rumination data, the model predicts expected baselines. Deviations trigger early warnings for issues like Heat Stress or Calving onset hours before physical symptoms appear.
                                    </p>
                                </div>
                                <div className="mt-8 pt-8 border-t border-stone-800">
                                    <div className="flex items-center gap-4 text-xs font-mono text-stone-500">
                                        <div>INPUT: [T-48 ... T]</div>
                                        <ArrowRight className="w-3 h-3 text-amber-600" />
                                        <div className="text-white">PREDICTION: [T+1]</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Visualization */}
                            <div className="md:col-span-2 p-8 bg-black relative overflow-hidden">
                                {/* Graph Container */}
                                <div className="relative h-64 w-full border-l border-b border-stone-800 mb-4">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1917_1px,transparent_1px),linear-gradient(to_bottom,#1c1917_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />
                                    
                                    {/* Simulated "Normal" Baseline (Blue/Gray) - The "Prediction" */}
                                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                                         <motion.path
                                            d="M0,150 Q50,140 100,150 T200,150 T300,140 T400,160 T500,150 T600,140 T700,150"
                                            fill="none"
                                            stroke="#44403c" // Stone-700
                                            strokeWidth="2"
                                            strokeDasharray="5,5"
                                            initial={{ pathLength: 0 }}
                                            whileInView={{ pathLength: 1 }}
                                            transition={{ duration: 2, ease: "linear" }}
                                         />
                                    </svg>

                                    {/* Simulated "Actual" Data with Anomaly (Amber/Red) */}
                                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                                        <motion.path
                                            d="M0,155 Q50,145 100,155 T200,155 T300,100 T400,80 T500,155 T600,145 T700,155"
                                            fill="none"
                                            stroke="#d97706" // Amber-600
                                            strokeWidth="3"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            whileInView={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 2, delay: 0.5, ease: "linear" }}
                                        />
                                        
                                        {/* Anomaly Highlight Box (The deviation area) */}
                                        <motion.rect
                                            x="280" y="50" width="140" height="130"
                                            fill="rgba(220, 38, 38, 0.1)"
                                            stroke="rgba(220, 38, 38, 0.5)"
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            transition={{ delay: 1.5 }}
                                        />
                                    </svg>
                                    
                                    {/* Floating Warning Label */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.6 }}
                                        className="absolute top-16 left-[300px] bg-red-900/90 border border-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg backdrop-blur-sm"
                                    >
                                        <div className="flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            ANOMALY DETECTED (MAE &gt; 0.45)
                                        </div>
                                    </motion.div>
                                    
                                    {/* Legend */}
                                    <div className="absolute top-2 right-2 flex gap-4 text-[10px] font-mono">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-0.5 bg-stone-500 border-t border-dashed" />
                                            <span className="text-stone-500">PREDICTED (BASELINE)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-0.5 bg-amber-600" />
                                            <span className="text-amber-600">ACTUAL (SENSOR)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Stats Row */}
                                <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                                    <div className="bg-stone-900/50 p-3 rounded border border-stone-800">
                                        <div className="text-stone-500 mb-1">METRIC</div>
                                        <div className="text-white">HEART_RATE_VAR</div>
                                    </div>
                                    <div className="bg-stone-900/50 p-3 rounded border border-stone-800">
                                        <div className="text-stone-500 mb-1">WINDOW</div>
                                        <div className="text-white">72 HOURS</div>
                                    </div>
                                    <div className="bg-stone-900/50 p-3 rounded border border-red-900/50">
                                        <div className="text-stone-500 mb-1">STATUS</div>
                                        <div className="text-red-500 animate-pulse font-bold">CRITICAL SPIKE</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </section>
      {/* SECTION: DIAGNOSTIC REVEAL */}
      <section id="monitor" className="px-6 py-12">
          <div className="max-w-[90vw] mx-auto flex justify-between items-end mb-8 border-b border-stone-800 pb-4">
              <h2 className="text-sm font-mono text-stone-500">01. DIAGNOSTIC LAYER</h2>
              <Activity className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <SchematicReveal />
      </section>

      {/* SECTION: INTERACTIVE AI DEMO (NEW) */}
      <section id="demo" className="px-6 py-32 bg-stone-950 border-t border-stone-900">
          <div className="max-w-[90vw] mx-auto mb-16 text-center">
               <h2 className="text-4xl md:text-6xl font-black text-white mb-6">TRY THE <span className="text-amber-600">VISION ENGINE</span></h2>
               <p className="text-stone-400 max-w-2xl mx-auto">Upload a photo or video to see our behavior recognition model in real-time. (Demo Mode: Uses simulated inference)</p>
          </div>
          <div className="px-6">
            <InteractiveAIDemo />
          </div>
      </section>
      <section className="px-6 py-32 bg-stone-950 border-t border-stone-900 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1917_1px,transparent_1px),linear-gradient(to_bottom,#1c1917_1px,transparent_1px)] bg-[size:4rem_4rem] -z-10 opacity-20" />

            <div className="max-w-[90vw] mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Column: Text Content */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-900/20 border border-amber-600/30 rounded-lg">
                                <Video className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="font-mono text-xs text-amber-600 font-bold tracking-widest">
                                VET_UPLINK_PROTOCOL
                            </span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
                            INSTANT <br/>
                            <span className="text-stone-800 text-stroke-white">EXPERT ACCESS.</span>
                        </h2>

                        <p className="text-stone-400 text-lg leading-relaxed mb-8 border-l-2 border-amber-600 pl-6">
                            Geography is no longer a barrier. Our decentralized network connects farmers with volunteer veterinarians instantly.
                        </p>

                        <div className="space-y-6 mb-10">
                            {[
                                { title: "Telemetry Sync", desc: "Vets see live heart rate & temp data overlaid on the call." },
                                { title: "Zero Latency", desc: "WebRTC architecture ensures real-time diagnosis capability." },
                                { title: "100% Free", desc: "Volunteer-driven network for non-profit cattle welfare." }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-4 group"
                                >
                                    <div className="mt-1 w-1.5 h-1.5 bg-stone-600 rounded-full group-hover:bg-amber-500 transition-colors" />
                                    <div>
                                        <h4 className="text-white font-bold font-mono text-sm">{item.title}</h4>
                                        <p className="text-stone-500 text-sm">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <Button className="h-14 px-8 bg-amber-600 hover:bg-amber-700 text-black font-bold rounded-none border border-amber-500">
                            INITIATE_CALL_DEMO
                        </Button>
                    </div>

                    {/* Right Column: UI Mockup */}
                    <div className="relative">
                        {/* The "Device" Frame */}
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "backOut" }}
                            className="relative bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            {/* Header Bar (Vet Side) */}
                            <div className="bg-stone-950 p-4 border-b border-stone-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center border border-stone-700">
                                            <User className="w-5 h-5 text-stone-400" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-stone-950" />
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-sm">Dr. A. Sharma</div>
                                        <div className="text-amber-600 text-[10px] font-mono tracking-wider">VOLUNTEER_VET_ID_884</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-900/50 rounded-full">
                                    <Signal className="w-3 h-3 text-green-500" />
                                    <span className="text-[10px] font-mono text-green-500">ENCRYPTED_HD</span>
                                </div>
                            </div>

                            {/* Main Video Area */}
                            <div className="relative aspect-video bg-black group">
                                <img src="/demo.jpg" alt="Cow Call" className="w-full h-full object-cover opacity-60" />
                                
                                {/* Overlay: Live Telemetry (What the vet sees) */}
                                <div className="absolute top-4 right-4 w-48 space-y-2">
                                    <motion.div 
                                        initial={{ x: 20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-black/80 backdrop-blur border border-amber-500/30 p-3 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-stone-400 font-mono">HEART_RATE</span>
                                            <Activity className="w-3 h-3 text-red-500 animate-pulse" />
                                        </div>
                                        <div className="text-2xl font-mono text-white font-bold">68 <span className="text-xs text-stone-500">BPM</span></div>
                                    </motion.div>

                                    <motion.div 
                                        initial={{ x: 20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="bg-black/80 backdrop-blur border border-amber-500/30 p-3 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-stone-400 font-mono">BODY_TEMP</span>
                                            <ShieldCheck className="w-3 h-3 text-green-500" />
                                        </div>
                                        <div className="text-2xl font-mono text-white font-bold">38.5 <span className="text-xs text-stone-500">°C</span></div>
                                    </motion.div>
                                </div>

                                {/* Call Controls */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center hover:bg-stone-700 cursor-pointer transition-colors text-white">
                                        <Mic className="w-5 h-5" />
                                    </div>
                                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 cursor-pointer shadow-lg shadow-red-900/50 transition-transform hover:scale-105 text-white">
                                        <PhoneOff className="w-8 h-8" />
                                    </div>
                                    <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center hover:bg-stone-700 cursor-pointer transition-colors text-white">
                                        <Video className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Connection Status Footer */}
                            <div className="bg-stone-950 p-3 border-t border-stone-800 flex justify-between items-center text-[10px] font-mono text-stone-500">
                                <div>SESSION_TIME: 04:12</div>
                                <div className="flex items-center gap-2">
                                    <Wifi className="w-3 h-3" />
                                    UPLINK_STABLE
                                </div>
                            </div>
                        </motion.div>

                        {/* Decor Elements */}
                        <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
                        <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </section>
      {/* SECTION: ARCHITECTURE STACK */}
      <section id="network" className="px-6 py-32 bg-stone-950">
          <div className="max-w-[90vw] mx-auto mb-16">
               <h2 className="text-6xl md:text-8xl font-black text-stone-800 select-none">SYSTEM<br/>ARCHITECTURE</h2>
          </div>
          <FeatureStack />
      </section>

      {/* SECTION: TECHNICAL SPECS */}
      <section className="py-32 border-y border-stone-800 bg-stone-900/30">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                     <div className="inline-block px-3 py-1 border border-amber-600/30 bg-amber-600/10 rounded-full mb-6">
                        <span className="text-amber-500 text-xs font-mono font-bold flex items-center gap-2">
                            <Wifi className="h-3 w-3" /> HARDWARE_TELEMETRY
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Military-Grade <br/>
                        <span className="text-amber-600">Biometric Sensors</span>
                    </h2>
                    <p className="text-stone-400 text-lg mb-8 leading-relaxed">
                        Each collar acts as an edge-computing node, processing vital signs locally before transmitting anomalies to the vet network.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Heart, label: "HEART_RATE", value: "Real-time ECG" },
                            { icon: Thermometer, label: "THERMAL", value: "±0.1°C Precision" },
                            { icon: Activity, label: "GYROSCOPE", value: "Rumination Tracking" },
                            { icon: Database, label: "OFFLINE_MODE", value: "24hr Data Cache" }
                        ].map((spec, i) => (
                            <div key={i} className="bg-stone-900 border border-stone-800 p-4 rounded-lg hover:border-amber-600/50 transition-colors">
                                <spec.icon className="h-5 w-5 text-amber-600 mb-2" />
                                <p className="text-stone-300 font-bold text-xs font-mono">{spec.label}</p>
                                <p className="text-stone-500 text-xs">{spec.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="relative h-[400px] bg-stone-900 border border-stone-800 rounded-2xl p-8 flex items-center justify-center overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                     <div className="relative z-10 text-center">
                        <div className="w-48 h-48 rounded-full border-2 border-dashed border-stone-700 mx-auto mb-8 animate-spin-slow flex items-center justify-center">
                            <div className="w-40 h-40 rounded-full border border-amber-600/30" />
                        </div>
                        <div className="font-mono text-amber-600 text-xs">Waiting for hardware connection...</div>
                     </div>
                </div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="relative bg-amber-600 text-stone-950 py-20 px-6 overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-grain" />
           </div>

           <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                  <div>
                      <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8">
                          SYSTEM <br/> READY.
                      </h2>
                      <div className="flex gap-4">
                          <Button className="h-16 px-10 bg-stone-950 text-white hover:bg-stone-800 rounded-none text-xl font-bold border-2 border-stone-950 hover:border-white transition-all">
                              Deploy Now
                          </Button>
                      </div>
                  </div>

                  <div className="font-mono text-sm space-y-2 text-stone-900/70 font-bold">
                      <p>GAU SEVA INITIATIVE</p>
                      <p>BUILD_VER: 2.4.0</p>
                      <p>LOC: INDIA</p>
                      <p className="pt-4">© 2025 OPEN SOURCE</p>
                  </div>
              </div>
           </div>
      </footer>

      <style jsx global>{`
        .text-stroke-white {
          -webkit-text-stroke: 1px rgba(255,126,0,0.8);
          color: transparent;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        .animate-grain {
          animation: grain 8s steps(10) infinite;
        }
        /* Custom scrollbar for console */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1c1917; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #44403c; 
          border-radius: 2px;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
      `}</style>
    </div>
  )
}
