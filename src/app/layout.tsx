import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommFlock - Community Platform",
  description:
    "A community/groups platform with Lightning payments and multi-tenant support",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
