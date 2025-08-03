import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import chicosabetudoLogo from "@/assets/chicosabetudo-logo.png";

export const useSiteLogo = () => {
  const { data: configuration, refetch } = useQuery({
    queryKey: ['site-logo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configurations')
        .select('logo_url')
        .order('created_at', { ascending: false })
        .limit(1);

      // Se não há registros, retorna null em vez de erro
      if (error) {
        console.error('Error fetching logo configuration:', error);
        return null;
      }

      // Se não há dados ou array vazio, retorna null
      if (!data || data.length === 0) {
        return null;
      }

      return data[0];
    },
    staleTime: 0,
    gcTime: 0, // Não manter cache após ser unused
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Retorna a logo do banco de dados ou a logo padrão
  const logoUrl = configuration?.logo_url 
    ? `${configuration.logo_url}?t=${Date.now()}`  // Cache busting
    : chicosabetudoLogo;
    
  return {
    logoUrl,
    refetchLogo: refetch
  };
};