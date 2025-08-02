import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SiteConfiguration {
  id: string;
  ads_txt_content: string | null;
  header_code: string | null;
  footer_code: string | null;
  webhook_url: string | null;
  otp_webhook_url: string | null;
  social_webhook_url: string | null;
  logo_url: string | null;
  mockup_image_url: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export const useSiteConfigurations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configurations, isLoading } = useQuery({
    queryKey: ['site-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configurations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching configurations:', error);
        throw error;
      }

      return data as SiteConfiguration[];
    },
  });

  const updateConfiguration = useMutation({
    mutationFn: async (updates: Partial<SiteConfiguration>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('site_configurations')
        .update({
          ...updates,
          updated_by: user.id,
        })
        .eq('id', configurations?.[0]?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating configuration:', error);
        throw error;
      }

      return data as SiteConfiguration;
    },
    onSuccess: () => {
      // Força invalidação e refetch imediato
      queryClient.invalidateQueries({ queryKey: ['site-configurations'] });
      queryClient.invalidateQueries({ queryKey: ['site-logo'] });
      queryClient.refetchQueries({ queryKey: ['site-logo'] });
      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating configuration:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configurações.',
        variant: 'destructive',
      });
    },
  });

  return {
    configuration: configurations?.[0],
    isLoading,
    updateConfiguration,
  };
};