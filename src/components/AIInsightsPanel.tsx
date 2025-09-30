import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { Badge } from '@/components/ui/badge';
import { FeatureGate } from '@/components/subscription/FeatureGate';

interface AIInsightsPanelProps {
  frictionData: any;
  analysisType?: 'journey' | 'cohort' | 'element' | 'general';
  title?: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ 
  frictionData, 
  analysisType = 'general',
  title = "AI Insights"
}) => {
  const { analyzeWithAI, isAnalyzing, analysis } = useAIAnalysis();

  return (
    <FeatureGate 
      feature="aiAnalysis"
      featureName="AI-Powered Analysis"
      description="Unlock intelligent recommendations and automated insights"
    >
      <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>
              Get AI-powered insights and recommendations to reduce friction
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            Powered by AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis && !isAnalyzing && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Click below to generate AI-powered insights about friction points
            </p>
            <Button onClick={() => analyzeWithAI(frictionData, analysisType)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Insights
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Analyzing friction data...</span>
          </div>
        )}

        {analysis && !isAnalyzing && (
          <div>
            <div className="prose prose-sm max-w-none mb-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {analysis}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => analyzeWithAI(frictionData, analysisType)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Regenerate Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    </FeatureGate>
  );
};
