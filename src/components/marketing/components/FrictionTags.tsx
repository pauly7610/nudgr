
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const FrictionTags: React.FC = () => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Common Friction Types</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">Form Abandonment</Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">Rage Clicks</Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">Navigation Loops</Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">Pricing Confusion</Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">Mobile UX</Badge>
      </div>
    </div>
  );
};
