'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { NavigationLoader } from '@/components/ui/navigation-loader';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onClose={closeMobileSidebar} 
      />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <Header onMobileMenuClick={toggleMobileSidebar} />
        <NavigationLoader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
