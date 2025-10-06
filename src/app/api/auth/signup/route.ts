import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcrypt'
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply strict rate limiting (3 per hour)
  const identifier = getIdentifier(request)
  const rateLimitResult = await checkRateLimit(identifier, 'strict')

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many signup attempts. Please try again later.',
        retryAfter: new Date(rateLimitResult.reset).toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': Math.ceil(
            (rateLimitResult.reset - Date.now()) / 1000
          ).toString(),
        },
      }
    )
  }

  try {
    const body = await request.json()
    // Security: Don't log passwords or sensitive data
    console.log('Signup request:', {
      username: body.username,
      email: body.email || '(not provided)',
      hasLightningAddress: !!body.lightningAddress,
      hasNostrPubkey: !!body.nostrPubkey
    })
    
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
    // Security: Don't expose internal error details to client
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
