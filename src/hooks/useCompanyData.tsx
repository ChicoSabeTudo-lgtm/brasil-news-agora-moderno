import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyData {
  id: string;
  legal_name: string;
  trade_name: string;
  cnpj: string;
  state_registration: string | null;
  municipal_registration: string | null;
  social_network: string | null;
  address: string;
  phone: string;
  email: string;
  bank_code: string;
  bank_agency: string;
  bank_account: string;
  pix_key: string;
  created_at: string;
  updated_at: string;
}

export const useCompanyData = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['company-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_data')
        .select('*')
        .single();

      if (error) throw error;
      return data as CompanyData;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<CompanyData>) => {
      if (!data?.id) throw new Error('No company data found');

      const { error } = await supabase
        .from('company_data')
        .update(updatedData)
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-data'] });
      toast.success('Dados da empresa atualizados com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar dados da empresa');
      console.error('Error updating company data:', error);
    },
  });

  return {
    companyData: data,
    isLoading,
    updateCompanyData: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};
