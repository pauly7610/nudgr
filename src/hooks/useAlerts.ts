import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface AlertConfig {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  alert_type: 'friction_spike' | 'error_rate' | 'conversion_drop' | 'performance' | 'custom';
  conditions: any;
  notification_channels: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AlertConfig[];
    },
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alert: Partial<AlertConfig>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('alerts_config')
        .insert({
          name: alert.name!,
          description: alert.description,
          alert_type: alert.alert_type!,
          conditions: alert.conditions!,
          notification_channels: alert.notification_channels || ['email'],
          is_active: alert.is_active !== undefined ? alert.is_active : true,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('alerts_config')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
