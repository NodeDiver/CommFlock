import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
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
          include: {
            user: {
              select: { username: true },
            },
          },
        },
      },
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Check if user is admin/owner
    const userMembership = community.members.find(m => m.userId === session.user.id)
    if (!userMembership || !['OWNER', 'ADMIN'].includes(userMembership.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(community.members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
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

    const body = await request.json()
    const { userId, status, points, role } = body

    const { slug } = await params
    const community = await db.community.findUnique({
      where: { slug },
      include: {
        members: true,
      },
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Check if user is admin/owner
    const userMembership = community.members.find(m => m.userId === session.user.id)
    if (!userMembership || !['OWNER', 'ADMIN'].includes(userMembership.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if target member exists
    const targetMembership = community.members.find(m => m.userId === userId)
    if (!targetMembership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Update membership
    const updateData: any = {}
    if (status) updateData.status = status
    if (points !== undefined) updateData.points = points
    if (role) updateData.role = role

    const updatedMembership = await db.communityMember.update({
      where: {
        userId_communityId: {
          userId,
          communityId: community.id,
        },
      },
      data: updateData,
      include: {
        user: {
          select: { username: true },
        },
      },
    })

    return NextResponse.json(updatedMembership)
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}
