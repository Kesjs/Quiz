'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Moon, Sun, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function GlassNavbar() {
  const [theme, setTheme] = useState('dark')
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Vérification du thème enregistré
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')

    // Vérification de l'authentification
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()

    // Gestion du défilement
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <nav 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl rounded-xl transition-all duration-300 ${
        scrolled 
          ? 'bg-black/60 backdrop-blur-lg border border-gray-700/30' 
          : 'bg-black/40 backdrop-blur-md border border-gray-700/20'
      }`}
    >
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link 
          href="/" 
          className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Gazoduc Invest
        </Link>
        
        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            href="#about" 
            className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider hover:bg-gray-800/50 px-3 py-2 rounded-lg"
          >
            À propos
          </Link>
          <Link 
            href="#plans" 
            className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider hover:bg-gray-800/50 px-3 py-2 rounded-lg"
          >
            Nos offres
          </Link>
          <Link 
            href="#testimonials" 
            className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider hover:bg-gray-800/50 px-3 py-2 rounded-lg"
          >
            Témoignages
          </Link>
          <Link 
            href="#contact" 
            className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider hover:bg-gray-800/50 px-3 py-2 rounded-lg"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Link 
                href="/dashboard" 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm shadow-lg shadow-blue-500/20 flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Tableau de bord
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
                >
                  Connexion
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm shadow-lg shadow-blue-500/20"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button 
            className="md:hidden p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800 mt-2 rounded-b-xl overflow-hidden">
          <div className="flex flex-col space-y-2 p-4">
            <Link 
              href="#about" 
              className="text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              À propos
            </Link>
            <Link 
              href="#plans" 
              className="text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Nos offres
            </Link>
            <Link 
              href="#testimonials" 
              className="text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Témoignages
            </Link>
            <Link 
              href="#contact" 
              className="text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-2 mt-2 border-t border-gray-800">
              {isAuthenticated ? (
                <Link 
                  href="/dashboard" 
                  className="block text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Tableau de bord
                </Link>
              ) : (
                <>
                  <Link 
                    href="/auth/signin" 
                    className="block text-center text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800 mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
