import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFrictionDetection } from '@/hooks/useFrictionDetection';
import { Brain, Loader2, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const AIFrictionDetection = () => {
  const { detectFriction, isDetecting, detectionResult } = useFrictionDetection();

  const highestScore = detectionResult?.frictionScores?.length
    ? Math.max(...detectionResult.frictionScores.map((item) => item.avgSeverity * 10))
    : 0;

  const getFrictionColor = (score: number) => {
    if (score >= 70) return 'text-red-600 dark:text-red-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Friction Detection</CardTitle>
          </div>
          <Button
            onClick={() => detectFriction()}
            disabled={isDetecting}
            size="sm"
          >
            {isDetecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          AI-powered behavioral analysis and friction detection
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isDetecting && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Analyzing friction patterns...
              </span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {detectionResult && !isDetecting && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{detectionResult.totalEvents}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {detectionResult.frictionScores?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Pages Analyzed</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {highestScore.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Highest Score</div>
              </div>
            </div>

            {/* Top Friction Pages */}
            {detectionResult.frictionScores && detectionResult.frictionScores.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Top Friction Pages
                </h4>
                {detectionResult.frictionScores.slice(0, 5).map((page, index: number) => (
                  <div key={`${page.pageUrl}-${index}`} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm truncate">{page.pageUrl}</div>
                        <div className="text-xs text-muted-foreground">
                          {page.totalEvents} events
                        </div>
                      </div>
                      <Badge
                        className={getFrictionColor(page.avgSeverity * 10)}
                        variant="secondary"
                      >
                        {(page.avgSeverity * 10).toFixed(1)}
                      </Badge>
                    </div>
                    <Progress 
                      value={page.avgSeverity * 10} 
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!detectionResult && !isDetecting && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Click "Run Analysis" to detect friction patterns</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
