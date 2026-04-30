import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { useAnalyticsPropertyContext } from '@/contexts/AnalyticsPropertyContext';
import { useProductAnalyticsSummary } from '@/hooks/useProductAnalytics';

interface Prediction {
  type: 'friction_increase' | 'conversion_drop' | 'performance_issue' | 'improvement';
  confidence: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
}

export const PredictiveAnalytics = () => {
  const { selectedProperty } = useAnalyticsPropertyContext();
  const { data: analyticsSummary, isLoading } = useProductAnalyticsSummary(30, selectedProperty?.id ?? null);
  const predictions: Prediction[] = analyticsSummary?.predictions ?? [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'friction_increase':
      case 'conversion_drop':
      case 'performance_issue':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'improvement':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <FeatureGate 
      feature="predictiveAnalytics"
      featureName="Predictive Analytics"
      description="Get AI-powered predictions and trend analysis"
    >
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Predictive Analytics
        </CardTitle>
        <CardDescription>
          AI-powered predictions for upcoming friction patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Building predictions from live behavior...
          </div>
        )}

        {!isLoading && predictions.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No prediction is strong enough yet. Collect more traffic or generate local sample events to unlock forecasts.
          </div>
        )}

        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                {getIcon(prediction.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getImpactColor(prediction.impact)}>
                      {prediction.impact} impact
                    </Badge>
                    <Badge variant="outline">{prediction.timeframe}</Badge>
                  </div>
                  <p className="text-sm mb-2">{prediction.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Confidence:</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${prediction.confidence}%` }}
                      />
                    </div>
                    <span>{prediction.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </FeatureGate>
  );
};
