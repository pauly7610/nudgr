
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Plus, Filter } from 'lucide-react';

interface JourneyMapHeaderProps {
  onNewJourney: () => void;
  onFilterClick: () => void;
}

export const JourneyMapHeader: React.FC<JourneyMapHeaderProps> = ({
  onNewJourney,
  onFilterClick
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={onNewJourney}>
        <Plus className="h-4 w-4" />
        <span>New Journey</span>
      </Button>
      <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={onFilterClick}>
        <Filter className="h-4 w-4" />
        <span>Filter</span>
      </Button>
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        <span>Export</span>
      </Button>
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>
    </div>
  );
};
