import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Cutting Process Simulator',
    template: '%s | Cutting Process Simulator'
  },
  description: 'Interactive multi-process cutting simulator (Wire EDM, Water Jet, Laser Cutting, CNC Milling) with AI-driven parameter insights.',
  applicationName: 'Cutting Process Simulator',
  authors: [{ name: 'Cutting Process Simulator Team' }],
  keywords: [
    'Wire EDM','EDM','Cutting Simulation','Manufacturing','CNC','Water Jet','Laser Cutting','AI Models','Process Optimization'
  ],
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: '/logo.png',
    shortcut: '/logo.png'
  },
  openGraph: {
    title: 'Cutting Process Simulator',
    description: 'Simulate Wire EDM, Water Jet, Laser and CNC Milling with real‑time parameter tuning and AI model predictions.',
    url: 'https://localhost:3000',
    siteName: 'Cutting Process Simulator',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Cutting Process Simulator Logo'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Cutting Process Simulator',
    description: 'Multi-process cutting & AI simulation environment.',
    images: ['/logo.png']
  },
  category: 'technology'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${GeistMono.className}`}>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
