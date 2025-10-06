import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Load messages manually to avoid getRequestConfig issues
  const messages = (await import(`../../../messages/${locale}.json`)).default
  const t = (key: string) => messages.common[key]
  const tNav = (key: string) => messages.nav[key]

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 animate-gradient">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 animate-fade-in-up delay-200">
            {t('buildCommunities')}{' '}
            <span className="text-indigo-600 dark:text-indigo-400 gradient-text animate-glow delay-300">
              {t('lightningSpeed')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 animate-fade-in-up delay-400 text-shadow">
            {t('communityPlatform')} 🚀
          </p>
              <div className="flex justify-center space-x-4 animate-fade-in-up delay-500">
                <Link href={`/${locale}/create`}>
                  <Button size="lg" className="px-8 hover-lift hover-glow animate-pulse">
                    {t('createCommunity')} ⚡
                  </Button>
                </Link>
                <Link href={`/${locale}/discover`}>
                  <Button size="lg" variant="outline" className="px-8 hover-lift hover-scale">
                    {t('exploreCommunities')} 🔍
                  </Button>
                </Link>
              </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card className="hover-lift animate-fade-in-left delay-600 hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ {t('lightningPayments')}
              </CardTitle>
              <CardDescription>
                {t('lightningDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('lightningDetails')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in delay-700 hover-rotate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏢 {t('multiTenant')}
              </CardTitle>
              <CardDescription>
                {t('multiTenantDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('multiTenantDetails')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-fade-in-right delay-800 hover-wobble">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎪 {t('eventsPolls')}
              </CardTitle>
              <CardDescription>
                {t('eventsPollsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('eventsPollsDetails')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
