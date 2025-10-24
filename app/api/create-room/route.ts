import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Generate a unique room name for Jitsi
    const roomName = `gauseva-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const roomUrl = `https://meet.jit.si/${roomName}`
    
    console.log('Created Jitsi room:', roomUrl)
    return NextResponse.json({ url: roomUrl })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ 
      error: 'Failed to create room' 
    }, { status: 500 })
  }
}
