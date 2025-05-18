
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface FrictionTagsProps {
  onTagSelect?: (tag: string) => void;
  selectedTags?: string[];
}

export const FrictionTags: React.FC<FrictionTagsProps> = ({ onTagSelect, selectedTags = [] }) => {
  const frictionTypes = [
    'Form Abandonment',
    'Rage Clicks',
    'Navigation Loops',
    'Pricing Confusion',
    'Mobile UX'
  ];

  const handleTagClick = (tag: string) => {
    if (onTagSelect) {
      onTagSelect(tag);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Common Friction Types</h3>
      <div className="flex flex-wrap gap-2">
        {frictionTypes.map((tag) => (
          <Badge 
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"} 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};
