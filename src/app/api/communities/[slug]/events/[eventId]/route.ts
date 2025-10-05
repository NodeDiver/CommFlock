import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; eventId: string }> }
) {
  try {
    const { slug, eventId } = await params

    // Find the event with community and registrations
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        community: {
          select: { slug: true, name: true },
        },
        createdBy: {
          select: { username: true },
        },
        registrations: {
          include: {
            user: {
              select: { username: true },
            },
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if community slug matches
    if (event.community.slug !== slug) {
      return NextResponse.json({ error: 'Event not found in this community' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
