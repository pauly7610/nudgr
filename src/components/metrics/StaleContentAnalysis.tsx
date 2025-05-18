
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EyeOff, Archive, Clock, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StaleContentItem {
  name: string;
  type: 'article' | 'feature' | 'page';
  lastInteraction: number; // days ago
  viewsLast30Days: number;
  previousViews: number;
  change: number;
}

interface StaleContentAnalysisProps {
  className?: string;
}

export const StaleContentAnalysis: React.FC<StaleContentAnalysisProps> = ({ className }) => {
  const [contentType, setContentType] = useState<'all' | 'article' | 'feature' | 'page'>('all');
  const [sortBy, setSortBy] = useState<'leastViewed' | 'mostStale' | 'largestDrop'>('leastViewed');

  // Mock data for stale content
  const staleContent: StaleContentItem[] = [
    { name: 'Technical Error Correlation', type: 'feature', lastInteraction: 67, viewsLast30Days: 3, previousViews: 29, change: -89.7 },
    { name: 'Advanced Segmentation', type: 'feature', lastInteraction: 78, viewsLast30Days: 5, previousViews: 54, change: -90.7 },
    { name: 'Legacy Landing Page', type: 'page', lastInteraction: 94, viewsLast30Days: 7, previousViews: 215, change: -96.7 },
    { name: 'Marketing Playbook: B2B SaaS', type: 'article', lastInteraction: 32, viewsLast30Days: 8, previousViews: 24, change: -66.7 },
    { name: 'How to Use Journey Maps', type: 'article', lastInteraction: 45, viewsLast30Days: 12, previousViews: 86, change: -85.1 },
    { name: 'Customer Journey Templates', type: 'article', lastInteraction: 18, viewsLast30Days: 26, previousViews: 45, change: -42.2 },
    { name: 'Analytics Exports', type: 'feature', lastInteraction: 27, viewsLast30Days: 16, previousViews: 31, change: -48.4 }
  ];

  // Filter and sort content based on user selections
  const filteredContent = staleContent
    .filter(item => contentType === 'all' || item.type === contentType)
    .sort((a, b) => {
      if (sortBy === 'leastViewed') return a.viewsLast30Days - b.viewsLast30Days;
      if (sortBy === 'mostStale') return b.lastInteraction - a.lastInteraction;
      return a.change - b.change; // largestDrop
    });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'article': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'feature': return <Archive className="h-5 w-5 text-purple-500" />;
      case 'page': return <Clock className="h-5 w-5 text-green-500" />;
      default: return null;
    }
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
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredContent.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" orientation="top" />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip
                  formatter={(value, name) => [value, name === 'viewsLast30Days' ? 'Views (Last 30 Days)' : name === 'lastInteraction' ? 'Days Since Last Interaction' : 'Previous Period Views']}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="viewsLast30Days" name="Views (Last 30 Days)" fill="#8884d8" barSize={20} />
                <Bar dataKey="lastInteraction" name="Days Since Last Interaction" fill="#eb8134" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Content</TableHead>
                <TableHead className="w-[150px] text-right">Last Used</TableHead>
                <TableHead className="w-[100px] text-right">Views</TableHead>
                <TableHead className="w-[100px] text-right">Change</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.lastInteraction} days ago</TableCell>
                  <TableCell className="text-right">{item.viewsLast30Days}</TableCell>
                  <TableCell className={`text-right font-medium ${item.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {item.change}%
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
