import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PaymentStatus = 'Pendente' | 'Pago';

export interface InsertionOrder {
  id: string;
  pi_number: string;
  contact_id?: string | null;
  vehicle: string;
  value: number;
  start_date: string;
  end_date: string;
  payment_status: PaymentStatus;
  email_sent: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useInsertionOrders() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<InsertionOrder[]>([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('insertion_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders((data || []) as InsertionOrder[]);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar PIs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const addOrder = async (payload: Omit<InsertionOrder, 'id'>) => {
    const { data, error } = await supabase
      .from('insertion_orders')
      .insert(payload)
      .select('*')
      .single();
    
    if (error) throw error;
    setOrders((prev) => [data as InsertionOrder, ...prev]);
    return data as InsertionOrder;
  };

  const updateOrder = async (id: string, updates: Partial<InsertionOrder>) => {
    const { data, error } = await supabase
      .from('insertion_orders')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    setOrders((prev) => prev.map((o) => (o.id === id ? (data as InsertionOrder) : o)));
    return data as InsertionOrder;
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase
      .from('insertion_orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return { 
    loading, 
    error, 
    orders, 
    fetchOrders, 
    addOrder, 
    updateOrder, 
    deleteOrder 
  };
}
