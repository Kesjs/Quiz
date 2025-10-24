'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HomeIcon, ChartBarIcon, CurrencyDollarIcon, UserCircleIcon, Cog6ToothIcon, LifebuoyIcon, ArrowRightOnRectangleIcon, DocumentTextIcon, DocumentChartBarIcon, UserPlusIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const mainNavigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Investissement', href: '/dashboard/packs', icon: ChartBarIcon },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CurrencyDollarIcon },
  { name: 'Rapport', href: '/dashboard/rapports', icon: DocumentChartBarIcon },
  { name: 'Document', href: '/dashboard/documents', icon: DocumentTextIcon },
  { name: 'Parrainage', href: '/dashboard/parrainage', icon: UserPlusIcon },
];

const accountNavigation = [
  { name: 'Profil', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const helpNavigation = [
  { name: 'Support Client', href: '/dashboard/support', icon: LifebuoyIcon },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut || !onLogout) return;
    
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = async (href: string, itemName: string) => {
    if (pathname === href) return; // Already on this page

    // Close mobile sidebar immediately
    if (onClose) onClose();

    // Set loading state
    setNavigatingTo(href);

    // Small delay to show the loading feedback
    setTimeout(() => {
      router.push(href);
    }, 80); // 80ms delay - plus rapide mais garde l'effet

    // Clear loading state after navigation starts
    setTimeout(() => {
      setNavigatingTo(null);
    }, 300);
  };

  const renderNavItems = (items: typeof mainNavigation) => {
    return items.map((item) => {
      const isActive = pathname === item.href;
      const isNavigating = navigatingTo === item.href;

      return (
        <motion.div
          key={item.name}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
        >
          <button
            onClick={() => handleNavigation(item.href, item.name)}
            disabled={isNavigating}
            className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed ${
              isActive
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                : isNavigating
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm animate-pulse'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white hover:shadow-sm'
            }`}
          >
            <div className="relative mr-4 flex-shrink-0 h-5 w-5">
              {isNavigating ? (
                <motion.div
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
                >
                  <ArrowPathIcon className="h-5 w-5 text-blue-500" />
                </motion.div>
              ) : (
                <item.icon
                  className={`transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
            <span className="font-medium">{item.name}</span>
            {isNavigating && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 20 }}
                className="ml-auto h-1 bg-blue-500 rounded-full"
              />
            )}
          </button>
        </motion.div>
      );
    });
  };
  
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileOpen ? 'block fixed inset-y-0 left-0 z-50 overflow-y-auto' : 'hidden md:flex md:relative md:flex-shrink-0'} 
        h-full
      `}>
        <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl md:shadow-none">
          <div className="flex flex-col min-h-full">
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between flex-shrink-0 px-6 py-6 pb-5 md:hidden">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gazoduc Invest
              </h1>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Fermer le menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center flex-shrink-0 px-6 py-6 pb-5">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gazoduc Invest
              </h1>
            </div>

            {/* Séparateur sous le titre */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>

            {/* Section 1: Navigation Principale */}
            <div className="px-4 pt-6 pb-6">
              <nav className="space-y-1">
                {renderNavItems(mainNavigation)}
              </nav>
            </div>

            {/* Séparateur avec gradient discret */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>

            {/* Section 2: Compte */}
            <div className="px-4 py-6">
              <nav className="space-y-1">
                {renderNavItems(accountNavigation)}
              </nav>
            </div>

            {/* Séparateur avec gradient discret */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>

            {/* Section 3: Aide & Déconnexion */}
            <div className="px-4 pt-6 pb-6">
              <nav className="space-y-1 mb-4">
                {renderNavItems(helpNavigation)}
              </nav>

              {/* Bouton de déconnexion */}
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 bg-red-600/20 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <ArrowPathIcon className="mr-4 h-5 w-5 animate-spin" />
                    <span className="font-medium">Déconnexion...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightOnRectangleIcon className="mr-4 h-5 w-5" />
                    <span className="font-medium">Déconnexion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}