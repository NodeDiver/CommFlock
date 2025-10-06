'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'

export function Footer() {
  const t = useTranslations('common')
  const tNav = useTranslations('nav')
  const locale = useLocale()

  return (
    <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm animate-fade-in-up delay-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image 
                src="/logo.svg" 
                alt="CommFlock" 
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                CommFlock
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('communityPlatform')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {tNav('quickLinks')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href={`/${locale}/discover`} 
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t('exploreCommunities')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/create`} 
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t('createCommunity')}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-float">
            {t('copyright')} 💜
          </p>
        </div>
      </div>
    </footer>
  )
}
