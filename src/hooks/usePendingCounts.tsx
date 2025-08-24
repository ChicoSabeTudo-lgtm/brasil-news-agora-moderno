import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePendingCounts = () => {
  return useQuery({
    queryKey: ['pending-counts'],
    queryFn: async () => {
      const [contactResult, advertisingResult] = await Promise.all([
        supabase
          .from('contact_messages')
          .select('id')
          .eq('status', 'pending'),
        supabase
          .from('advertising_requests')
          .select('id')
          .eq('status', 'pending')
      ]);

      if (contactResult.error) {
        console.error('Error fetching contact messages:', contactResult.error);
      }
      
      if (advertisingResult.error) {
        console.error('Error fetching advertising requests:', advertisingResult.error);
      }

      return {
        contactMessages: contactResult.data?.length || 0,
        advertisingRequests: advertisingResult.data?.length || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });
};