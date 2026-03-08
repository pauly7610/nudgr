import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/ui/use-toast';

export interface AlertConfig {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  alert_type: 'friction_spike' | 'error_rate' | 'conversion_drop' | 'performance' | 'custom';
  conditions: Record<string, unknown>;
  notification_channels: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AlertConfigApi {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  alertType: AlertConfig['alert_type'];
  conditions: Record<string, unknown>;
  notificationChannels: string[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const toUiModel = (alert: AlertConfigApi): AlertConfig => ({
  id: alert.id,
  user_id: alert.userId,
  name: alert.name,
  description: alert.description,
  alert_type: alert.alertType,
  conditions: alert.conditions,
  notification_channels: alert.notificationChannels,
  is_active: alert.isActive,
  last_triggered_at: alert.lastTriggeredAt,
  created_at: alert.createdAt,
  updated_at: alert.updatedAt,
});

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      try {
        const data = await apiRequest<AlertConfigApi[]>('/alerts');
        return data.map(toUiModel);
      } catch {
        return [];
      }
    },
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alert: Partial<AlertConfig>) => {
      const data = await apiRequest<AlertConfigApi>('/alerts', {
        method: 'POST',
        body: JSON.stringify({
          name: alert.name,
          description: alert.description,
          alertType: alert.alert_type,
          conditions: alert.conditions ?? {},
          notificationChannels: alert.notification_channels || ['email'],
          isActive: alert.is_active !== undefined ? alert.is_active : true,
        }),
      });

      return toUiModel(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Alert Created',
        description: 'Your alert has been configured successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useToggleAlert = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const data = await apiRequest<AlertConfigApi>(`/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: is_active }),
      });

      return toUiModel(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: data.is_active ? 'Alert Enabled' : 'Alert Disabled',
        description: `Alert "${data.name}" has been ${data.is_active ? 'activated' : 'deactivated'}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
