'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, Timestamp } from 'firebase/firestore'

const STEPS = [
  { id: 1, title: 'Account', description: 'Create your login credentials' },
  { id: 2, title: 'Personal', description: 'Tell us about yourself' },
  { id: 3, title: 'Professional', description: 'Your veterinary credentials' },
  { id: 4, title: 'Confirm', description: 'Review and submit' }
]

export default function VetSignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    registrationNumber: '',
    qualification: '',
    specialization: '',
    experience: '',
    clinicName: '',
    clinicAddress: '',
    city: '',
    state: '',
    languages: 'English',
    bio: '',
    availability: 'flexible',
    agreedToTerms: false,
    agreedToVolunteer: false
  })

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateStep = () => {
    setError('')
    
    switch (currentStep) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all fields')
          return false
        }
        if (!formData.email.includes('@')) {
          setError('Please enter a valid email')
          return false
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return false
        }
        break
      
      case 2:
        if (!formData.fullName || !formData.phone) {
          setError('Please fill in all required fields')
          return false
        }
        if (formData.phone.length < 10) {
          setError('Please enter a valid phone number')
          return false
        }
        break
      
      case 3:
        if (!formData.registrationNumber || !formData.qualification || !formData.experience || !formData.city || !formData.state) {
          setError('Please fill in all required professional details')
          return false
        }
        break
      
      case 4:
        if (!formData.agreedToTerms || !formData.agreedToVolunteer) {
          setError('Please agree to both terms and volunteer program')
          return false
        }
        break
    }
    
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setLoading(true)
    setError('')

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: formData.email,
        name: formData.fullName,
        phone: formData.phone,
        role: 'doctor',
        registrationNumber: formData.registrationNumber,
        qualification: formData.qualification,
        specialization: formData.specialization || '',
        experience: formData.experience,
        clinicName: formData.clinicName || '',
        clinicAddress: formData.clinicAddress || '',
        city: formData.city,
        state: formData.state,
        languages: formData.languages,
        bio: formData.bio || '',
        availability: formData.availability,
        available: true,
        verified: false,
        active: true,
        checkup: [],
        meeting: [],
        requests: [],
        unavailable_dates: [],
        createdAt: Timestamp.now()
      })

      router.push('/vet-dashboard')
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered')
      } else {
        setError(err.message || 'Failed to create account')
      }
      setLoading(false)
    }
  }

  const progress = (currentStep / 4) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">GauSeva</span>
          </Link>
          <p className="text-slate-400">Veterinary Professional Registration</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
          <CardHeader className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white font-semibold">Step {currentStep} of 4</span>
                <span className="text-slate-400">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`text-center p-2 rounded-lg transition-all ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : currentStep > step.id
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-slate-900/50 text-slate-500'
                  }`}
                >
                  <div className="font-bold text-lg">{step.id}</div>
                  <div className="text-xs">{step.title}</div>
                </div>
              ))}
            </div>

            <div>
              <CardTitle className="text-2xl text-white">{STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription className="text-slate-400">{STEPS[currentStep - 1].description}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Account */}
             {/* Step 1: Account - Fixed white text */}
{currentStep === 1 && (
  <motion.div
    key="step1"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
    <div className="space-y-2">
      <Label htmlFor="email" className="text-white">Email Address *</Label>
      <Input
        id="email"
        type="email"
        placeholder="doctor@example.com"
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="password" className="text-white">Password *</Label>
      <Input
        id="password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Minimum 6 characters"
        value={formData.password}
        onChange={(e) => updateField('password', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
      <Input
        id="confirmPassword"
        type={showPassword ? 'text' : 'password'}
        placeholder="Re-enter password"
        value={formData.confirmPassword}
        onChange={(e) => updateField('confirmPassword', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      />
    </div>

    <div className="flex items-center space-x-2">
    <div className="flex items-center space-x-2">
  <Checkbox
    id="showPassword"
    checked={showPassword}
    onCheckedChange={(checked) => setShowPassword(checked === true)}
    className="border-slate-600"
  />
  <label htmlFor="showPassword" className="text-sm text-slate-300 cursor-pointer">
    Show password
  </label>
</div>

      <label htmlFor="showPassword" className="text-sm text-slate-300 cursor-pointer">
        Show password
      </label>
    </div>
  </motion.div>
)}

{/* Step 2: Personal - Fixed white text */}
{currentStep === 2 && (
  <motion.div
    key="step2"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
    <div className="space-y-2">
      <Label htmlFor="fullName" className="text-white">Full Name *</Label>
      <Input
        id="fullName"
        placeholder="Dr. John Doe"
        value={formData.fullName}
        onChange={(e) => updateField('fullName', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="phone" className="text-white">Phone Number *</Label>
      <Input
        id="phone"
        type="tel"
        placeholder="+91 9876543210"
        value={formData.phone}
        onChange={(e) => updateField('phone', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      />
    </div>
  </motion.div>
)}

{/* Step 3: Professional - Fixed white text */}
{currentStep === 3 && (
  <motion.div
    key="step3"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="registrationNumber" className="text-white">Registration Number *</Label>
        <Input
          id="registrationNumber"
          placeholder="VET123456"
          value={formData.registrationNumber}
          onChange={(e) => updateField('registrationNumber', e.target.value)}
          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience" className="text-white">Experience (Years) *</Label>
        <Input
          id="experience"
          type="number"
          placeholder="5"
          value={formData.experience}
          onChange={(e) => updateField('experience', e.target.value)}
          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="qualification" className="text-white">Qualification *</Label>
      <Input
        id="qualification"
        placeholder="B.V.Sc & AH, M.V.Sc"
        value={formData.qualification}
        onChange={(e) => updateField('qualification', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="specialization" className="text-white">Specialization</Label>
      <Input
        id="specialization"
        placeholder="Large Animals, Surgery, etc."
        value={formData.specialization}
        onChange={(e) => updateField('specialization', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="clinicName" className="text-white">Clinic/Hospital Name</Label>
      <Input
        id="clinicName"
        placeholder="City Veterinary Clinic"
        value={formData.clinicName}
        onChange={(e) => updateField('clinicName', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="clinicAddress" className="text-white">Clinic Address</Label>
      <Textarea
        id="clinicAddress"
        placeholder="123 Main Street, Sector 4"
        value={formData.clinicAddress}
        onChange={(e) => updateField('clinicAddress', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        rows={2}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="city" className="text-white">City *</Label>
        <Input
          id="city"
          placeholder="Mumbai"
          value={formData.city}
          onChange={(e) => updateField('city', e.target.value)}
          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="state" className="text-white">State *</Label>
        <Input
          id="state"
          placeholder="Maharashtra"
          value={formData.state}
          onChange={(e) => updateField('state', e.target.value)}
          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>
    </div>
  </motion.div>
)}

{/* Step 4: Confirm - Fixed white text */}
{currentStep === 4 && (
  <motion.div
    key="step4"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
    <div className="space-y-2">
      <Label htmlFor="languages" className="text-white">Languages Spoken</Label>
      <Input
        id="languages"
        placeholder="English, Hindi, Marathi"
        value={formData.languages}
        onChange={(e) => updateField('languages', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="availability" className="text-white">Availability</Label>
      <Select value={formData.availability} onValueChange={(value) => updateField('availability', value)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700">
          <SelectItem value="flexible" className="text-white hover:bg-slate-800">Flexible - I can adjust my schedule</SelectItem>
          <SelectItem value="weekdays" className="text-white hover:bg-slate-800">Weekdays Only</SelectItem>
          <SelectItem value="weekends" className="text-white hover:bg-slate-800">Weekends Only</SelectItem>
          <SelectItem value="emergency" className="text-white hover:bg-slate-800">Emergency Cases Only</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="bio" className="text-white">Brief Bio</Label>
      <Textarea
        id="bio"
        placeholder="Share your experience and approach..."
        value={formData.bio}
        onChange={(e) => updateField('bio', e.target.value)}
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        rows={3}
      />
    </div>

    <div className="space-y-4 pt-4">
      <div className="flex items-start space-x-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <Checkbox
          id="agreedToVolunteer"
          checked={formData.agreedToVolunteer}
          onCheckedChange={(checked) => updateField('agreedToVolunteer', checked)}
          className="border-slate-600"
        />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="agreedToVolunteer" className="text-sm text-white cursor-pointer leading-relaxed">
            I understand this is a <strong className="text-blue-400">volunteer program</strong> to provide free veterinary services to farmers. I commit to providing quality care.
          </label>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox
          id="agreedToTerms"
          checked={formData.agreedToTerms}
          onCheckedChange={(checked) => updateField('agreedToTerms', checked)}
          className="border-slate-600"
        />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="agreedToTerms" className="text-sm text-white cursor-pointer">
            I agree to the <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
          </label>
        </div>
      </div>
    </div>
  </motion.div>
)}

            </AnimatePresence>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 border-slate-700"
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
