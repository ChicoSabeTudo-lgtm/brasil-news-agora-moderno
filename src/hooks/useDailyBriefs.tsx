import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyBrief {
  id: string;
  title: string;
  description?: string;
  brief_date: string;
  brief_time: string;
  status: string;
  priority: string;
  category_id?: string;
  image_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    color: string;
  };
}

export const useDailyBriefs = () => {
  const [briefs, setBriefs] = useState<DailyBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefs = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_briefs')
        .select(`
          *,
          categories:category_id (
            name,
            color
          )
        `)
        .eq('brief_date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBriefs(data || []);
    } catch (error: any) {
      console.error('Error fetching daily briefs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createBrief = async (briefData: any) => {
    try {
      const { data, error } = await supabase
        .from('daily_briefs')
        .insert([{
          ...briefData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchBriefs();
      return data;
    } catch (error: any) {
      console.error('Error creating brief:', error);
      throw error;
    }
  };

  const updateBrief = async (id: string, briefData: Partial<DailyBrief>) => {
    try {
      const { data, error } = await supabase
        .from('daily_briefs')
        .update(briefData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchBriefs();
      return data;
    } catch (error: any) {
      console.error('Error updating brief:', error);
      throw error;
    }
  };

  const deleteBrief = async (id: string) => {
    try {
      const { error } = await supabase
        .from('daily_briefs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBriefs();
    } catch (error: any) {
      console.error('Error deleting brief:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBriefs();
  }, []);

  return {
    briefs,
    loading,
    error,
    refetch: fetchBriefs,
    createBrief,
    updateBrief,
    deleteBrief
  };
};