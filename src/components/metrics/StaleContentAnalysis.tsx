
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EyeOff, Archive, Clock, Filter, RefreshCw, TrendingUp, HelpCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line } from 'recharts';

// Define the behavior curve types
type CurveBehavior = 'recentSpike' | 'suddenDrop' | 'lowValue' | 'slowDecay';

interface StaleContentItem {
  name: string;
  type: 'article' | 'feature' | 'page';
  lastInteraction: number; // days ago
  viewsLast30Days: number;
  previousViews: number;
  change: number;
  lifetimeViews?: number;
  viewHistory?: number[]; // Last 90 days of views (newest to oldest)
  curveBehavior?: CurveBehavior;
}

interface StaleContentAnalysisProps {
  className?: string;
}

export const StaleContentAnalysis: React.FC<StaleContentAnalysisProps> = ({ className }) => {
  const [contentType, setContentType] = useState<'all' | 'article' | 'feature' | 'page'>('all');
  const [sortBy, setSortBy] = useState<'leastViewed' | 'mostStale' | 'largestDrop' | 'behavior'>('behavior');
  const [selectedCurveFilter, setSelectedCurveFilter] = useState<CurveBehavior | 'all'>('all');

  // Mock data for stale content with added viewHistory for 90 days
  const staleContent: StaleContentItem[] = [
    { 
      name: 'Technical Error Correlation', 
      type: 'feature', 
      lastInteraction: 67, 
      viewsLast30Days: 3, 
      previousViews: 29, 
      change: -89.7, 
      lifetimeViews: 1250,
      viewHistory: [2, 1, 0, 1, 2, 0, 0, 2, 0, 3, 1, 4, 6, 7, 8, 7, 5, 5, 4, 3, 2, 2, 1, 0, 0, 1, 0, 0, 1, 2, 3, 4, 
        5, 5, 6, 8, 10, 12, 13, 10, 8, 7, 6, 5, 4, 3, 3, 4, 5, 7, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 2, 3, 4, 
        5, 6, 7, 9, 10, 12, 15, 18, 16, 14, 12, 10, 8, 7, 5, 4, 2, 1, 0, 0, 0],
      curveBehavior: 'slowDecay'
    },
    { 
      name: 'Advanced Segmentation', 
      type: 'feature', 
      lastInteraction: 78, 
      viewsLast30Days: 5, 
      previousViews: 54, 
      change: -90.7, 
      lifetimeViews: 2800,
      viewHistory: [0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 2, 1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 
        8, 10, 12, 14, 13, 12, 10, 8, 7, 6, 5, 5, 4, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 7, 10, 15, 20, 18, 
        15, 12, 10, 8, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      curveBehavior: 'suddenDrop'
    },
    { 
      name: 'Legacy Landing Page', 
      type: 'page', 
      lastInteraction: 94, 
      viewsLast30Days: 7, 
      previousViews: 215, 
      change: -96.7, 
      lifetimeViews: 12500,
      viewHistory: [1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        1, 1, 2, 2, 3, 4, 5, 8, 10, 15, 20, 28, 35, 42, 38, 32, 25, 20, 15, 10, 8, 5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 10, 5, 3, 0],
      curveBehavior: 'lowValue'
    },
    { 
      name: 'Marketing Playbook: B2B SaaS', 
      type: 'article', 
      lastInteraction: 32, 
      viewsLast30Days: 8, 
      previousViews: 24, 
      change: -66.7, 
      lifetimeViews: 890,
      viewHistory: [3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 
        1, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 3, 2, 1, 0],
      curveBehavior: 'slowDecay'
    },
    { 
      name: 'How to Use Journey Maps', 
      type: 'article', 
      lastInteraction: 45, 
      viewsLast30Days: 12, 
      previousViews: 86, 
      change: -85.1, 
      lifetimeViews: 3200,
      viewHistory: [0, 0, 0, 0, 0, 1, 2, 3, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 
        4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 
        4, 5, 6, 7, 8, 10, 12, 15, 18, 20, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0],
      curveBehavior: 'recentSpike'
    },
    { 
      name: 'Customer Journey Templates', 
      type: 'article', 
      lastInteraction: 18, 
      viewsLast30Days: 26, 
      previousViews: 45, 
      change: -42.2, 
      lifetimeViews: 1450,
      viewHistory: [3, 4, 5, 6, 7, 8, 9, 10, 5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 
        2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 
        8, 9, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 4, 3],
      curveBehavior: 'recentSpike'
    },
    { 
      name: 'Analytics Exports', 
      type: 'feature', 
      lastInteraction: 27, 
      viewsLast30Days: 16, 
      previousViews: 31, 
      change: -48.4, 
      lifetimeViews: 950,
      viewHistory: [4, 4, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 6, 8, 10, 9, 8, 7, 
        6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 
        1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0],
      curveBehavior: 'recentSpike'
    }
  ];

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
      category: getCategory(item.change, engagementRatio),
      curveBehavior: item.curveBehavior,
      viewHistory: item.viewHistory || []
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

  // Get curve behavior icon and description
  function getCurveBehavior(behavior: CurveBehavior | undefined) {
    switch (behavior) {
      case 'recentSpike':
        return { icon: '📈', label: 'Recent Spike', description: 'Increase in views in last 7-14 days' };
      case 'suddenDrop':
        return { icon: '📉', label: 'Sudden Drop', description: 'Sharp decline after sustained usage' };
      case 'lowValue':
        return { icon: '🧊', label: 'Low Value', description: 'Very low engagement over entire tracked period' };
      case 'slowDecay':
        return { icon: '🔄', label: 'Slow Decay', description: 'Gradual decline, may still have value' };
      default:
        return { icon: '❓', label: 'Unknown', description: 'Behavior pattern not classified' };
    }
  }

  // Helper to get the suggested action based on curve behavior
  function getSuggestedAction(item: StaleContentItem) {
    const engagementRatio = item.lifetimeViews ? (item.viewsLast30Days / item.lifetimeViews) * 100 : 0;
    const category = getCategory(item.change, engagementRatio);
    
    // Adjust recommendation based on curve behavior
    if (item.curveBehavior === 'recentSpike') {
      return { icon: <TrendingUp className="h-4 w-4" />, action: 'Promote' };
    }
    
    switch (category) {
      case 'stale': 
        return item.curveBehavior === 'slowDecay' 
          ? { icon: <RefreshCw className="h-4 w-4" />, action: 'Refresh' }
          : { icon: <Archive className="h-4 w-4" />, action: 'Archive' };
      case 'watch': 
        return { icon: <RefreshCw className="h-4 w-4" />, action: 'Refresh' };
      case 'reevaluate': 
        return { icon: <TrendingUp className="h-4 w-4" />, action: 'Promote' };
      default: 
        return { icon: <HelpCircle className="h-4 w-4" />, action: 'Investigate' };
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

  // Generate trend mini-chart for an item
  const generateMiniTrend = (viewHistory: number[] = []) => {
    // Get last 30 days of data
    const last30Days = viewHistory.slice(0, 30).reverse();
    const data = last30Days.map((value, index) => ({
      day: index,
      views: value
    }));

    return (
      <div className="h-10 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="#8884d8" 
              dot={false} 
              strokeWidth={1.5} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
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
          
          <Select value={selectedCurveFilter} onValueChange={(value) => setSelectedCurveFilter(value as any)}>
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
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
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
                      const behavior = getCurveBehavior(data.curveBehavior);
                      return (
                        <div className="bg-white p-3 border rounded-md shadow-md">
                          <p className="font-semibold text-sm">{data.name}</p>
                          <p className="text-xs">Last interaction: {data.lastInteraction} days ago</p>
                          <p className="text-xs">Recent views: {formatNumber(data.viewsLast30Days)}</p>
                          <p className="text-xs">Usage change: {data.change}%</p>
                          <p className="text-xs">{behavior.icon} {behavior.label}</p>
                          <p className="text-xs mt-1 font-medium text-muted-foreground">
                            Recommendation: {getSuggestedAction({ 
                              name: data.name, 
                              type: data.type, 
                              lastInteraction: data.lastInteraction,
                              viewsLast30Days: data.viewsLast30Days,
                              previousViews: data.previousViews,
                              change: data.change,
                              curveBehavior: data.curveBehavior as CurveBehavior
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
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">View Behavior Classification</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center p-2 border rounded-md bg-slate-50">
                <div className="text-2xl mr-2">📈</div>
                <div>
                  <h5 className="text-sm font-medium">Recent Spike</h5>
                  <p className="text-xs text-muted-foreground">Increase in views in last 7-14 days</p>
                </div>
              </div>
              <div className="flex items-center p-2 border rounded-md bg-slate-50">
                <div className="text-2xl mr-2">📉</div>
                <div>
                  <h5 className="text-sm font-medium">Sudden Drop</h5>
                  <p className="text-xs text-muted-foreground">Sharp decline after sustained usage</p>
                </div>
              </div>
              <div className="flex items-center p-2 border rounded-md bg-slate-50">
                <div className="text-2xl mr-2">🧊</div>
                <div>
                  <h5 className="text-sm font-medium">Low Value</h5>
                  <p className="text-xs text-muted-foreground">Very low engagement over entire period</p>
                </div>
              </div>
              <div className="flex items-center p-2 border rounded-md bg-slate-50">
                <div className="text-2xl mr-2">🔄</div>
                <div>
                  <h5 className="text-sm font-medium">Slow Decay</h5>
                  <p className="text-xs text-muted-foreground">Gradual decline, may still have value</p>
                </div>
              </div>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Content</TableHead>
                <TableHead className="w-[120px] text-center">Behavior</TableHead>
                <TableHead className="w-[100px] text-center">Recency</TableHead>
                <TableHead className="w-[180px] text-center">View Trend (30d)</TableHead>
                <TableHead className="w-[100px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => {
                const { icon, action } = getSuggestedAction(item);
                const behavior = getCurveBehavior(item.curveBehavior);
                return (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center justify-center gap-1.5 cursor-help">
                            <span className="text-lg">{behavior.icon}</span>
                            <span className="text-xs">{behavior.label}</span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{behavior.label}</h4>
                            <p className="text-xs text-muted-foreground">{behavior.description}</p>
                            <p className="text-xs">View change: {item.change}%</p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {item.lastInteraction}d
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {generateMiniTrend(item.viewHistory)}
                      </div>
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
                              <span className="block">Behavior: {behavior.label}</span>
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

