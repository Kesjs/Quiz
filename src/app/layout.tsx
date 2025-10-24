import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { FloatingScrollToTop } from '@/components/ui/FloatingScrollToTop'
import './globals.css'
import '@/styles/onboarding.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gazoduc Invest - Investissement GNL',
  description: 'Plateforme d\'investissement dans le Gaz Naturel Liquéfié avec des rendements sécurisés et transparents.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <FloatingScrollToTop />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
