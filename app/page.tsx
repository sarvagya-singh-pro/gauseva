'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Video, Brain, BookOpen, Camera, Wifi, Activity, Heart, Thermometer, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-lg z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Gau Seva
          </h1>
          <div className="hidden md:flex gap-6">
            <Link href="/learn" className="text-slate-300 hover:text-white transition-colors">Resources</Link>
            <Link href="/about" className="text-slate-300 hover:text-white transition-colors">About</Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/vet-dashboard" className="text-slate-300 hover:text-white transition-colors">Vet Dashboard</Link>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-800">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <span className="text-blue-400 text-sm font-semibold">
              Non-Profit Initiative
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight">
            <span className="text-blue-500">Gau Seva</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-slate-200 font-semibold max-w-4xl mx-auto leading-relaxed">
            24/7 Cattle Health Monitoring & Veterinary Care
          </p>
          
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            A community-driven platform providing real-time camera monitoring, IoT health sensors, 
            AI-powered diagnostics, and instant veterinary consultations. Completely free for all Indian dairy farmers.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-8">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-10 h-16 text-white font-semibold">
                Join Our Community
              </Button>
            </Link>
            <Link href="/learn">
              <Button size="lg" variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10 text-lg px-10 h-16 font-semibold">
                <BookOpen className="mr-3 h-6 w-6" />
                Learn More
              </Button>
            </Link>
          </div>

          <div className="pt-12">
            <p className="text-blue-400 text-sm font-semibold mb-4">100% FREE • NON-PROFIT • COMMUNITY SUPPORTED</p>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 text-slate-300">
                <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span>Live Camera Feed</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-300">
                <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span>IoT Sensors</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-300">
                <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span>AI Diagnostics</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-300">
                <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span>Vet Video Calls</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Vet Video Call Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
              <span className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                <Video className="h-4 w-4" />
                Expert Consultation
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Talk to a Vet<br />
              <span className="text-blue-500">Instantly via Video</span>
            </h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
              Connect with certified veterinarians in real-time through high-quality video calls. 
              Get expert diagnosis, treatment advice, and prescriptions without traveling. 
              Our volunteer vets can see your cattle through your camera feed and review AI-detected health alerts.
            </p>
            <ul className="space-y-4">
              {vetCallFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">{feature.title}</p>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6 backdrop-blur">
              <img src="/call.png" alt="Video consultation interface" className="w-full rounded-lg" />
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Live Camera Monitoring Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
              <span className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Live Monitoring
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Watch Your Herd<br />
              <span className="text-blue-500">24/7 from Anywhere</span>
            </h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
              Install cameras in your cattle shed and monitor your animals in real-time 
              through our dashboard. Our AI-powered system automatically detects cattle 
              behavior and alerts you to potential health issues.
            </p>
            <ul className="space-y-4">
              {cameraFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">{feature.title}</p>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6 backdrop-blur">
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                <img 
                  src="/demo.jpg" 
                  alt="Live camera feed showing cattle monitoring"
                  className="w-full h-full object-cover opacity-70"
                />
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* IoT Collar Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 p-8 backdrop-blur">
              <div className="flex justify-center mb-6">
                <img src="/collar.png" alt="Smart collar device" className="max-w-xs" />
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-4">
                Gau Seva Smart Collar
              </h3>
              <p className="text-slate-300 text-center mb-6">
                IoT-enabled health monitoring device with real-time vital sign tracking
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {collarSpecs.map((spec, i) => (
                  <div key={i} className="bg-slate-800/50 p-4 rounded-lg">
                    <spec.icon className="h-6 w-6 text-blue-400 mb-2" />
                    <p className="text-white font-semibold text-sm">{spec.label}</p>
                    <p className="text-slate-400 text-xs">{spec.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2"
          >
            <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
              <span className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                IoT Technology
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Smart Collar with<br />
              <span className="text-blue-500">Real-Time Sensors</span>
            </h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
              Each cattle wears a lightweight, waterproof smart collar that continuously 
              monitors vital signs and transmits data wirelessly to your dashboard. 
              Early detection of health issues can save lives and reduce veterinary costs.
            </p>
            <div className="space-y-4">
              <Card className="bg-slate-800/30 border-slate-700 p-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Heart Rate Monitoring</h4>
                    <p className="text-slate-400 text-sm">
                      Continuous heart rate tracking with abnormality detection and instant alerts
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-slate-800/30 border-slate-700 p-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Thermometer className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Temperature Tracking</h4>
                    <p className="text-slate-400 text-sm">
                      Body temperature monitoring to detect fever and infections early
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-slate-800/30 border-slate-700 p-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Activity Analysis</h4>
                    <p className="text-slate-400 text-sm">
                      Movement patterns, rumination, and behavior analysis for health insights
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Diagnostics Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <span className="text-blue-400 text-sm font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI-Powered
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Advanced AI Disease Detection
          </h2>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Our machine learning models analyze data from cameras and IoT sensors to detect 
            early signs of diseases and health issues before they become critical.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {aiFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 p-8 h-full backdrop-blur hover:border-blue-500/50 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.diseases.map((disease, j) => (
                    <li key={j} className="text-sm text-slate-500 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                      {disease}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Platform Features */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
          Complete Cattle Care Platform
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {platformFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 p-8 h-full backdrop-blur hover:border-blue-500/50 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="bg-slate-800/50 border-slate-700 p-12 text-center backdrop-blur">
          <h2 className="text-4xl font-bold text-white mb-4">
            Join Our Mission
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Help us build a healthier future for cattle across India. 
            Gau Seva is a non-profit initiative providing free veterinary care technology to all farmers.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-slate-600 text-black hover:bg-slate-800 text-lg px-8">
                About Our Mission
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">
                Gau Seva
              </h3>
              <p className="text-slate-400 text-sm mb-2">
                A non-profit initiative empowering dairy farmers with technology.
              </p>
              <p className="text-blue-400 text-xs font-semibold">100% Free • Community Driven</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-slate-400 hover:text-blue-400 text-sm">Dashboard</Link></li>
                <li><Link href="/learn" className="text-slate-400 hover:text-blue-400 text-sm">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-slate-400 hover:text-blue-400 text-sm">Our Mission</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <p className="text-slate-400 text-sm mb-2">Contact via platform</p>
              <p className="text-slate-400 text-sm">Available in:</p>
              <p className="text-blue-400 text-sm font-semibold">English</p>
            </div>
          </div>
          <div className="text-center text-slate-400 text-sm mt-8 pt-8 border-t border-slate-800">
            © 2025 Gau Seva. A non-profit initiative. Built with care for Indian dairy farmers.
          </div>
        </div>
      </footer>
    </div>
  )
}

const vetCallFeatures = [
  {
    title: "Instant Video Connection",
    description: "Connect with volunteer expert vets via high-quality video calls"
  },
  {
    title: "Screen Share Camera Feed",
    description: "Share live camera feed from your shed so vets can see your cattle directly"
  },
  {
    title: "AI Report Integration",
    description: "Vets receive AI-detected health alerts and vital signs data during the call"
  },
  {
    title: "Digital Prescriptions",
    description: "Get treatment plans and prescriptions sent directly to your dashboard"
  }
]

const cameraFeatures = [
  {
    title: "Behavior Detection",
    description: "AI identifies lying, standing, eating, and abnormal behaviors automatically"
  },
  {
    title: "24/7 Recording",
    description: "Cloud storage with history and instant playback"
  },
  {
    title: "Multi-Camera Support",
    description: "Monitor multiple sheds and locations from a single dashboard"
  },
  {
    title: "Instant Alerts",
    description: "Get notified when unusual activity is detected"
  }
]

const collarSpecs = [
  { icon: Heart, label: "Heart Rate", value: "Real-time tracking" },
  { icon: Thermometer, label: "Temperature", value: "Continuous monitoring" },
  { icon: Activity, label: "Activity", value: "Movement analysis" },
  { icon: Wifi, label: "Connectivity", value: "Wireless sync" }
]

const aiFeatures = [
  {
    icon: Activity,
    title: "Early Detection",
    description: "Machine learning models identify health issues early for timely intervention",
    diseases: ["Mastitis", "Lameness", "Respiratory Issues"]
  },
  {
    icon: Brain,
    title: "Pattern Analysis",
    description: "Analyze behavior patterns and vital signs to detect anomalies",
    diseases: ["Heat Stress", "Digestive Issues", "Behavioral Changes"]
  },
  {
    icon: CheckCircle2,
    title: "Smart Alerts",
    description: "Prioritized notifications with recommended actions",
    diseases: ["Fever Detection", "Movement Changes", "Feed Patterns"]
  }
]

const platformFeatures = [
  {
    icon: Video,
    title: "Video Consultations",
    description: "Connect with volunteer certified veterinarians through high-quality video calls for immediate expert guidance."
  },
  {
    icon: BookOpen,
    title: "Educational Hub",
    description: "Access comprehensive articles and resources on cattle health, nutrition, and breeding practices."
  },
  {
    icon: Activity,
    title: "Farm Analytics",
    description: "Track health trends and herd performance with detailed insights and recommendations."
  }
]
