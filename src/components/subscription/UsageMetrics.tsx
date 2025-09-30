import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Database, AlertTriangle, TrendingUp } from 'lucide-react';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { Skeleton } from '@/components/ui/skeleton';

export const UsageMetrics = () => {
  const { recordingUsage, storageUsage, totalEstimatedCost, isLoading } = useUsageTracking();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (percentUsed: number) => {
    if (percentUsed >= 90) return 'text-red-600 dark:text-red-400';
    if (percentUsed >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 90) return '[&>div]:bg-red-600';
    if (percentUsed >= 75) return '[&>div]:bg-yellow-600';
    return '[&>div]:bg-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Session Recordings Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <CardTitle>Session Recordings</CardTitle>
              </div>
              {recordingUsage.isUnlimited ? (
                <Badge variant="secondary">Unlimited</Badge>
              ) : (
                <Badge 
                  variant={recordingUsage.percentUsed >= 90 ? "destructive" : "secondary"}
                >
                  {recordingUsage.percentUsed.toFixed(0)}% Used
                </Badge>
              )}
            </div>
            <CardDescription>
              Current billing period usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!recordingUsage.isUnlimited && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used</span>
                    <span className={getStatusColor(recordingUsage.percentUsed)}>
                      {formatNumber(recordingUsage.current)} / {formatNumber(recordingUsage.limit)} {recordingUsage.unit}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(recordingUsage.percentUsed, 100)} 
                    className={getProgressColor(recordingUsage.percentUsed)}
                  />
                </div>

                {recordingUsage.overage > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Overage</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {formatNumber(recordingUsage.overage)} {recordingUsage.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Cost</span>
                      <span className="font-semibold">
                        {formatCurrency(recordingUsage.estimatedCost)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(recordingUsage.overagePrice)} per additional recording
                    </p>
                  </div>
                )}
              </>
            )}

            {recordingUsage.isUnlimited && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Unlimited session recordings included in your plan
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Storage Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Data Storage</CardTitle>
              </div>
              {storageUsage.isUnlimited ? (
                <Badge variant="secondary">100 GB Included</Badge>
              ) : (
                <Badge 
                  variant={storageUsage.percentUsed >= 90 ? "destructive" : "secondary"}
                >
                  {storageUsage.percentUsed.toFixed(0)}% Used
                </Badge>
              )}
            </div>
            <CardDescription>
              Total data stored this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className={getStatusColor(storageUsage.percentUsed)}>
                  {storageUsage.current.toFixed(2)} / {storageUsage.limit} {storageUsage.unit}
                </span>
              </div>
              <Progress 
                value={Math.min(storageUsage.percentUsed, 100)} 
                className={getProgressColor(storageUsage.percentUsed)}
              />
            </div>

            {storageUsage.overage > 0 && (
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Overage</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {storageUsage.overage.toFixed(2)} {storageUsage.unit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Cost</span>
                  <span className="font-semibold">
                    {formatCurrency(storageUsage.estimatedCost)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(storageUsage.overagePrice)} per additional GB
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Total Usage Alert */}
      {totalEstimatedCost > 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Estimated overage charges this billing period:</span>
              <span className="font-bold text-lg">
                {formatCurrency(totalEstimatedCost)}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* High Usage Warnings */}
      {(recordingUsage.percentUsed >= 75 || storageUsage.percentUsed >= 75) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You're approaching your usage limits. Consider upgrading your plan to avoid overage charges.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
