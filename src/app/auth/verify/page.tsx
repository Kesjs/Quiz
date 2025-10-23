'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AuthLoader } from '@/components/ui/AuthLoader'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'error'

export default function AuthVerifyPage() {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90))
        }, 200)

        // Check current session
        const { data: { session }, error } = await supabase.auth.getSession()

        clearInterval(progressInterval)

        if (error) {
          console.error('Auth verification error:', error)
          setStatus('error')
          setProgress(100)
          setTimeout(() => router.push('/auth/signin'), 2000)
          return
        }

        if (session?.user) {
          setStatus('authenticated')
          setProgress(100)
          // Small delay to show success state
          setTimeout(() => router.push('/dashboard'), 1000)
        } else {
          setStatus('unauthenticated')
          setProgress(100)
          setTimeout(() => router.push('/auth/signin'), 2000)
        }
      } catch (error) {
        console.error('Unexpected auth error:', error)
        setStatus('error')
        setProgress(100)
        setTimeout(() => router.push('/auth/signin'), 2000)
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <AuthLoader
        status={status}
        progress={progress}
      />

      {/* Brand footer */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-gray-500">
          Gazoduc Invest - Sécurisé et Confidentiel
        </p>
      </div>
    </div>
  )
}
