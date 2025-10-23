'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail, Lock } from 'lucide-react'
import { SocialButtons } from '@/components/auth/SocialButtons'
import { motion } from 'framer-motion'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState<{email?: string, password?: string}>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')
  const supabase = createClient()

  // Effet pour nettoyer les erreurs quand les champs sont modifiés
  useEffect(() => {
    if (email && formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: '' }))
    }
    if (password && formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: '' }))
    }
  }, [email, password, formErrors.email, formErrors.password])

  const getErrorMessage = (error: any) => {
    const message = error?.message || ''
    
    if (message.includes('email') || message.includes('Email')) {
      setFormErrors(prev => ({ ...prev, email: 'Email invalide' }))
      return ''
    }
    
    if (message.includes('password') || message.includes('mot de passe')) {
      setFormErrors(prev => ({ ...prev, password: 'Mot de passe incorrect' }))
      return ''
    }

    switch (message) {
      case 'Invalid login credentials':
        return 'Email ou mot de passe incorrect.'
      case 'Email not confirmed':
        return 'Veuillez confirmer votre email avant de vous connecter.'
      case 'Too many requests':
        return 'Trop de tentatives. Veuillez réessayer dans quelques minutes.'
      case 'User not found':
        setFormErrors(prev => ({ ...prev, email: 'Aucun compte avec cet email' }))
        return ''
      default:
        return message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
    }
  }

  const validateForm = () => {
    const errors: {email?: string, password?: string} = {}
    let isValid = true

    if (!email.trim()) {
      errors.email = 'L\'email est requis'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email invalide'
      isValid = false
    }

    if (!password.trim()) {
      errors.password = 'Le mot de passe est requis'
      isValid = false
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (authError) {
        setError(getErrorMessage(authError))
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Erreur de connexion. Vérifiez votre connexion internet.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8 relative">
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        Retour à l&apos;accueil
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700/50"
      >
        <div className="px-8 py-10 sm:px-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white">
              Connexion
            </h2>
            <p className="mt-2 text-gray-400">
              Accédez à votre espace personnel
            </p>
            
            {verified && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg"
              >
                Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.
              </motion.div>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-300 mb-1">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 bg-gray-700/50 border ${
                      formErrors.email ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="votre@email.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Mot de passe
                  </label>
                  <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Mot de passe oublié ?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 bg-gray-700/50 border ${
                      formErrors.password ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="••••••••"
                  />
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-600 rounded bg-gray-700/50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Se souvenir de moi
                </label>
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                  loading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              {/* <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/50 text-gray-400">Ou continuez avec</span>
              </div> */}
            </div>

            <div className="mt-6">
              <SocialButtons />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Pas encore de compte ?{' '}
                <Link 
                  href="/auth/signup" 
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
