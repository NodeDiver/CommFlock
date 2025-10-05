import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { voteSchema } from '@/lib/validators'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; pollId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { optionKey } = voteSchema.parse(body)

    const { slug, pollId } = await params

    // Find the poll
    const poll = await db.poll.findUnique({
      where: { id: pollId },
      include: {
        community: true,
        votes: true,
      },
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Check if poll has ended
    if (poll.endsAt && new Date(poll.endsAt) < new Date()) {
      return NextResponse.json({ error: 'Poll has ended' }, { status: 400 })
    }

    // Check if option exists
    const options = poll.options as Array<{ key: string; label: string }>
    if (!options.some(opt => opt.key === optionKey)) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 })
    }

    // Check if user has already voted
    const existingVote = poll.votes.find(v => v.userId === session.user.id)
    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 400 })
    }

    // Check if user is a member of the community
    const membership = await db.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: poll.communityId,
        },
      },
    })

    if (!membership || membership.status !== 'APPROVED') {
      return NextResponse.json({ error: 'You must be a member of this community' }, { status: 403 })
    }

    // Create vote
    const vote = await db.pollVote.create({
      data: {
        pollId: poll.id,
        userId: session.user.id,
        optionKey,
      },
      include: {
        user: {
          select: { username: true },
        },
      },
    })

    return NextResponse.json(vote, { status: 201 })
  } catch (error) {
    console.error('Error voting:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid vote data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
