import "@testing-library/jest-dom";
import { beforeAll, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
beforeAll(() => {
  // Mock next/navigation
  vi.mock("next/navigation", () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: "/",
      query: {},
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  }));

  // Mock next-auth
  vi.mock("next-auth/react", () => ({
    useSession: () => ({
      data: null,
      status: "unauthenticated",
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }));

  // Mock next-intl
  vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => "en",
  }));
});
