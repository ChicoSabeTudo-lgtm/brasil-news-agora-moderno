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

export type BriefFilterType = 'my-today' | 'all-today' | 'my-all' | 'all-all';

interface UseDailyBriefsOptions {
  filterType?: BriefFilterType;
}

export const useDailyBriefs = (options?: UseDailyBriefsOptions) => {
  const [briefs, setBriefs] = useState<DailyBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<BriefFilterType>(options?.filterType || 'my-today');

  const fetchBriefs = async (filter?: BriefFilterType) => {
    try {
      setLoading(true);
      const currentFilter = filter || filterType;
      
      // Get local date in YYYY-MM-DD format (Brazil timezone)
      const today = new Date();
      const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('Buscando pautas com filtro:', currentFilter, 'Data:', localDate, 'Usuário:', user?.id);
      
      let query = supabase
        .from('daily_briefs')
        .select(`
          *,
          categories:category_id (
            name,
            color
          )
        `);

      // Apply date filter
      if (currentFilter === 'my-today' || currentFilter === 'all-today') {
        query = query.eq('brief_date', localDate);
      }

      // Apply user filter
      if (currentFilter === 'my-today' || currentFilter === 'my-all') {
        if (user?.id) {
          query = query.eq('created_by', user.id);
        }
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('Pautas encontradas:', data?.length || 0);
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
        .select(`
          *,
          categories:category_id (
            name,
            color
          )
        `)
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
  }, [filterType]);

  const changeFilter = (newFilter: BriefFilterType) => {
    setFilterType(newFilter);
    fetchBriefs(newFilter);
  };

  return {
    briefs,
    loading,
    error,
    filterType,
    refetch: fetchBriefs,
    changeFilter,
    createBrief,
    updateBrief,
    deleteBrief
  };
};