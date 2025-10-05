import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const community = await db.community.findUnique({
      where: { slug },
      include: {
        owner: {
          select: { username: true },
        },
        members: {
          include: {
            user: {
              select: { username: true },
            },
          },
        },
        announcements: {
          include: {
            createdBy: {
              select: { username: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        events: {
          include: {
            _count: {
              select: { registrations: true },
            },
          },
          orderBy: { startsAt: 'asc' },
        },
        polls: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { members: true },
        },
      },
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    return NextResponse.json(community)
  } catch (error) {
    console.error('Error fetching community:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const community = await db.community.findUnique({
      where: { slug },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    const membership = community.members[0]
    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const updatedCommunity = await db.community.update({
      where: { slug },
      data: {
        name: body.name,
        description: body.description,
        isPublic: body.isPublic,
        joinPolicy: body.joinPolicy,
        requiresLightningAddress: body.requiresLightningAddress,
        requiresNostrPubkey: body.requiresNostrPubkey,
      },
    })

    return NextResponse.json(updatedCommunity)
  } catch (error) {
    console.error('Error updating community:', error)
    return NextResponse.json(
      { error: 'Failed to update community' },
      { status: 500 }
    )
  }
}
