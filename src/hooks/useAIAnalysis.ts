import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type AnalysisType = 'journey' | 'cohort' | 'element' | 'general';

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeWithAI = async (frictionData: any, analysisType: AnalysisType = 'general') => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-friction', {
        body: { frictionData, analysisType }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "AI Analysis Complete",
          description: "Insights have been generated successfully.",
        });
      }
    } catch (error: any) {
      console.error('Error analyzing with AI:', error);
      
      const errorMessage = error?.message || "Failed to generate AI insights.";
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
