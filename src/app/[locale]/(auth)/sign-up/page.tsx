'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SignUpPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [lightningAddress, setLightningAddress] = useState('')
  const [nostrPubkey, setNostrPubkey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    // Validate Lightning Address format (if provided)
    if (lightningAddress && !lightningAddress.includes('@') && !lightningAddress.startsWith('lnurl')) {
      setError('Lightning address should be in format: yourname@domain.com or lnurl...')
      return
    }
    
    // Validate Nostr Pubkey format (if provided)
    if (nostrPubkey && !nostrPubkey.startsWith('npub1')) {
      setError('Nostr public key should start with npub1')
      return
    }

    setIsLoading(true)

    try {
      // Create new user account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email: email || undefined,
          password,
          lightningAddress: lightningAddress || undefined,
          nostrPubkey: nostrPubkey || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Account created successfully, now sign in
        const result = await signIn('credentials', {
          username,
          password,
          redirect: false,
        })

        if (result?.ok) {
          router.push(`/${locale}/discover`)
        } else {
          setError('Account created but sign in failed. Please try signing in manually.')
        }
      } else {
        setError(data.error || 'Sign up failed')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join CommFlock</CardTitle>
          <CardDescription>
            Create your account to start building communities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="username">{t('forms.username')}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose a username"
              />
            </div>
            <div>
              <Label htmlFor="email">{t('forms.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email (optional)"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Choose a password"
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>
            
            <div>
              <Label htmlFor="lightningAddress">{t('forms.lightningAddress')}</Label>
              <Input
                id="lightningAddress"
                type="text"
                value={lightningAddress}
                onChange={(e) => setLightningAddress(e.target.value)}
                placeholder="yourname@domain.com or lnurl..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Lightning address for receiving payments
              </p>
            </div>
            
            <div>
              <Label htmlFor="nostrPubkey">{t('forms.nostrPubkey')}</Label>
              <Input
                id="nostrPubkey"
                type="text"
                value={nostrPubkey}
                onChange={(e) => setNostrPubkey(e.target.value)}
                placeholder="npub1..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Nostr public key for decentralized identity
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href={`/${locale}/sign-in`} className="text-blue-600 hover:underline font-medium">
                Sign in here
              </Link>
            </p>
            <Link href="/" className="text-sm text-gray-500 hover:underline">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
