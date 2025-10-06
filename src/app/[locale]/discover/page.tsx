'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  isPublic: boolean
  joinPolicy: string
  createdAt: string
  owner: {
    username: string
  }
  _count: {
    members: number
  }
}

export default function DiscoverPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()
  const t = useTranslations()
  const locale = useLocale()

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async (searchTerm = '') => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      
      const response = await fetch(`/api/communities?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setCommunities(data.communities)
      }
    } catch (error) {
      console.error('Error fetching communities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCommunities(search)
  }

  const joinPolicyLabels = {
    AUTO_JOIN: t('community.join.auto'),
    APPROVAL_REQUIRED: t('community.join.approval'),
    CLOSED: t('community.join.closed'),
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading communities...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Communities
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find and join communities that interest you
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search communities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </div>
        </form>

        {/* Communities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Card key={community.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{community.name}</CardTitle>
                  <Badge variant={community.isPublic ? 'default' : 'secondary'}>
                    {community.isPublic ? t('community.public') : t('community.private')}
                  </Badge>
                </div>
                <CardDescription>
                  by {community.owner.username}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {community.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{community._count.members} members</span>
                  <Badge variant="outline">
                    {joinPolicyLabels[community.joinPolicy as keyof typeof joinPolicyLabels]}
                  </Badge>
                </div>
                <div className="mt-4">
                  <Link href={`/${locale}/${community.slug}`}>
                    <Button className="w-full">View Community</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {communities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No communities found</p>
            {session && (
              <Link href={`/${locale}/create`}>
                <Button>Create First Community</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
