
import React from 'react';
import { Check, Filter } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface ScopeFilter {
  pageVertical?: string[];
  pageSection?: string[];
  pagePurpose?: string[];
}

interface FrictionScopeFilterProps {
  filter: ScopeFilter;
  onFilterChange: (filter: ScopeFilter) => void;
  onReset: () => void;
}

export const FrictionScopeFilter: React.FC<FrictionScopeFilterProps> = ({
  filter,
  onFilterChange,
  onReset
}) => {
  // Mock data for filters
  const verticals = ['Credit Card', 'Travel', 'Banking', 'Investments', 'Rewards'];
  const sections = ['Hero', 'CTA', 'Pricing Table', 'Navigation', 'Footer', 'Form'];
  const purposes = ['Lead Gen', 'Conversion', 'Education', 'Account Management'];

  const handleVerticalChange = (value: string) => {
    onFilterChange({ 
      ...filter, 
      pageVertical: value ? [value] : [] 
    });
  };

  const handleSectionToggle = (section: string) => {
    const currentSections = filter.pageSection || [];
    const newSections = currentSections.includes(section)
      ? currentSections.filter(s => s !== section)
      : [...currentSections, section];
    
    onFilterChange({ ...filter, pageSection: newSections });
  };

  const handlePurposeChange = (value: string) => {
    onFilterChange({ 
      ...filter, 
      pagePurpose: value ? [value] : [] 
    });
  };

  const hasActiveFilters = (
    (filter.pageVertical && filter.pageVertical.length > 0) || 
    (filter.pageSection && filter.pageSection.length > 0) || 
    (filter.pagePurpose && filter.pagePurpose.length > 0)
  );

  return (
    <div className="bg-muted/20 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Friction Scope Filters
        </h3>
        {hasActiveFilters && (
          <button 
            onClick={onReset} 
            className="text-xs text-blue-600 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="vertical-filter" className="text-sm mb-1 block">Page Vertical</Label>
          <Select 
            value={filter.pageVertical?.[0] || ''} 
            onValueChange={handleVerticalChange}
          >
            <SelectTrigger id="vertical-filter">
              <SelectValue placeholder="All Verticals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Verticals</SelectItem>
              {verticals.map((vertical) => (
                <SelectItem key={vertical} value={vertical}>{vertical}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-1 block">Page Section</Label>
          <div className="grid grid-cols-2 gap-2">
            {sections.slice(0, 4).map((section) => (
              <div key={section} className="flex items-center space-x-2">
                <Checkbox 
                  id={`section-${section}`}
                  checked={filter.pageSection?.includes(section) || false}
                  onCheckedChange={() => handleSectionToggle(section)}
                />
                <label 
                  htmlFor={`section-${section}`}
                  className="text-sm cursor-pointer"
                >
                  {section}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="purpose-filter" className="text-sm mb-1 block">Page Purpose</Label>
          <Select 
            value={filter.pagePurpose?.[0] || ''} 
            onValueChange={handlePurposeChange}
          >
            <SelectTrigger id="purpose-filter">
              <SelectValue placeholder="All Purposes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Purposes</SelectItem>
              {purposes.map((purpose) => (
                <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm mt-2">
          <p className="flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            <span>
              Filters applied. 
              {filter.pageSection?.length ? 
                ` Showing data for ${filter.pageSection.join(', ')}.` : ''
              }
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
