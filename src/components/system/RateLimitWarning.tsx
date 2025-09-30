import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RateLimitInfo {
  current: number;
  limit: number;
  resetTime: Date;
}

export const RateLimitWarning = () => {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check rate limit from localStorage (would be set by API responses)
    const checkRateLimit = () => {
      const stored = localStorage.getItem('rate_limit_info');
      if (stored) {
        const info: RateLimitInfo = JSON.parse(stored);
        info.resetTime = new Date(info.resetTime);
        
        const usage = (info.current / info.limit) * 100;
        
        if (usage >= 80) {
          setRateLimitInfo(info);
          setShowWarning(true);
        }
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (!showWarning || !rateLimitInfo) return null;

  const usage = (rateLimitInfo.current / rateLimitInfo.limit) * 100;
  const isNearLimit = usage >= 90;

  return (
    <Alert variant={isNearLimit ? 'destructive' : 'default'} className="mb-4">
      {isNearLimit ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Info className="h-4 w-4" />
      )}
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>Rate Limit Warning:</strong> You've used {rateLimitInfo.current} of{' '}
          {rateLimitInfo.limit} requests ({usage.toFixed(0)}%).
          {isNearLimit && ' Requests may be throttled soon.'}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowWarning(false)}
        >
          Dismiss
        </Button>
      </AlertDescription>
    </Alert>
  );
};
