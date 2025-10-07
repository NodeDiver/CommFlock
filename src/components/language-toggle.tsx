"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");

  const switchLocale = (newLocale: string) => {
    // Get current path from browser
    const currentPath = window.location.pathname;

    console.log("🔍 LanguageToggle - Current path:", currentPath);
    console.log("🔍 LanguageToggle - Current locale:", locale);
    console.log("🔍 LanguageToggle - Switching to:", newLocale);

    // Replace the locale in the current path
    // Current path will be like /en/discover or /es or /en
    const pathWithoutLocale = currentPath.replace(/^\/(en|es)/, "") || "/";
    const newUrl = `/${newLocale}${pathWithoutLocale}`;

    console.log("🔍 LanguageToggle - Path without locale:", pathWithoutLocale);
    console.log("🔍 LanguageToggle - Navigating to:", newUrl);

    // Navigate to the same path but with new locale
    window.location.href = newUrl;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="hover-lift hover-scale animate-bounce"
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchLocale("en")}
          className={locale === "en" ? "bg-accent" : ""}
        >
          {t("english")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale("es")}
          className={locale === "es" ? "bg-accent" : ""}
        >
          {t("spanish")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
