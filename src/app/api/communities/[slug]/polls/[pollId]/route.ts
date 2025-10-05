import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; pollId: string }> }
) {
  try {
    const { slug, pollId } = await params

    // Find the poll with community and votes
    const poll = await db.poll.findUnique({
      where: { id: pollId },
      include: {
        community: {
          select: { slug: true, name: true },
        },
        createdBy: {
          select: { username: true },
        },
        votes: {
          include: {
            user: {
              select: { username: true },
            },
          },
        },
      },
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Check if community slug matches
    if (poll.community.slug !== slug) {
      return NextResponse.json({ error: 'Poll not found in this community' }, { status: 404 })
    }

    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    )
  }
}
