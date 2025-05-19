
import React from 'react';
import { Search, BookOpen, Users, Map, Code } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface PlaybookFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  filterOptions: FilterOption[];
  variant?: 'tabs' | 'toggles';
  placeholder?: string;
  className?: string;
}

export const PlaybookFilter: React.FC<PlaybookFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  filterOptions,
  variant = 'tabs',
  placeholder = "Search resources...",
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {variant === 'tabs' ? (
        <Tabs defaultValue={selectedCategory} value={selectedCategory} onValueChange={onCategoryChange}>
          <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${filterOptions.length}, 1fr)` }}>
            {filterOptions.map(option => (
              <TabsTrigger key={option.value} value={option.value} className="flex items-center gap-1">
                {option.icon && <option.icon className="h-3.5 w-3.5" />}
                <span>{option.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : (
        <ToggleGroup type="single" value={selectedCategory} onValueChange={(value) => value && onCategoryChange(value)}>
          {filterOptions.map(option => (
            <ToggleGroupItem key={option.value} value={option.value} className="flex items-center gap-1">
              {option.icon && <option.icon className="h-4 w-4" />}
              <span>{option.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </div>
  );
};
