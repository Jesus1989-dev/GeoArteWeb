import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ConditionalChrome } from "@/components/layout/ConditionalChrome";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { AuthProvider } from "@/contexts/AuthProvider";
import { QueryProvider } from "@/contexts/QueryProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { siteConfig } from "@/lib/constants/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeScript />
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ConditionalChrome>{children}</ConditionalChrome>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
