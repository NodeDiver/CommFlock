import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Signup request body:', body)
    
    // Basic validation
    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate Lightning Address format (if provided)
    if (body.lightningAddress && !body.lightningAddress.includes('@') && !body.lightningAddress.startsWith('lnurl')) {
      return NextResponse.json(
        { error: 'Lightning address should be in format: yourname@domain.com or lnurl...' },
        { status: 400 }
      )
    }

    // Validate Nostr Pubkey format (if provided)
    if (body.nostrPubkey && !body.nostrPubkey.startsWith('npub1')) {
      return NextResponse.json(
        { error: 'Nostr public key should start with npub1' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username: body.username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Check if email already exists (if provided)
    if (body.email) {
      const existingEmail = await db.user.findUnique({
        where: { email: body.email },
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        username: body.username,
        email: body.email || null,
        hashedPassword,
        lightningAddress: body.lightningAddress || null,
        nostrPubkey: body.nostrPubkey || null,
      },
    })

    console.log('User created successfully:', user.id)

    // Return user data (without password)
    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        lightningAddress: user.lightningAddress,
        nostrPubkey: user.nostrPubkey,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
