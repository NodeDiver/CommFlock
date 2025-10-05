"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')

  const switchLocale = (newLocale: string) => {
    console.log('🔍 LanguageToggle - Switching from', locale, 'to', newLocale)
    
    // Simple approach: just navigate to the root with new locale
    window.location.href = `/${newLocale}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="hover-lift hover-scale animate-bounce">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => switchLocale("en")}
          className={locale === "en" ? "bg-accent" : ""}
        >
          {t('english')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLocale("es")}
          className={locale === "es" ? "bg-accent" : ""}
        >
          {t('spanish')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
