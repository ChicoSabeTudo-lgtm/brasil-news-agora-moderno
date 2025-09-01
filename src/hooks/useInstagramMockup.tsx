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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Remove timestamp to prevent infinite re-renders
  const mockupUrl = configuration?.mockup_image_url || null;
    
  return {
    mockupUrl,
    refetchMockup: refetch
  };
};