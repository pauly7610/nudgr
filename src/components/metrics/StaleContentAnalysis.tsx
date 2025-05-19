
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StaleContentItem, CurveBehavior, MatrixDataItem } from './stale-content/types';
import { staleContent } from './stale-content/mockData';
import { getCategory } from './stale-content/utils';
import { FrictionMatrix } from './stale-content/FrictionMatrix';
import { BehaviorLegend } from './stale-content/BehaviorLegend';
import { StaleContentTable } from './stale-content/StaleContentTable';
import { StaleContentHeader } from './stale-content/StaleContentHeader';

interface StaleContentAnalysisProps {
  className?: string;
}

export const StaleContentAnalysis: React.FC<StaleContentAnalysisProps> = ({ className }) => {
  const [contentType, setContentType] = useState<'all' | 'article' | 'feature' | 'page'>('all');
  const [sortBy, setSortBy] = useState<'leastViewed' | 'mostStale' | 'largestDrop' | 'behavior'>('behavior');
  const [selectedCurveFilter, setSelectedCurveFilter] = useState<CurveBehavior | 'all'>('all');

  // Filter and sort content based on user selections
  const filteredContent = staleContent
    .filter(item => contentType === 'all' || item.type === contentType)
    .filter(item => selectedCurveFilter === 'all' || item.curveBehavior === selectedCurveFilter)
    .sort((a, b) => {
      if (sortBy === 'leastViewed') return a.viewsLast30Days - b.viewsLast30Days;
      if (sortBy === 'mostStale') return b.lastInteraction - a.lastInteraction;
      if (sortBy === 'largestDrop') return a.change - b.change;
      // Sort by behavior type
      if (sortBy === 'behavior') {
        const behaviorPriority: Record<CurveBehavior, number> = {
          'recentSpike': 0,
          'suddenDrop': 1,
          'slowDecay': 2,
          'lowValue': 3
        };
        return (behaviorPriority[a.curveBehavior as CurveBehavior] || 4) - 
               (behaviorPriority[b.curveBehavior as CurveBehavior] || 4);
      }
      return 0;
    });

  // Calculate engagement ratio for matrix plotting
  const matrixData: MatrixDataItem[] = filteredContent.map(item => {
    const engagementRatio = item.lifetimeViews ? (item.viewsLast30Days / item.lifetimeViews) * 100 : 0;
    return {
      name: item.name,
      x: Math.abs(item.change), // X-axis: % Drop in Use (decay velocity)
      y: engagementRatio, // Y-axis: Recent Engagement Ratio
      lastInteraction: item.lastInteraction,
      viewsLast30Days: item.viewsLast30Days,
      previousViews: item.previousViews,
      change: item.change,
      type: item.type,
      category: getCategory(item.change, engagementRatio),
      curveBehavior: item.curveBehavior,
      viewHistory: item.viewHistory || []
    };
  });

  return (
    <Card className={className}>
      <StaleContentHeader 
        contentType={contentType}
        setContentType={setContentType}
        selectedCurveFilter={selectedCurveFilter}
        setSelectedCurveFilter={setSelectedCurveFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      
      <CardContent>
        <div className="space-y-6">
          <FrictionMatrix matrixData={matrixData} />
          <BehaviorLegend />
          <StaleContentTable filteredContent={filteredContent} />
        </div>
      </CardContent>
    </Card>
  );
};
