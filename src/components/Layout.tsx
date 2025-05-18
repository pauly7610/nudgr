
import React from 'react';
import { SidebarNav } from './SidebarNav';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
