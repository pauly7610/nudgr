
import React from 'react';
import { SidebarNav } from './SidebarNav';
import { SidebarProvider } from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarNav />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
