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
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      // Se há erro, retorna null
      if (error) {
        console.error('Error fetching logo configuration:', error);
        return null;
      }

      return data;
    },
    staleTime: 0,
    gcTime: 0, // Não manter cache após ser unused
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Retorna a logo do banco de dados ou a logo padrão
  const logoUrl = configuration?.logo_url 
    ? configuration.logo_url  // Remove cache busting desnecessário
    : chicosabetudoLogo;
    
  return {
    logoUrl,
    refetchLogo: refetch
  };
};