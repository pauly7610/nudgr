import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface Prediction {
  type: 'friction_increase' | 'conversion_drop' | 'performance_issue' | 'improvement';
  confidence: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
}

const mockPredictions: Prediction[] = [
  {
    type: 'friction_increase',
    confidence: 87,
    description: 'Checkout form likely to experience increased friction in next 24h',
    impact: 'high',
    timeframe: '24 hours',
  },
  {
    type: 'conversion_drop',
    confidence: 72,
    description: 'Mobile conversion rate may drop by 15% this week',
    impact: 'medium',
    timeframe: '7 days',
  },
  {
    type: 'improvement',
    confidence: 65,
    description: 'Landing page optimization showing positive trends',
    impact: 'low',
    timeframe: '3 days',
  },
];

export const PredictiveAnalytics = () => {
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
        <div className="space-y-4">
          {mockPredictions.map((prediction, index) => (
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
  );
};
