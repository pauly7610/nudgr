
import { cn } from '@/lib/utils';

interface ColorLegendProps {
  className?: string;
}

export function ColorLegend({ className }: ColorLegendProps) {
  const legendItems = [
    { color: '#8884d8', label: 'Rage Clicks' },
    { color: '#82ca9d', label: 'Form Abandonment' },
    { color: '#ffc658', label: 'Navigation Loops' },
    { color: '#ff8042', label: 'Mobile Visitors' },
    { color: '#0088fe', label: 'Desktop Visitors' },
    { color: '#00c49f', label: 'Tablet Visitors' },
  ];

  const metricItems = [
    { color: 'bg-amber-100', label: 'Warning' },
    { color: 'bg-red-100', label: 'Critical Issue' },
    { color: 'bg-green-100', label: 'Success' },
    { color: 'bg-blue-100', label: 'Information' },
  ];

  return (
    <div className={cn("p-3 border rounded-md bg-card shadow-sm", className)}>
      <div className="text-sm font-medium mb-2">Color Legend</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium mb-1.5 text-muted-foreground">Chart Colors</div>
          <div className="flex flex-wrap gap-2">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1.5" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="text-xs font-medium mb-1.5 text-muted-foreground">Status Indicators</div>
          <div className="flex flex-wrap gap-2">
            {metricItems.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-1.5 ${item.color}`}></div>
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
