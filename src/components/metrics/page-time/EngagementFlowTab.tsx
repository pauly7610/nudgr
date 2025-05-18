
import React from 'react';
import { Clock } from 'lucide-react';

interface PageEngagement {
  page: string;
  time: string;
  engaged: number;
}

export const EngagementFlowTab: React.FC = () => {
  // Mock data for page flow engagement
  const pageEngagements: PageEngagement[] = [
    { page: 'Home', time: '0:45', engaged: 85 },
    { page: 'Category', time: '1:32', engaged: 76 },
    { page: 'Product', time: '2:08', engaged: 92 },
    { page: 'Cart', time: '1:05', engaged: 68 },
    { page: 'Checkout', time: '3:30', engaged: 94 }
  ];
  
  return (
    <div className="border rounded-md p-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-1">Page Flow Engagement</h4>
        <p className="text-xs text-muted-foreground">How users move through pages and where they spend the most time</p>
      </div>

      <div className="flex overflow-x-auto pb-4 space-x-4">
        {pageEngagements.map((item, i) => (
          <div key={i} className="flex-shrink-0 w-40 border rounded-lg p-3">
            <div className="text-sm font-medium">{item.page}</div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{item.time}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Engaged:</span>
              <span className={`font-medium ${item.engaged > 80 ? 'text-green-600' : 'text-amber-600'}`}>
                {item.engaged}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${item.engaged > 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${item.engaged}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        <Clock className="h-3 w-3 inline mr-1" />
        Users spend the most time on product and checkout pages
      </div>
    </div>
  );
};
