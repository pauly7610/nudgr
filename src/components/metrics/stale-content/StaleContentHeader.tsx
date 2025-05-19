
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurveBehavior } from './types';

interface StaleContentHeaderProps {
  contentType: 'all' | 'article' | 'feature' | 'page';
  setContentType: (value: 'all' | 'article' | 'feature' | 'page') => void;
  selectedCurveFilter: CurveBehavior | 'all';
  setSelectedCurveFilter: (value: CurveBehavior | 'all') => void;
  sortBy: 'behavior' | 'leastViewed' | 'mostStale' | 'largestDrop';
  setSortBy: (value: 'behavior' | 'leastViewed' | 'mostStale' | 'largestDrop') => void;
}

export const StaleContentHeader: React.FC<StaleContentHeaderProps> = ({
  contentType,
  setContentType,
  selectedCurveFilter,
  setSelectedCurveFilter,
  sortBy,
  setSortBy
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg font-medium flex items-center gap-2">
        <EyeOff className="h-5 w-5 text-muted-foreground" />
        Stale Content Analysis
      </CardTitle>
      <div className="flex items-center gap-2">
        <Select value={contentType} onValueChange={(value: 'all' | 'article' | 'feature' | 'page') => setContentType(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="feature">Features</SelectItem>
            <SelectItem value="page">Pages</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={selectedCurveFilter} 
          onValueChange={(value: CurveBehavior | 'all') => setSelectedCurveFilter(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Behavior" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Behaviors</SelectItem>
            <SelectItem value="recentSpike">Recent Spike</SelectItem>
            <SelectItem value="suddenDrop">Sudden Drop</SelectItem>
            <SelectItem value="lowValue">Low Value</SelectItem>
            <SelectItem value="slowDecay">Slow Decay</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={sortBy} 
          onValueChange={(value: 'behavior' | 'leastViewed' | 'mostStale' | 'largestDrop') => setSortBy(value)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="behavior">Behavior Type</SelectItem>
            <SelectItem value="leastViewed">Least Viewed</SelectItem>
            <SelectItem value="mostStale">Most Stale</SelectItem>
            <SelectItem value="largestDrop">Largest Drop</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
  );
};
