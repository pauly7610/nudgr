
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Alert } from '../data/mockData';

interface FrictionAlertBannerProps {
  alert: Alert;
  onView: (alert: Alert) => void;
  onDismiss: () => void;
}

export const FrictionAlertBanner: React.FC<FrictionAlertBannerProps> = ({ 
  alert, 
  onView,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      const dismissTimer = setTimeout(() => {
        onDismiss();
      }, 500); // Allow animation to finish
      
      return () => clearTimeout(dismissTimer);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className={`flex items-center justify-between px-6 py-3 text-white ${alert.type === 'warning' ? 'warning-gradient' : 'error-gradient'}`}>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onView(alert)}
            className="px-4 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm font-medium transition"
          >
            View Details
          </button>
          
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 500);
            }}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-10 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
