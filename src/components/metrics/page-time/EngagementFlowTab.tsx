
import React from 'react';
import { Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PageEngagement {
  page: string;
  time: string;
  engaged: number;
  timeInSeconds: number; // Added for sorting
}

export const EngagementFlowTab: React.FC = () => {
  // Mock data for page flow engagement with timeInSeconds added
  const pageEngagements: PageEngagement[] = [
    { page: 'Home', time: '0:45', engaged: 85, timeInSeconds: 45 },
    { page: 'Category', time: '1:32', engaged: 76, timeInSeconds: 92 },
    { page: 'Product', time: '2:08', engaged: 92, timeInSeconds: 128 },
    { page: 'Cart', time: '1:05', engaged: 68, timeInSeconds: 65 },
    { page: 'Checkout', time: '3:30', engaged: 94, timeInSeconds: 210 }
  ];
  
  // Calculate total time
  const totalTimeInSeconds = pageEngagements.reduce((total, item) => total + item.timeInSeconds, 0);
  const totalMinutes = Math.floor(totalTimeInSeconds / 60);
  const totalSeconds = totalTimeInSeconds % 60;
  const totalTimeFormatted = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="border rounded-md p-4">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="mb-2 md:mb-0">
          <h4 className="text-sm font-medium mb-1">Page Flow Engagement</h4>
          <p className="text-xs text-muted-foreground">How visitors move through pages and where they spend the most time</p>
        </div>
        <div className="text-xs bg-muted px-2 py-1 rounded-md flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>Total Journey Time: <strong>{totalTimeFormatted}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {pageEngagements.map((item, i) => (
          <div key={i} className="border rounded-lg p-2.5">
            <div className="text-sm font-medium mb-1">{item.page}</div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{item.time}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Engaged:</span>
              <span className={`font-medium ${item.engaged > 80 ? 'text-green-600' : 'text-amber-600'}`}>
                {item.engaged}%
              </span>
            </div>
            <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${item.engaged > 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${item.engaged}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="text-xs flex flex-col md:flex-row mb-2 md:mb-0">
          <div className="flex items-center mr-0 mb-2 md:mr-3 md:mb-0">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
            <span>High engagement (≥80%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-1.5"></div>
            <span>Needs improvement (&lt;80%)</span>
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-muted-foreground flex items-center cursor-help">
                <Clock className="h-3 w-3 mr-1" />
                <span>Visitors spend the most time on product and checkout pages</span>
                <Info className="h-3 w-3 ml-1 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs p-1">
                <p className="font-medium">Time Analysis</p>
                <p>Product pages: 2:08 (27% of journey)</p>
                <p>Checkout: 3:30 (44% of journey)</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
