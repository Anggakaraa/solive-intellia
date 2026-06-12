import type { Metadata } from 'next'
import { Fraunces, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from '@/components/layout/sidebar'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-ibm-plex-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Salted Olive — R&D Intelligence',
  description: 'Culinary R&D knowledge capture platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${ibmPlexSans.variable} h-full antialiased`}>
      <body className="h-full">
        <div className="flex h-screen bg-cream overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-9 py-10">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
