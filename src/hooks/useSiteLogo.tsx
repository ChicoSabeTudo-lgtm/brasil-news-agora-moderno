import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import chicosabetudoLogo from "@/assets/chicosabetudo-logo.png";

export const useSiteLogo = () => {
  const { data: configuration, refetch, isLoading } = useQuery({
    queryKey: ['site-logo-single'],
    queryFn: async () => {
      console.log('🔍 Fetching logo configuration...');
      
      const { data, error } = await supabase
        .from('site_configurations')
        .select('logo_url')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching logo configuration:', error);
        return null;
      }

      console.log('✅ Logo configuration fetched:', data);
      return data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Retorna a logo do banco de dados ou a logo padrão
  const logoUrl = configuration?.logo_url || chicosabetudoLogo;
  
  console.log('🖼️ Current logoUrl:', logoUrl, 'isLoading:', isLoading);
    
  return {
    logoUrl,
    refetchLogo: refetch,
    isLoading
  };
};