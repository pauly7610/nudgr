import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHeatmapData } from '@/hooks/useHeatmapData';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MousePointer2, AlertTriangle } from 'lucide-react';

interface HeatmapViewerProps {
  pageUrl?: string;
  dateRange?: { start: string; end: string };
}

export const HeatmapViewer = ({ pageUrl, dateRange }: HeatmapViewerProps) => {
  const { data: heatmapData, isLoading } = useHeatmapData(pageUrl, dateRange);

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'click':
        return <MousePointer2 className="h-4 w-4" />;
      case 'rage_click':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <MousePointer2 className="h-4 w-4" />;
    }
  };

  const getFrictionColor = (score: number) => {
    if (score >= 70) return 'bg-red-500/20 text-red-700 dark:text-red-400';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-green-500/20 text-green-700 dark:text-green-400';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interaction Heatmap</CardTitle>
        <CardDescription>
          Click patterns and friction points across {pageUrl || 'all pages'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {heatmapData && heatmapData.length > 0 ? (
            heatmapData.slice(0, 10).map((point) => (
              <div
                key={point.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    {getInteractionIcon(point.interaction_type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{point.element_selector}</div>
                    <div className="text-sm text-muted-foreground">
                      {point.page_url} • {point.interaction_count} interactions
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {point.interaction_type.replace('_', ' ')}
                  </Badge>
                  <Badge className={getFrictionColor(point.friction_score)}>
                    {point.friction_score}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No heatmap data available for the selected filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
