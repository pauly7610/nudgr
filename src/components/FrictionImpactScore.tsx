
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useFrictionData } from '@/hooks/useFrictionData';

interface FrictionImpactScoreProps {
  flowId?: string;
  showTopElements?: boolean;
}

export const FrictionImpactScore: React.FC<FrictionImpactScoreProps> = ({
  flowId,
  showTopElements = false
}) => {
  const { flows, getFrictionImpactScore, getTopFrictionElements, setActiveFlowId } = useFrictionData();
  
  // If no flowId is provided, calculate for all flows
  const flowsToScore = flowId ? 
    flows.filter(flow => flow.id === flowId) : 
    flows;
  
  // Map of score ranges to severity levels
  const getSeverity = (score: number) => {
    if (score >= 80) return { label: "Critical", color: "bg-red-500" };
    if (score >= 60) return { label: "High", color: "bg-amber-500" };
    if (score >= 40) return { label: "Moderate", color: "bg-yellow-500" };
    if (score >= 20) return { label: "Low", color: "bg-green-500" };
    return { label: "Minimal", color: "bg-blue-500" };
  };
  
  const topElements = showTopElements ? getTopFrictionElements().slice(0, 5) : [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Friction Impact Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {flowsToScore.map(flow => {
          const score = getFrictionImpactScore(flow.id);
          const { label, color } = getSeverity(score);
          
          return (
            <div key={flow.id} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium">{flow.flow}</h3>
                  <p className="text-sm text-muted-foreground">{flow.steps[0].users.toLocaleString()} visitors</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${score >= 60 ? 'border-red-200 bg-red-50 text-red-700' : 
                    score >= 40 ? 'border-amber-200 bg-amber-50 text-amber-700' : 
                    'border-green-200 bg-green-50 text-green-700'}`}
                >
                  {label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <Progress value={score} max={100} className="h-2.5" 
                  style={{backgroundColor: "#e5e7eb"}} // Override default bg
                >
                  <div className={`h-full ${color}`} style={{width: `${score}%`, borderRadius: 'inherit'}}></div>
                </Progress>
                <span className="text-sm font-medium">{score}</span>
              </div>
              
              <div className="text-xs text-muted-foreground mt-1 mb-3">
                Impact scoring factors: drop-off rate, friction types, and visitor volume
              </div>
            </div>
          );
        })}
        
        {showTopElements && topElements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Highest Impact Elements</h3>
            <div className="space-y-2">
              {topElements.map((element, index) => (
                <div 
                  key={index}
                  className="p-3 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveFlowId(element.flowId)}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">{element.elementName}</div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-sm ${
                        element.score > 70 ? 'bg-red-100 text-red-700' : 
                        element.score > 50 ? 'bg-amber-100 text-amber-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        Score: {element.score}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
