'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children, defaultTheme = 'system' }: { children: ReactNode, defaultTheme?: Theme }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (typeof window !== 'undefined' ? (localStorage.getItem('theme') as Theme) || defaultTheme : defaultTheme)
  )
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Apply theme changes
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove existing theme attributes/classes
    root.removeAttribute('data-theme')
    root.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.setAttribute('data-theme', systemTheme)
      setResolvedTheme(systemTheme)
    } else {
      root.setAttribute('data-theme', theme)
      setResolvedTheme(theme as 'light' | 'dark')
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light'
        root.setAttribute('data-theme', systemTheme)
        setResolvedTheme(systemTheme)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
