import React from 'react';
import { SidebarNav } from './SidebarNav';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DarkModeToggle } from './settings/DarkModeToggle';
import { AnalyticsPropertyProvider } from '@/contexts/AnalyticsPropertyContext';
import { PropertySelector } from './properties/PropertySelector';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AnalyticsPropertyProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <SidebarNav />
          <main className="flex-1 overflow-x-hidden">
            {/* Mobile header with hamburger */}
            <header className="sticky top-0 z-10 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b bg-background px-4 py-2 lg:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Nudgr</h1>
              </div>
              <div className="flex items-center gap-2">
                <PropertySelector />
                <DarkModeToggle />
              </div>
            </header>

            {/* Desktop header with property selector */}
            <header className="hidden lg:flex sticky top-0 z-10 h-14 items-center justify-end gap-4 border-b bg-background px-6">
              <PropertySelector />
              <DarkModeToggle />
            </header>

            <div className="p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AnalyticsPropertyProvider>
  );
};
