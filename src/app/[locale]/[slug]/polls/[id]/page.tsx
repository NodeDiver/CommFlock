'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface PollOption {
  key: string
  label: string
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  endsAt: string | null
  visibleVotes: boolean
  createdAt: string
  community: {
    slug: string
    name: string
  }
  createdBy: {
    username: string
  }
  votes: Array<{
    id: string
    optionKey: string
    createdAt: string
    user: {
      username: string
    }
  }>
}

export default function PollPage() {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const t = useTranslations()

  const slug = params.slug as string
  const pollId = params.id as string

  useEffect(() => {
    fetchPoll()
  }, [slug, pollId])

  const fetchPoll = async () => {
    try {
      const response = await fetch(`/api/communities/${slug}/polls/${pollId}`)
      if (!response.ok) {
        toast.error('Poll not found')
        router.push(`/${slug}/dashboard`)
        return
      }
      setPoll(await response.json())
    } catch (error) {
      console.error('Error fetching poll:', error)
      toast.error('Failed to load poll')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async (optionKey: string) => {
    if (!session) {
      toast.error('Please sign in to vote')
      return
    }

    setIsVoting(true)
    try {
      const response = await fetch(`/api/communities/${slug}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionKey }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Vote submitted successfully!')
        fetchPoll() // Refresh poll data
      } else {
        toast.error(data.error || 'Failed to submit vote')
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Failed to submit vote')
    } finally {
      setIsVoting(false)
    }
  }

  const hasVoted = poll?.votes.some(v => v.user.username === session?.user?.username)
  const userVote = poll?.votes.find(v => v.user.username === session?.user?.username)

  // Calculate vote counts
  const voteCounts = poll?.options.reduce((acc, option) => {
    acc[option.key] = poll.votes.filter(v => v.optionKey === option.key).length
    return acc
  }, {} as Record<string, number>) || {}

  const totalVotes = poll?.votes.length || 0

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading poll...</div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Poll Not Found</h1>
          <Button onClick={() => router.push(`/${slug}/dashboard`)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const isExpired = poll.endsAt && new Date(poll.endsAt) < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{poll.question}</h1>
              <p className="text-gray-600 mt-1">
                in {poll.community.name}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isExpired && <Badge variant="secondary">Expired</Badge>}
              <Button onClick={() => router.push(`/${slug}/dashboard`)}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Poll Options</CardTitle>
                  <CardDescription>
                    {totalVotes} total votes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {poll.options.map((option) => {
                    const votes = voteCounts[option.key] || 0
                    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
                    const isSelected = userVote?.optionKey === option.key

                    return (
                      <div key={option.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-sm text-gray-500">
                            {votes} votes ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        {hasVoted && (
                          <div className="flex justify-between items-center">
                            {!session || hasVoted ? (
                              <span className="text-sm text-gray-500">
                                {isSelected && '✓ Your vote'}
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleVote(option.key)}
                                disabled={isVoting || isExpired}
                              >
                                {t('actions.vote')}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {poll.visibleVotes && hasVoted && (
                <Card>
                  <CardHeader>
                    <CardTitle>Voters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {poll.options.map((option) => {
                        const optionVotes = poll.votes.filter(v => v.optionKey === option.key)
                        return (
                          <div key={option.key}>
                            <h4 className="font-medium mb-2">{option.label}</h4>
                            <div className="flex flex-wrap gap-2">
                              {optionVotes.map((vote) => (
                                <Badge key={vote.id} variant="outline">
                                  {vote.user.username}
                                </Badge>
                              ))}
                              {optionVotes.length === 0 && (
                                <span className="text-gray-500 text-sm">No votes yet</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Poll Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Created by:</span>
                    <span className="font-medium">{poll.createdBy.username}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Created:</span>
                    <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                  </div>
                  {poll.endsAt && (
                    <div className="flex justify-between text-sm">
                      <span>Ends:</span>
                      <span>{new Date(poll.endsAt).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Total votes:</span>
                    <span>{totalVotes}</span>
                  </div>
                </CardContent>
              </Card>

              {!hasVoted && !isExpired && session && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cast Your Vote</CardTitle>
                    <CardDescription>
                      Select an option to vote
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {poll.options.map((option) => (
                      <Button
                        key={option.key}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleVote(option.key)}
                        disabled={isVoting}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {!session && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sign In to Vote</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => router.push('/sign-in')} className="w-full">
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
