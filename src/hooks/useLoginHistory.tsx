import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LoginRecord {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  ip_address: string;
  user_agent: string;
  login_at: string;
  success: boolean;
  failure_reason?: string;
}

export const useLoginHistory = (limit: number = 10) => {
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogins = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .order('login_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setLogins(data || []);
    } catch (error: any) {
      console.error('❌ Error fetching login history:', error);
      toast({
        title: "Erro ao carregar histórico de logins",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logLogin = async (userEmail: string, userRole: string, success: boolean = true, failureReason?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('login_history')
        .insert([{
          user_id: user?.id,
          user_email: userEmail,
          user_role: userRole,
          success,
          failure_reason: failureReason,
        }]);

      if (error) throw error;
      
      console.log('✅ Login logged successfully');
    } catch (error: any) {
      console.error('❌ Error logging login:', error);
    }
  };

  useEffect(() => {
    fetchLogins();
  }, [limit]);

  return {
    logins,
    loading,
    fetchLogins,
    logLogin,
  };
};

