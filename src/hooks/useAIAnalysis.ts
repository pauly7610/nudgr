import { useState } from 'react';
import { apiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/ui/use-toast';

type AnalysisType = 'journey' | 'cohort' | 'element' | 'general';

interface AnalyzeResponse {
  provider: string;
  model: string;
  analysisType: AnalysisType;
  summary: string;
  recommendations: string[];
  confidence: number;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeWithAI = async (
    frictionData: Record<string, unknown>,
    analysisType: AnalysisType = 'general'
  ) => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const data = await apiRequest<AnalyzeResponse>('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({
          analysisType,
          context: frictionData.context ? String(frictionData.context) : undefined,
        }),
      });

      const generatedAnalysis = [
        data.summary,
        '',
        `Provider: ${data.provider}`,
        `Model: ${data.model}`,
        `Confidence: ${Math.round(data.confidence * 100)}%`,
        '',
        'Recommendations:',
        ...data.recommendations.map((recommendation, index) => `${index + 1}. ${recommendation}`),
      ].join('\n');

      setAnalysis(generatedAnalysis);
      toast({
        title: "AI Analysis Complete",
        description: "Insights have been generated successfully.",
      });
    } catch (error) {
      console.error('Error analyzing with AI:', error);
      
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to generate AI insights.";
      let title = "Analysis Failed";
      
      // Handle rate limiting specifically
      if (errorMessage.includes('Rate limit exceeded') || errorMessage.includes('429')) {
        title = "Rate Limit Exceeded";
      }
      
      toast({
        title,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyzeWithAI, isAnalyzing, analysis };
};
