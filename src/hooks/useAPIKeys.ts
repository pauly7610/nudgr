import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useAPIKeys = () => {
  const queryClient = useQueryClient();

  const generateAPIKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'fk_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const getAPIKeys = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const apiKey = generateAPIKey();

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          key_name: keyName,
          api_key: apiKey,
          allowed_domains: allowedDomains,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const updates: any = {};
      if (keyName !== undefined) updates.key_name = keyName;
      if (allowedDomains !== undefined) updates.allowed_domains = allowedDomains;
      if (isActive !== undefined) updates.is_active = isActive;

      const { data, error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
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