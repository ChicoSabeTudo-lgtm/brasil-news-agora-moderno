import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteConfig {
  header_code: string | null;
  footer_code: string | null;
}

export const useSiteConfig = () => {
  const { data: config, isLoading } = useQuery({
    queryKey: ['site-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configurations')
        .select('header_code, footer_code')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching site config:', error);
        return { header_code: null, footer_code: null };
      }

      return data as SiteConfig;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    config: config || { header_code: null, footer_code: null },
    isLoading,
  };
};