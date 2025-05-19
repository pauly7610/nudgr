
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EyeOff, Archive, Clock, Filter, RefreshCw, TrendingUp, HelpCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface StaleContentItem {
  name: string;
  type: 'article' | 'feature' | 'page';
  lastInteraction: number; // days ago
  viewsLast30Days: number;
  previousViews: number;
  change: number;
  lifetimeViews?: number;
}

interface StaleContentAnalysisProps {
  className?: string;
}

export const StaleContentAnalysis: React.FC<StaleContentAnalysisProps> = ({ className }) => {
  const [contentType, setContentType] = useState<'all' | 'article' | 'feature' | 'page'>('all');
  const [sortBy, setSortBy] = useState<'leastViewed' | 'mostStale' | 'largestDrop'>('leastViewed');

  // Mock data for stale content with added lifetimeViews
  const staleContent: StaleContentItem[] = [
    { name: 'Technical Error Correlation', type: 'feature', lastInteraction: 67, viewsLast30Days: 3, previousViews: 29, change: -89.7, lifetimeViews: 1,250 },
    { name: 'Advanced Segmentation', type: 'feature', lastInteraction: 78, viewsLast30Days: 5, previousViews: 54, change: -90.7, lifetimeViews: 2,800 },
    { name: 'Legacy Landing Page', type: 'page', lastInteraction: 94, viewsLast30Days: 7, previousViews: 215, change: -96.7, lifetimeViews: 12,500 },
    { name: 'Marketing Playbook: B2B SaaS', type: 'article', lastInteraction: 32, viewsLast30Days: 8, previousViews: 24, change: -66.7, lifetimeViews: 890 },
    { name: 'How to Use Journey Maps', type: 'article', lastInteraction: 45, viewsLast30Days: 12, previousViews: 86, change: -85.1, lifetimeViews: 3,200 },
    { name: 'Customer Journey Templates', type: 'article', lastInteraction: 18, viewsLast30Days: 26, previousViews: 45, change: -42.2, lifetimeViews: 1,450 },
    { name: 'Analytics Exports', type: 'feature', lastInteraction: 27, viewsLast30Days: 16, previousViews: 31, change: -48.4, lifetimeViews: 950 }
  ];

  // Filter and sort content based on user selections
  const filteredContent = staleContent
    .filter(item => contentType === 'all' || item.type === contentType)
    .sort((a, b) => {
      if (sortBy === 'leastViewed') return a.viewsLast30Days - b.viewsLast30Days;
      if (sortBy === 'mostStale') return b.lastInteraction - a.lastInteraction;
      return a.change - b.change; // largestDrop
    });

  // Calculate engagement ratio for matrix plotting
  const matrixData = filteredContent.map(item => {
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
      category: getCategory(item.change, engagementRatio)
    };
  });

  // Helper function to get category (for color coding)
  function getCategory(change: number, engagementRatio: number): 'stale' | 'watch' | 'reevaluate' {
    if (change < -70 && engagementRatio < 1) return 'stale';
    if (change < -50 && engagementRatio < 3) return 'watch';
    return 'reevaluate';
  }

  // Helper to get color based on category
  function getCategoryColor(category: 'stale' | 'watch' | 'reevaluate'): string {
    switch (category) {
      case 'stale': return '#ea384c';
      case 'watch': return '#F97316';
      case 'reevaluate': return '#10b981';
      default: return '#8884d8';
    }
  }

  // Helper to get the suggested action
  function getSuggestedAction(item: StaleContentItem) {
    const engagementRatio = item.lifetimeViews ? (item.viewsLast30Days / item.lifetimeViews) * 100 : 0;
    const category = getCategory(item.change, engagementRatio);
    
    switch (category) {
      case 'stale': return { icon: <Archive className="h-4 w-4" />, action: 'Archive' };
      case 'watch': return { icon: <RefreshCw className="h-4 w-4" />, action: 'Refresh' };
      case 'reevaluate': return { icon: <TrendingUp className="h-4 w-4" />, action: 'Promote' };
      default: return { icon: <HelpCircle className="h-4 w-4" />, action: 'Investigate' };
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'article': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'feature': return <Archive className="h-5 w-5 text-purple-500" />;
      case 'page': return <Clock className="h-5 w-5 text-green-500" />;
      default: return null;
    }
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <EyeOff className="h-5 w-5 text-muted-foreground" />
          Stale Content Analysis
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={contentType} onValueChange={(value) => setContentType(value as any)}>
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
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leastViewed">Least Viewed</SelectItem>
              <SelectItem value="mostStale">Most Stale</SelectItem>
              <SelectItem value="largestDrop">Largest Drop</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="h-[280px] border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Friction-to-Value Matrix</h4>
              <div className="flex gap-2 items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></div>
                  <span className="text-xs">Stale</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-1.5"></div>
                  <span className="text-xs">Watch</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
                  <span className="text-xs">Reevaluate</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="85%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="% Drop in Use" 
                  unit="%" 
                  domain={[0, 100]} 
                  label={{ value: '% Drop in Use', position: 'bottom' }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Recent Engagement Ratio" 
                  label={{ value: 'Recent Engagement Ratio', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-md shadow-md">
                          <p className="font-semibold text-sm">{data.name}</p>
                          <p className="text-xs">Last interaction: {data.lastInteraction} days ago</p>
                          <p className="text-xs">Recent views: {formatNumber(data.viewsLast30Days)}</p>
                          <p className="text-xs">Usage change: {data.change}%</p>
                          <p className="text-xs mt-1 font-medium text-muted-foreground">
                            Recommendation: {getSuggestedAction({ 
                              name: data.name, 
                              type: data.type, 
                              lastInteraction: data.lastInteraction,
                              viewsLast30Days: data.viewsLast30Days,
                              previousViews: data.previousViews,
                              change: data.change
                            }).action}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Content Items" data={matrixData}>
                  {matrixData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getCategoryColor(entry.category)} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Content</TableHead>
                <TableHead className="w-[100px] text-center">Recency Score</TableHead>
                <TableHead className="w-[150px] text-center">Usage Ratio</TableHead>
                <TableHead className="w-[100px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => {
                const { icon, action } = getSuggestedAction(item);
                return (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {item.lastInteraction}d
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span>
                        {formatNumber(item.viewsLast30Days)} views / {Math.abs(item.change)}%↓
                      </span>
                    </TableCell>
                    <TableCell>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full h-8 justify-center">
                            {icon}
                            <span className="ml-1.5">{action}</span>
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-72">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{action} Recommendation</h4>
                            <p className="text-xs text-muted-foreground">
                              {action === 'Archive' && "This content has low engagement and high decay. Consider archiving it to reduce clutter."}
                              {action === 'Refresh' && "This content has some engagement but is losing traffic. Consider updating it with fresh information."}
                              {action === 'Promote' && "This content is performing well despite being older. Consider promoting it more widely."}
                              {action === 'Investigate' && "This content shows unusual patterns. Investigate why it's underperforming."}
                            </p>
                            <div className="text-xs mt-1 pt-2 border-t">
                              <span className="block">Last meaningful engagement: {item.lastInteraction} days ago</span>
                              <span className="block">Recent views: {formatNumber(item.viewsLast30Days)}</span>
                              <span className="block">Change: {item.change}%</span>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
