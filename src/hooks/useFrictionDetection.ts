import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useFrictionDetection = () => {
  const { toast } = useToast();

  const detectFriction = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('detect-friction');

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('Friction detection complete:', data);
      toast({
        title: 'Analysis Complete',
        description: `Analyzed ${data.totalEvents} events across ${data.frictionScores?.length || 0} pages`,
      });
    },
    onError: (error: Error) => {
      console.error('Friction detection error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const scoreFriction = useMutation({
    mutationFn: async (events: any[]) => {
      const { data, error } = await supabase.functions.invoke('score-friction', {
        body: { events },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('Friction scoring complete:', data);
      if (data.highSeverityCount > 0) {
        toast({
          title: '⚠️ High Friction Detected',
          description: `${data.highSeverityCount} high-severity events detected`,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      console.error('Friction scoring error:', error);
      toast({
        title: 'Scoring Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    detectFriction: detectFriction.mutate,
    scoreFriction: scoreFriction.mutate,
    isDetecting: detectFriction.isPending,
    isScoring: scoreFriction.isPending,
    detectionResult: detectFriction.data,
    scoringResult: scoreFriction.data,
  };
};
