import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface DashboardConfig {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  layout: any;
  filters: any;
  is_default: boolean;
  is_shared: boolean;
  shared_with_roles: string[];
  created_at: string;
  updated_at: string;
}

export const useDashboardConfigs = () => {
  return useQuery({
    queryKey: ['dashboard-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_configs')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DashboardConfig[];
    },
  });
};

export const useCreateDashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (config: Partial<DashboardConfig>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('dashboard_configs')
        .insert({
          name: config.name!,
          description: config.description,
          layout: config.layout || [],
          filters: config.filters || {},
          is_default: config.is_default || false,
          is_shared: config.is_shared || false,
          shared_with_roles: config.shared_with_roles || [],
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-configs'] });
      toast({
        title: 'Dashboard Created',
        description: 'Your dashboard configuration has been saved.',
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

export const useUpdateDashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DashboardConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('dashboard_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-configs'] });
      toast({
        title: 'Dashboard Updated',
        description: 'Your changes have been saved.',
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
