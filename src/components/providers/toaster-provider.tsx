"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

/**
 * Toast notification provider
 * Wraps the app with Sonner toast notifications
 */
export function ToasterProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme as "light" | "dark" | "system"}
      position="bottom-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        classNames: {
          error: "border-red-500",
          success: "border-green-500",
          warning: "border-yellow-500",
          info: "border-blue-500",
        },
      }}
    />
  );
}
