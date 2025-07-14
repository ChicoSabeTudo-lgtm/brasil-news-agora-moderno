import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import chicosabetudoLogo from "@/assets/chicosabetudo-logo.png";

export const useSiteLogo = () => {
  const { data: configuration, refetch } = useQuery({
    queryKey: ['site-logo'], // Chave diferente para evitar conflito
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configurations')
        .select('logo_url')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('Error fetching logo configuration:', error);
        return null;
      }

      return data;
    },
    staleTime: 0, // Força refetch imediato
    refetchOnWindowFocus: true, // Refetch quando a janela ganha foco
  });

  // Retorna a logo do banco de dados ou a logo padrão
  return {
    logoUrl: configuration?.logo_url || chicosabetudoLogo,
    refetchLogo: refetch
  };
};