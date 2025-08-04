import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlocksConfig {
  live_stream_block_enabled: boolean;
  poll_block_enabled: boolean;
}

export const useBlocksConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['blocks-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configurations')
        .select('live_stream_block_enabled, poll_block_enabled')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching blocks config:', error);
        throw error;
      }

      return data as BlocksConfig || {
        live_stream_block_enabled: true,
        poll_block_enabled: true
      };
    },
  });

  const updateBlocksConfig = useMutation({
    mutationFn: async (updates: Partial<BlocksConfig>) => {
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
        .eq('id', (await supabase.from('site_configurations').select('id').limit(1).single()).data?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating blocks config:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks-config'] });
      toast({
        title: 'Sucesso',
        description: 'Configuração de blocos atualizada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating blocks config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configuração de blocos.',
        variant: 'destructive',
      });
    },
  });

  return {
    config: config || { live_stream_block_enabled: true, poll_block_enabled: true },
    isLoading,
    updateBlocksConfig,
  };
};