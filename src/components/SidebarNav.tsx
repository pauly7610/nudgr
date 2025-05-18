
import React from 'react';
import { Link } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { BarChart2, Activity, Map, Settings, Users, Home } from 'lucide-react';

export const SidebarNav: React.FC = () => {
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
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center">
                    <Home className="mr-3 h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="bg-sidebar-accent">
                  <Link to="/" className="flex items-center">
                    <BarChart2 className="mr-3 h-4 w-4" />
                    <span>Friction Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center">
                    <Map className="mr-3 h-4 w-4" />
                    <span>Journey Map</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center">
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
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center">
                    <Users className="mr-3 h-4 w-4" />
                    <span>User Cohorts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
