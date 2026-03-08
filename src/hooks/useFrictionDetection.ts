import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/ui/use-toast';

interface FrictionEvent {
  id: string;
  eventType: string;
  pageUrl: string;
  severityScore: number;
}

interface MetricsResponse {
  events: FrictionEvent[];
}

interface FrictionScore {
  pageUrl: string;
  avgSeverity: number;
  totalEvents: number;
}

export const useFrictionDetection = () => {
  const { toast } = useToast();

  const detectFriction = useMutation({
    mutationFn: async () => {
      const data = await apiRequest<MetricsResponse>('/metrics/recent');

      const grouped = new Map<string, { totalSeverity: number; totalEvents: number }>();
      for (const event of data.events) {
        const bucket = grouped.get(event.pageUrl) ?? { totalSeverity: 0, totalEvents: 0 };
        bucket.totalSeverity += event.severityScore;
        bucket.totalEvents += 1;
        grouped.set(event.pageUrl, bucket);
      }

      const frictionScores: FrictionScore[] = Array.from(grouped.entries()).map(([pageUrl, stats]) => ({
        pageUrl,
        avgSeverity: stats.totalEvents ? stats.totalSeverity / stats.totalEvents : 0,
        totalEvents: stats.totalEvents,
      }));

      return {
        totalEvents: data.events.length,
        frictionScores,
      };
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
    mutationFn: async (events: Array<{ severityScore?: number }>) => {
      const severityScores = events.map((event) => event.severityScore ?? 0);
      const highSeverityCount = severityScores.filter((score) => score >= 7).length;
      const averageSeverity = severityScores.length
        ? severityScores.reduce((sum, score) => sum + score, 0) / severityScores.length
        : 0;

      return {
        highSeverityCount,
        averageSeverity,
        totalEvents: events.length,
      };
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
