import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import chicosabetudoLogo from "@/assets/chicosabetudo-logo.png";

export const useSiteLogo = () => {
  const { data: configuration } = useQuery({
    queryKey: ['site-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configurations')
        .select('logo_url')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching logo configuration:', error);
        return null;
      }

      return data?.[0] || null;
    },
  });

  // Retorna a logo do banco de dados ou a logo padrão
  return configuration?.logo_url || chicosabetudoLogo;
};