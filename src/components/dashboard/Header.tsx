'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { BellIcon, MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts';

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu profil lors des clics à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return <div className="relative"><SunIcon className="h-4 w-4" /><MoonIcon className="h-3 w-3 absolute -top-1 -right-1" /></div>;
    }
    return theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />;
  };

  const getThemeTooltip = () => {
    if (theme === 'light') return 'Passer en mode sombre';
    if (theme === 'dark') return 'Suivre les préférences système';
    return 'Passer en mode clair';
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">G</span>
            </div>
          </Link>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tableau de bord
          </h2>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            onClick={onMobileMenuClick}
            title="Ouvrir le menu"
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            onClick={toggleTheme}
            title={getThemeTooltip()}
          >
            <span className="sr-only">{getThemeTooltip()}</span>
            {getThemeIcon()}
          </button>
          
          <button
            type="button"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 relative"
            onClick={() => {
              // TODO: Implement notifications panel
              alert('Fonctionnalité notifications à venir')
            }}
            title="Voir les notifications"
          >
            <span className="sr-only">Voir les notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {/* Badge de notification simulé */}
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* Menu profil */}
          <div className="relative ml-3" ref={profileMenuRef}>
            <div>
              <button
                type="button"
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                id="user-menu"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                title="Ouvrir le menu utilisateur"
              >
                <span className="sr-only">Ouvrir le menu utilisateur</span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-sm hover:shadow-md transition-shadow">
                  U
                </div>
              </button>
            </div>
            
            {isProfileOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10" role="menu">
                <Link 
                  href="/dashboard/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  Votre profil
                </Link>
                <Link 
                  href="/dashboard/settings" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  Paramètres
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                      // TODO: Implement proper logout with Supabase
                      alert('Déconnexion simulée - Redirection vers la page de connexion')
                      // router.push('/auth/signin')
                    }
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                  role="menuitem"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
