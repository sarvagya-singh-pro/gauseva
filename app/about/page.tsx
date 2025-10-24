'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, Heart, Users, Target, Sparkles, Video, 
  Brain, Camera, Activity, Phone, Mail, MapPin
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import PublicNavbar from '@/components/Navbar'

export default function AboutPage() {
  const features = [
    {
      icon: Camera,
      title: 'Live Monitoring',
      description: 'Watch your cattle 24/7 with AI-powered camera systems that detect behavioral changes and health issues.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Activity,
      title: 'IoT Health Sensors',
      description: 'Smart collars track vital signs including heart rate, temperature, and activity levels in real-time.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Brain,
      title: 'AI Diagnostics',
      description: 'Machine learning models detect diseases early, enabling timely intervention and better outcomes.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Video,
      title: 'Vet Consultations',
      description: 'Connect with certified volunteer veterinarians via video call for immediate expert guidance.',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative max-w-7xl mx-auto px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-6">
                Non-Profit Initiative
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                About <span className="text-blue-500">GauSeva</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                A community-driven platform empowering Indian dairy farmers with cutting-edge technology 
                to monitor cattle health and access free veterinary care.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                To democratize access to advanced cattle health monitoring and veterinary care for every 
                farmer in India, regardless of their location or economic status.
              </p>
              <p className="text-slate-300 leading-relaxed">
                We believe that technology should serve those who need it most. By combining IoT sensors, 
                AI diagnostics, and volunteer veterinarians, we're building a sustainable ecosystem where 
                cattle health is no longer a luxury but a fundamental right.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                A future where no cattle suffers from preventable diseases, and every farmer has the tools 
                to ensure their herd's wellbeing through technology and community support.
              </p>
              <p className="text-slate-300 leading-relaxed">
                We envision a network of empowered farmers connected to expert veterinarians, using 
                AI-powered early detection systems to prevent diseases before they spread, ultimately 
                improving both animal welfare and farmer livelihoods across India.
              </p>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How GauSeva Works</h2>
            <p className="text-slate-400 text-lg">Four simple steps to better cattle health</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 p-6 h-full">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Free? */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                <Heart className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Why 100% Free?</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  GauSeva is a <strong className="text-white">non-profit initiative</strong> built on the 
                  principle that every farmer deserves access to quality veterinary care. We don't charge 
                  farmers because we believe technology should empower, not create barriers.
                </p>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Our volunteer veterinarians donate their time and expertise to help the community. 
                  Our platform is funded through grants, donations, and partnerships with agricultural 
                  organizations who share our vision.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Shield className="h-3 w-3 mr-1" />
                    100% Free for Farmers
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <Users className="h-3 w-3 mr-1" />
                    Volunteer-Driven
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-slate-400 text-lg">We'd love to hear from you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <Mail className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">Email</p>
              <p className="text-slate-400 text-sm">Contact via platform</p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <Phone className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">Support</p>
              <p className="text-slate-400 text-sm">In-app messaging</p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <MapPin className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">Serving</p>
              <p className="text-slate-400 text-sm">Across India</p>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Join Our Mission</h3>
            <p className="text-slate-300 mb-6">
              Whether you're a farmer, veterinarian, or supporter, there's a place for you in the GauSeva community.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Users className="mr-2 h-4 w-4" />
                  Join as Farmer
                </Button>
              </Link>
              <Link href="/auth/vet-signup">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Heart className="mr-2 h-4 w-4" />
                  Volunteer as Vet
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </>
  )
}
