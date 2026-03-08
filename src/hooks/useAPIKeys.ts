import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/apiClient";

interface ApiKeyResponse {
  id: string;
  keyName: string;
  keyPrefix: string;
  isActive: boolean;
  allowedDomains: string[];
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  apiKey?: string;
}

interface ApiKeyUiModel {
  id: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  allowed_domains: string[];
  last_used_at: string | null;
  created_at: string;
}

const toUiModel = (key: ApiKeyResponse): ApiKeyUiModel => {
  const fallbackMaskedKey = `${key.keyPrefix}************************`;

  return {
    id: key.id,
    key_name: key.keyName,
    api_key: key.apiKey || fallbackMaskedKey,
    is_active: key.isActive,
    allowed_domains: key.allowedDomains,
    last_used_at: key.lastUsedAt ?? null,
    created_at: key.createdAt,
  };
};

export const useAPIKeys = () => {
  const queryClient = useQueryClient();

  const getAPIKeys = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const data = await apiRequest<ApiKeyResponse[]>('/api-keys');
      return data.map(toUiModel);
    },
  });

  const createAPIKey = useMutation({
    mutationFn: async ({ 
      keyName, 
      allowedDomains 
    }: { 
      keyName: string; 
      allowedDomains: string[] 
    }) => {
      const data = await apiRequest<ApiKeyResponse>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ keyName, allowedDomains }),
      });

      return toUiModel(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "API key created",
        description: "Your new API key has been generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create API key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAPIKey = useMutation({
    mutationFn: async ({ 
      id, 
      keyName, 
      allowedDomains, 
      isActive 
    }: { 
      id: string; 
      keyName?: string; 
      allowedDomains?: string[]; 
      isActive?: boolean 
    }) => {
      const updates: Record<string, unknown> = {};
      if (keyName !== undefined) updates.keyName = keyName;
      if (allowedDomains !== undefined) updates.allowedDomains = allowedDomains;
      if (isActive !== undefined) updates.isActive = isActive;

      const data = await apiRequest<ApiKeyResponse>(`/api-keys/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      return toUiModel(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "API key updated",
        description: "Changes saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update API key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAPIKey = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest<{ ok: true }>(`/api-keys/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "API key deleted",
        description: "The API key has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete API key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    apiKeys: getAPIKeys.data || [],
    isLoading: getAPIKeys.isLoading,
    createAPIKey,
    updateAPIKey,
    deleteAPIKey,
  };
};