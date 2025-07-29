import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInstagramMockup = () => {
  const { data: configuration, refetch } = useQuery({
    queryKey: ['instagram-mockup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configurations')
        .select('mockup_image_url')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('Error fetching Instagram mockup configuration:', error);
        return null;
      }

      return data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const mockupUrl = configuration?.mockup_image_url 
    ? `${configuration.mockup_image_url}?t=${Date.now()}`
    : null;
    
  return {
    mockupUrl,
    refetchMockup: refetch
  };
};