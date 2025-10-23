'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { NavigationLoader } from '@/components/ui/navigation-loader';
import { PageTransition } from '@/components/ui/page-transition';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          // No session, redirect to signin
          router.push('/auth/signin');
          return;
        }

        // User is authenticated, allow access
        setIsAuthenticating(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth/signin');
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Show loading while checking authentication
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuClick={toggleMobileSidebar} />
        <NavigationLoader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
