'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from 'lucide-react'

export function Header() {
  const tNav = useTranslations('nav')
  const locale = useLocale()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}` })
  }

  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm animate-fade-in-down sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href={`/${locale}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.svg" 
            alt="CommFlock" 
            width={40}
            height={40}
            className="h-10 w-10 hover-scale animate-bounce delay-200"
          />
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 hover-scale">
            CommFlock
          </h1>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link href={`/${locale}/discover`}>
            <Button variant="ghost" className="hover-lift delay-300">
              {tNav('discover')} 🔍
            </Button>
          </Link>
          <Link href={`/${locale}/create`}>
            <Button variant="outline" className="hover-glow delay-400">
              {tNav('create')} ✨
            </Button>
          </Link>
          {!session && (
            <Link href={`/${locale}/sign-in`}>
              <Button className="hover-lift animate-pulse delay-500">
                {tNav('signIn')} 👤
              </Button>
            </Link>
          )}
        </nav>

        {/* Theme, Language, and User Toggles */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <LanguageToggle />
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover-lift">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  {tNav('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/${locale}/discover`}>
              <Button variant="ghost" size="sm" className="hover-lift">
                {tNav('discover')} 🔍
              </Button>
            </Link>
            <Link href={`/${locale}/create`}>
              <Button variant="outline" size="sm" className="hover-glow">
                {tNav('create')} ✨
              </Button>
            </Link>
            {!session && (
              <Link href={`/${locale}/sign-in`}>
                <Button size="sm" className="hover-lift">
                  {tNav('signIn')} 👤
                </Button>
              </Link>
            )}
          </div>
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover-lift">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  {tNav('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
