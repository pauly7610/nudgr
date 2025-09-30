import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Zap, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  database: 'healthy' | 'degraded' | 'down';
  functions: 'healthy' | 'degraded' | 'down';
  storage: 'healthy' | 'degraded' | 'down';
}

export const SystemHealth = () => {
  const [health, setHealth] = useState<HealthStatus>({
    database: 'healthy',
    functions: 'healthy',
    storage: 'healthy',
  });
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    const newHealth: HealthStatus = {
      database: 'healthy',
      functions: 'healthy',
      storage: 'healthy',
    };

    // Check database
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      newHealth.database = error ? 'degraded' : 'healthy';
    } catch {
      newHealth.database = 'down';
    }

    // Check functions
    try {
      const { error } = await supabase.functions.invoke('api-access/stats');
      newHealth.functions = error ? 'degraded' : 'healthy';
    } catch {
      newHealth.functions = 'degraded';
    }

    // Check storage
    try {
      const { error } = await supabase.storage.from('friction-screenshots').list('', { limit: 1 });
      newHealth.storage = error ? 'degraded' : 'healthy';
    } catch {
      newHealth.storage = 'degraded';
    }

    setHealth(newHealth);
    setLastCheck(new Date());
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      healthy: 'default',
      degraded: 'secondary',
      down: 'destructive',
    };
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const allHealthy = Object.values(health).every(s => s === 'healthy');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
        <CardDescription>
          Last checked: {lastCheck.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!allHealthy && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Some services are experiencing issues
            </span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Database</span>
            </div>
            {getStatusBadge(health.database)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Edge Functions</span>
            </div>
            {getStatusBadge(health.functions)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Storage</span>
            </div>
            {getStatusBadge(health.storage)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
