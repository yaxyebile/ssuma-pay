import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/lib/app-context'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Suuma Admin – Settlement Management',
  description: 'Professional settlement management and accounting system for Suuma.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏦</text></svg>" />
      </head>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <AppProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AppProvider>
        <Analytics />
      </body>
    </html>
  )
}
