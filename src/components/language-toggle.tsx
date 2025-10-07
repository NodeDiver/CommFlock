"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("common");

  const switchLocale = (newLocale: string) => {
    // Get current path from browser
    const currentPath = window.location.pathname;

    logger.info("LanguageToggle switching locale", {
      currentPath,
      currentLocale: locale,
      newLocale,
    });

    // Replace the locale in the current path
    // Current path will be like /en/discover or /es or /en
    const pathWithoutLocale = currentPath.replace(/^\/(en|es)/, "") || "/";
    const newUrl = `/${newLocale}${pathWithoutLocale}`;

    logger.info("LanguageToggle navigating", {
      pathWithoutLocale,
      newUrl,
    });

    // Navigate to the same path but with new locale
    window.location.href = newUrl;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          data-testid="language-toggle"
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
