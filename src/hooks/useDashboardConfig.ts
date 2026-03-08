import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/ui/use-toast';

export interface DashboardConfig {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  layout: Record<string, unknown> | unknown[];
  filters: Record<string, unknown>;
  is_default: boolean;
  is_shared: boolean;
  shared_with_roles: string[];
  created_at: string;
  updated_at: string;
}

interface DashboardConfigApi {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  layout: Record<string, unknown> | unknown[];
  filters: Record<string, unknown>;
  isDefault: boolean;
  isShared: boolean;
  sharedWithRoles: string[];
  createdAt: string;
  updatedAt: string;
}

const toUiModel = (config: DashboardConfigApi): DashboardConfig => ({
  id: config.id,
  user_id: config.userId,
  name: config.name,
  description: config.description,
  layout: config.layout,
  filters: config.filters,
  is_default: config.isDefault,
  is_shared: config.isShared,
  shared_with_roles: config.sharedWithRoles,
  created_at: config.createdAt,
  updated_at: config.updatedAt,
});

export const useDashboardConfigs = () => {
  return useQuery({
    queryKey: ['dashboard-configs'],
    queryFn: async () => {
      try {
        const data = await apiRequest<DashboardConfigApi[]>('/dashboard-configs');
        return data.map(toUiModel);
      } catch {
        return [];
      }
    },
  });
};

export const useCreateDashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (config: Partial<DashboardConfig>) => {
      const data = await apiRequest<DashboardConfigApi>('/dashboard-configs', {
        method: 'POST',
        body: JSON.stringify({
          name: config.name,
          description: config.description,
          layout: config.layout || [],
          filters: config.filters || {},
          isDefault: config.is_default || false,
          isShared: config.is_shared || false,
          sharedWithRoles: config.shared_with_roles || [],
        }),
      });

      return toUiModel(data);
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
      const data = await apiRequest<DashboardConfigApi>(`/dashboard-configs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: updates.name,
          description: updates.description,
          layout: updates.layout,
          filters: updates.filters,
          isDefault: updates.is_default,
          isShared: updates.is_shared,
          sharedWithRoles: updates.shared_with_roles,
        }),
      });

      return toUiModel(data);
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
