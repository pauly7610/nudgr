
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Clock, Archive, RefreshCw, TrendingUp, HelpCircle } from 'lucide-react';
import { StaleContentItem } from './types';
import { getCurveBehavior, getSuggestedAction, formatNumber } from './utils';
import { MiniTrendChart } from './MiniTrendChart';

interface StaleContentTableProps {
  filteredContent: StaleContentItem[];
}

export const StaleContentTable: React.FC<StaleContentTableProps> = ({ filteredContent }) => {
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'article': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'feature': return <Archive className="h-5 w-5 text-purple-500" />;
      case 'page': return <Clock className="h-5 w-5 text-green-500" />;
      default: return null;
    }
  };

  // Map action icon names to components
  const getActionIcon = (iconName: string) => {
    switch(iconName) {
      case 'trending-up': return <TrendingUp className="h-4 w-4" />;
      case 'refresh-cw': return <RefreshCw className="h-4 w-4" />;
      case 'archive': return <Archive className="h-4 w-4" />;
      case 'help-circle': 
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
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
                  <MiniTrendChart viewHistory={item.viewHistory} />
                </div>
              </TableCell>
              <TableCell>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full h-8 justify-center">
                      {getActionIcon(icon)}
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
  );
};
