import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AdType = 'banner' | 'reportagem' | 'rede_social';

export interface FinanceAdvertisement {
  id: string;
  contact_id?: string | null;
  client_name: string;
  ad_type: AdType;
  start_date: string;
  end_date: string;
  link?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useAdvertisements() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advertisements, setAdvertisements] = useState<FinanceAdvertisement[]>([]);

  const fetchAdvertisements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('finance_advertisements')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      setAdvertisements((data || []) as FinanceAdvertisement[]);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar propagandas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdvertisements(); }, [fetchAdvertisements]);

  const addAdvertisement = async (payload: Omit<FinanceAdvertisement, 'id'>) => {
    const { data, error } = await supabase
      .from('finance_advertisements')
      .insert(payload)
      .select('*')
      .single();
    
    if (error) throw error;
    setAdvertisements((prev) => [data as FinanceAdvertisement, ...prev]);
    return data as FinanceAdvertisement;
  };

  const updateAdvertisement = async (id: string, updates: Partial<FinanceAdvertisement>) => {
    const { data, error } = await supabase
      .from('finance_advertisements')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    setAdvertisements((prev) => prev.map((a) => (a.id === id ? (data as FinanceAdvertisement) : a)));
    return data as FinanceAdvertisement;
  };

  const deleteAdvertisement = async (id: string) => {
    const { error } = await supabase
      .from('finance_advertisements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    setAdvertisements((prev) => prev.filter((a) => a.id !== id));
  };

  return { 
    loading, 
    error, 
    advertisements, 
    fetchAdvertisements, 
    addAdvertisement, 
    updateAdvertisement, 
    deleteAdvertisement 
  };
}
