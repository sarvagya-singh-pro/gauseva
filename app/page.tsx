'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useSpring, useMotionValue } from 'framer-motion'
import { 
  ArrowRight, Wifi, Video, Brain, Activity, Upload, Scan, Loader2, 
  CheckCircle2, AlertCircle, TrendingUp, User, Signal, LucideIcon ,Mic,PhoneOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation' 

// --- TYPES ---

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

interface AnalysisResult {
  status: string
  confidence: string
  health: string
}

interface FeatureItem {
  title: string
  sub: string
  desc: string
  icon: LucideIcon
}

// --- 1. PHYSICS COMPONENTS ---

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

// --- 2. INTERACTIVE AI DEMO COMPONENT ---

// --- 2. INTERACTIVE AI DEMO COMPONENT (MULTI-DETECTION) ---

const InteractiveAIDemo = () => {
  const [file, setFile] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Store ALL detections, not just one
  const [detections, setDetections] = useState<any[]>([])
  const [imageSize, setImageSize] = useState<{width: number, height: number} | null>(null)
  
  // Main result summary (e.g., "3 COWS DETECTED")
  const [summary, setSummary] = useState<{status: string, count: number} | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(file)
    }
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }
      
      setFile(URL.createObjectURL(selectedFile))
      setDetections([])
      setSummary(null)
      setError(null)
      analyzeImage(selectedFile)
    }
  }

  const analyzeImage = async (imageFile: File) => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Analysis failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.detections || data.detections.length === 0) {
        throw new Error("No behavior detected.")
      }

      // Store all detections and image metadata
      setDetections(data.detections)
      setImageSize(data.imageSize)

      // Create a summary for the text panel
      setSummary({
          status: "ANALYSIS COMPLETE",
          count: data.detections.length
      })

    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed.')
      setDetections([])
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  // Helper to convert pixel bbox to % for CSS
  const getBoxStyle = (bbox: any) => {
      if (!imageSize) return { opacity: 0 };
      return {
          left: `${(bbox.x / imageSize.width) * 100}%`,
          top: `${(bbox.y / imageSize.height) * 100}%`,
          width: `${(bbox.width / imageSize.width) * 100}%`,
          height: `${(bbox.height / imageSize.height) * 100}%`,
          opacity: 1
      };
  };

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
                            Upload an image of your cattle to test our behavior recognition model.
                        </p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <Button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        >
                            Select File
                        </Button>
                    </div>
                ) : (
                    <div className="relative w-full h-full min-h-[300px] bg-black rounded-lg overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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

                        {/* RENDER ALL BOXES */}
                        {!isAnalyzing && detections.map((det, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }} // Staggered animation
                                style={getBoxStyle(det.bbox)}
                                className="absolute border-2 border-amber-500/80 rounded-lg flex flex-col justify-between p-1 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-500/10 transition-colors"
                            >
                                <div className="flex justify-between items-start -mt-6">
                                    <span className="bg-amber-600 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-t-sm shadow-sm">
                                        #{i+1} {det.class.toUpperCase()}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                        
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => { setFile(null); setDetections([]); setSummary(null); }}
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
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-red-500 mt-4 border border-red-900/50 p-2 bg-red-900/10 rounded">
                            <div className="flex items-center gap-2 font-bold">
                                <AlertCircle className="w-3 h-3" /> ERROR
                            </div>
                            <div className="pl-5 text-xs opacity-80">{error}</div>
                        </div>
                    )}

                    {!isAnalyzing && summary && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mt-4 p-4 border border-stone-800 bg-stone-900/50 rounded"
                        >
                            <div className="flex items-center gap-2 text-green-500 mb-2">
                                <CheckCircle2 className="w-4 h-4" /> SCAN COMPLETE
                            </div>
                            <div className="mt-4">
                                <div className="text-stone-500 text-xs">OBJECTS DETECTED</div>
                                <div className="text-3xl font-bold text-white mb-4">{summary.count} <span className="text-lg text-stone-500 font-normal">Cows</span></div>
                                
                                {/* Mini list of results */}
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                    {detections.map((d, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs border-b border-stone-800 pb-1">
                                            <span className="text-stone-300">#{i+1} {d.class.toUpperCase()}</span>
                                            <span className="text-amber-500">{d.confidence}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-2 border-t border-stone-800">
                                     <div className="text-stone-500 text-xs">HERD HEALTH</div>
                                     <div className="text-stone-300 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-green-500" /> 
                                        OPTIMAL - No anomalies.
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
    const features: FeatureItem[] = [
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
  const router = useRouter()

  return (
    <div className="bg-stone-950 min-h-screen text-stone-200 font-sans selection:bg-amber-600 selection:text-white overflow-x-hidden">
      
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-amber-600 origin-left z-[100]" style={{ scaleX }} />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-stone-950/80 backdrop-blur-md border-b border-stone-800/50">
          <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full border border-stone-600 bg-stone-800 grayscale flex items-center justify-center overflow-hidden">
                 <Image className="object-cover" width={40} height={40} src="/logo.jpeg" alt="Logo" />
               </div>
               <div className="flex flex-col">
                  <span className="font-bold tracking-tighter leading-none text-white">GAU SEVA</span>
                        </div>
          </div>
          
          <div className="hidden md:flex gap-8 font-mono text-xs tracking-widest text-stone-400">
              <a href="#monitor" className="hover:text-amber-500 transition-colors">[ MONITOR ]</a>
              <a href="#demo" className="hover:text-amber-500 transition-colors">[ DEMO ]</a>
              <a href="#network" className="hover:text-amber-500 transition-colors">[ NETWORK ]</a>
          </div>

          <div className="flex gap-4">
            <MagneticButton onClick={()=>{router.push('/dashboard')}} className="px-6 py-2 bg-amber-600 border border-amber-600 text-stone-950 rounded-full hover:bg-amber-500 transition-colors duration-300">
                <span className="font-bold text-xs">JOIN FREE</span>
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
               <p className="text-stone-400 max-w-2xl mx-auto">Upload a photo to see our behavior recognition model in real-time. (Demo Mode: Uses simulated inference)</p>
          </div>
          <div className="px-6">
            <InteractiveAIDemo />
          </div>
      </section>

      {/* SECTION: VET NETWORK */}
      <section id="network" className="px-6 py-32 bg-stone-950 border-t border-stone-900 relative overflow-hidden">
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
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 bg-stone-800/80 rounded flex items-center justify-center text-white"><Mic className="w-4 h-4" /></div>
                                        <div className="w-8 h-8 bg-stone-800/80 rounded flex items-center justify-center text-white"><Video className="w-4 h-4" /></div>
                                    </div>
                                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-900/50">
                                        <PhoneOff className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Decorative Background Elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl -z-10" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </div>
      </section>

      {/* Feature Stack (3D Cards) */}
      <section className="bg-stone-950">
        <div className="max-w-[90vw] mx-auto py-24 border-t border-stone-800">
            <h2 className="text-center text-stone-500 font-mono text-sm mb-12">SYSTEM_ARCHITECTURE_OVERVIEW</h2>
            <FeatureStack />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 border-t border-stone-800 py-12 px-6">
          <div className="max-w-[90vw] mx-auto flex flex-col md:flex-row justify-between items-center text-stone-500 text-sm">
              <div className="mb-4 md:mb-0">
                  &copy; {new Date().getFullYear()} GAU SEVA ENGINEERING.
              </div>
              <div className="flex gap-6 font-mono">
                  <a href="#" className="hover:text-amber-600">GITHUB</a>
                  <a href="#" className="hover:text-amber-600">DOCS</a>
                  <a href="#" className="hover:text-amber-600">CONTACT</a>
              </div>
          </div>
      </footer>
    </div>
  )
}
