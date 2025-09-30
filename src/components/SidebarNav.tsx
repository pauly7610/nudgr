
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from '@/components/ui/sidebar';
import { BarChart2, Activity, Map, Settings, Users, Home, Library, Plug, BookOpen, Shield, ShieldCheck } from 'lucide-react';
import { UserProfileButton } from './UserProfileButton';

export const SidebarNav: React.FC = () => {
  const location = useLocation();
  
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amplitude-blue flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <span className="font-semibold text-lg">Amplitude</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={location.pathname === '/' ? 'bg-sidebar-accent' : ''}>
                  <Link to="/" className="flex items-center">
                    <Home className="mr-3 h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={location.pathname === '/journey-map' ? 'bg-sidebar-accent' : ''}>
                  <Link to="/journey-map" className="flex items-center">
                    <Map className="mr-3 h-4 w-4" />
                    <span>Journey Map</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={location.pathname === '/metrics' ? 'bg-sidebar-accent' : ''}>
                  <Link to="/metrics" className="flex items-center">
                    <Activity className="mr-3 h-4 w-4" />
                    <span>Metrics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={location.pathname === '/user-cohorts' ? 'bg-sidebar-accent' : ''}>
                  <Link to="/user-cohorts" className="flex items-center">
                    <Users className="mr-3 h-4 w-4" />
                    <span>Audience Cohorts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={location.pathname === '/library' ? 'bg-sidebar-accent' : ''}>
                  <Link to="/library" className="flex items-center">
                    <Library className="mr-3 h-4 w-4" />
                    <span>Library</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={location.pathname === '/documentation' ? 'bg-sidebar-accent' : ''}>
                  <Link to="/documentation" className="flex items-center">
                    <BookOpen className="mr-3 h-4 w-4" />
                    <span>Documentation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={location.pathname === '/integrations' ? 'bg-sidebar-accent' : ''}>
                  <Link to="/integrations" className="flex items-center">
                    <Plug className="mr-3 h-4 w-4" />
                    <span>Integrations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={location.pathname === '/monitoring' ? 'bg-sidebar-accent' : ''}>
                  <Link to="/monitoring" className="flex items-center">
                    <Shield className="mr-3 h-4 w-4" />
                    <span>Monitoring</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={location.pathname === '/security' ? 'bg-sidebar-accent' : ''}>
                  <Link to="/security" className="flex items-center">
                    <ShieldCheck className="mr-3 h-4 w-4" />
                    <span>Security</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={location.pathname === '/settings' ? 'bg-sidebar-accent' : ''}>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <UserProfileButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
