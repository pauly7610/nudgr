
import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  title?: string;
  description?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title = "Marketing Friction Dashboard",
  description = "Monitor user friction and drop-offs in real-time"
}) => {
  const { toast } = useToast();
  
  // Show demo notification
  React.useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "Welcome to the Friction Dashboard",
        description: "This is a demonstration with simulated data. New alerts will appear every 15-45 seconds.",
      });
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  return (
    <div className="border-b border-border">
      <div className="container py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span>Data: Live</span>
          </div>
          
          <select className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="all">All Users</option>
            <option value="free">Free Users</option>
            <option value="trial">Trial Users</option>
            <option value="enterprise">Enterprise</option>
          </select>
          
          <select className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>
    </div>
  );
};
