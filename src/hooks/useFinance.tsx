import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TxType = 'receita' | 'despesa';
export type TxStatus = 'Pendente' | 'Pago' | 'Atrasado';

export interface FinanceProject { id: string; name: string }
export interface FinanceCategory { id: string; name: string; type: TxType }
export interface FinanceContact { id: string; name: string; type: 'cliente' | 'fornecedor'; email?: string | null; phone?: string | null; company?: string | null; contact_person?: string | null; created_at?: string }
export interface FinanceTransaction {
  id: string;
  type: TxType;
  description: string;
  value: number;
  due_date: string; // yyyy-mm-dd
  pay_date: string | null;
  status: TxStatus;
  supplier?: string | null;
  contact_id?: string | null;
  project_id?: string | null;
  category_id?: string | null;
  method?: string | null;
  receipt_url?: string | null;
}

export function useFinanceData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<FinanceProject[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [contacts, setContacts] = useState<FinanceContact[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: proj }, { data: cat }, { data: tx }, { data: cts }] = await Promise.all([
        supabase.from('finance_projects').select('id,name').order('name'),
        supabase.from('finance_categories').select('id,name,type').order('name'),
        supabase.from('finance_transactions').select('*').order('due_date', { ascending: false }),
        supabase.from('finance_contacts').select('id,name,type,email,phone,company,contact_person,created_at').order('name'),
      ]);
      setProjects(proj || []);
      setCategories(cat || []);
      setTransactions((tx || []).map((t: any) => ({ ...t })));
      setContacts((cts || []).map((c: any) => ({ ...c })));
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addTransaction = async (payload: Omit<FinanceTransaction, 'id'>) => {
    const { data, error } = await supabase.from('finance_transactions').insert({
      type: payload.type,
      description: payload.description,
      value: payload.value,
      due_date: payload.due_date,
      pay_date: payload.pay_date,
      status: payload.status,
      supplier: payload.supplier,
      contact_id: (payload as any).contact_id || null,
      project_id: payload.project_id || null,
      category_id: payload.category_id || null,
      method: payload.method,
      receipt_url: payload.receipt_url,
    }).select('*').single();
    if (error) throw error;
    setTransactions((prev) => [data as any, ...prev]);
    return data as any as FinanceTransaction;
  };

  const updateTransaction = async (id: string, updates: Partial<FinanceTransaction>) => {
    const { data, error } = await supabase.from('finance_transactions').update({
      ...updates,
    }).eq('id', id).select('*').single();
    if (error) throw error;
    setTransactions((prev) => prev.map((t) => (t.id === id ? (data as any) : t)));
    return data as any as FinanceTransaction;
  };

  const createCategory = async (name: string, type: TxType) => {
    const { data, error } = await supabase.from('finance_categories').insert({ name, type }).select('*').single();
    if (error) throw error;
    setCategories((prev) => [...prev, data as any]);
    return data as any as FinanceCategory;
  };

  const createContact = async (name: string, type: 'cliente' | 'fornecedor', extra?: Partial<FinanceContact>) => {
    const { data, error } = await supabase.from('finance_contacts').insert({ name, type, ...extra }).select('*').single();
    if (error) throw error;
    setContacts((prev) => [...prev, data as any]);
    return data as any as FinanceContact;
  };

  const updateContact = async (id: string, updates: Partial<FinanceContact>) => {
    const { data, error } = await supabase.from('finance_contacts').update(updates).eq('id', id).select('*').single();
    if (error) throw error;
    setContacts((prev) => prev.map(c => c.id === id ? (data as any) : c));
    return data as any as FinanceContact;
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from('finance_contacts').delete().eq('id', id);
    if (error) throw error;
    setContacts((prev) => prev.filter(c => c.id !== id));
  };

  return { loading, error, projects, categories, contacts, transactions, fetchAll, addTransaction, updateTransaction, createCategory, createContact, updateContact, deleteContact };
}
