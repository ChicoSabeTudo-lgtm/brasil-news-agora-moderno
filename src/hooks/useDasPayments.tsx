import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { dateInputToISO } from '@/utils/dateUtils';

export interface DasPayment {
  id: string;
  reference_month: string;
  due_date: string;
  value: number;
  payment_date: string | null;
  observations: string | null;
  das_boleto_path: string | null;
  das_boleto_url: string | null;
  payment_proof_path: string | null;
  payment_proof_url: string | null;
  status: 'pending' | 'paid' | 'overdue';
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useDasPayments = () => {
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['das_payments'],
    queryFn: async () => {
      // Update statuses first
      await supabase.rpc('update_das_status');
      
      const { data, error } = await supabase
        .from('das_payments')
        .select('*')
        .order('reference_month', { ascending: false });

      if (error) throw error;
      return data as DasPayment[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payment: Partial<DasPayment> & { 
      boletoFile?: File; 
      proofFile?: File;
    }) => {
      const { boletoFile, proofFile, ...paymentData } = payment;
      
      let boletoPath = null, boletoUrl = null;
      let proofPath = null, proofUrl = null;

      // Upload DAS boleto if provided
      if (boletoFile) {
        const fileName = `das-boleto-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('company-documents')
          .upload(fileName, boletoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-documents')
          .getPublicUrl(fileName);

        boletoPath = fileName;
        boletoUrl = publicUrl;
      }

      // Upload payment proof if provided
      if (proofFile) {
        const fileName = `das-proof-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('company-documents')
          .upload(fileName, proofFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-documents')
          .getPublicUrl(fileName);

        proofPath = fileName;
        proofUrl = publicUrl;
      }

      // Converter reference_month de "YYYY-MM" para "YYYY-MM-15" (meio do mês para evitar problemas de timezone)
      const referenceMonthDate = paymentData.reference_month 
        ? `${paymentData.reference_month}-15T12:00:00.000Z`
        : null;

      const { error } = await supabase
        .from('das_payments')
        .insert([{
          reference_month: referenceMonthDate,
          due_date: paymentData.due_date ? dateInputToISO(paymentData.due_date) : null,
          value: paymentData.value,
          payment_date: paymentData.payment_date ? dateInputToISO(paymentData.payment_date) : null,
          observations: paymentData.observations || null,
          das_boleto_path: boletoPath,
          das_boleto_url: boletoUrl,
          payment_proof_path: proofPath,
          payment_proof_url: proofUrl,
          status: paymentData.status || 'pending',
        }]);

      if (error) {
        console.error('Erro detalhado ao criar DAS:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['das_payments'] });
      toast.success('Pagamento DAS registrado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar pagamento DAS');
      console.error('Error creating DAS payment:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DasPayment> & { 
      id: string;
      boletoFile?: File;
      proofFile?: File;
    }) => {
      const { boletoFile, proofFile, ...paymentData } = updates as any;
      
      let updateData = { ...paymentData };

      // Converter reference_month de "YYYY-MM" para "YYYY-MM-15" se fornecido
      if (updateData.reference_month && !updateData.reference_month.includes('T')) {
        updateData.reference_month = `${updateData.reference_month}-15T12:00:00.000Z`;
      }

      // Converter datas para ISO format seguro
      if (updateData.due_date && !updateData.due_date.includes('T')) {
        updateData.due_date = dateInputToISO(updateData.due_date);
      }
      if (updateData.payment_date && !updateData.payment_date.includes('T')) {
        updateData.payment_date = dateInputToISO(updateData.payment_date);
      }

      // Upload new boleto if provided
      if (boletoFile) {
        const fileName = `das-boleto-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('company-documents')
          .upload(fileName, boletoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-documents')
          .getPublicUrl(fileName);

        updateData.das_boleto_path = fileName;
        updateData.das_boleto_url = publicUrl;
      }

      // Upload new payment proof if provided
      if (proofFile) {
        const fileName = `das-proof-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('company-documents')
          .upload(fileName, proofFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-documents')
          .getPublicUrl(fileName);

        updateData.payment_proof_path = fileName;
        updateData.payment_proof_url = publicUrl;
      }

      const { error } = await supabase
        .from('das_payments')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Erro detalhado ao atualizar DAS:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['das_payments'] });
      toast.success('Pagamento DAS atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar pagamento DAS');
      console.error('Error updating DAS payment:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (payment: DasPayment) => {
      // Delete files from storage
      const filesToDelete = [
        payment.das_boleto_path,
        payment.payment_proof_path,
      ].filter(Boolean) as string[];

      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('company-documents')
          .remove(filesToDelete);
      }

      const { error } = await supabase
        .from('das_payments')
        .delete()
        .eq('id', payment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['das_payments'] });
      toast.success('Pagamento DAS excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir pagamento DAS');
      console.error('Error deleting DAS payment:', error);
    },
  });

  const downloadFile = async (path: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('company-documents')
        .download(path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Erro ao baixar arquivo');
    }
  };

  const viewFile = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('company-documents')
        .createSignedUrl(path, 60);
      
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      toast.error('Erro ao visualizar arquivo');
    }
  };

  return {
    payments,
    isLoading,
    createPayment: createMutation.mutate,
    isCreating: createMutation.isPending,
    updatePayment: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deletePayment: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    downloadFile,
    viewFile,
  };
};
