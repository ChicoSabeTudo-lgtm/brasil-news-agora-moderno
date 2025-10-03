import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_series: string | null;
  invoice_type: 'servicos' | 'produtos' | 'mista';
  client_id: string | null;
  client_name: string;
  client_document: string;
  issue_date: string;
  due_date: string | null;
  total_value: number;
  tax_value: number;
  net_value: number;
  status: 'pending' | 'paid' | 'cancelled' | 'overdue';
  payment_method: string | null;
  payment_date: string | null;
  description: string | null;
  notes: string | null;
  invoice_pdf_path: string | null;
  invoice_pdf_url: string | null;
  invoice_xml_path: string | null;
  invoice_xml_url: string | null;
  payment_proof_path: string | null;
  payment_proof_url: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useInvoices = () => {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      // Update statuses first
      await supabase.rpc('update_invoice_status');
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('issue_date', { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (invoice: Partial<Invoice> & { 
      pdfFile?: File; 
      xmlFile?: File;
      proofFile?: File;
    }) => {
      const { pdfFile, xmlFile, proofFile, ...invoiceData } = invoice;
      
      let pdfPath = null, pdfUrl = null;
      let xmlPath = null, xmlUrl = null;
      let proofPath = null, proofUrl = null;

      // Upload PDF if provided
      if (pdfFile) {
        const fileName = `invoice-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('company-documents')
          .upload(fileName, pdfFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-documents')
          .getPublicUrl(fileName);

        pdfPath = fileName;
        pdfUrl = publicUrl;
      }

      // Upload XML if provided
      if (xmlFile) {
        const fileName = `invoice-${Date.now()}.xml`;
        const { error: uploadError } = await supabase.storage
          .from('company-documents')
          .upload(fileName, xmlFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-documents')
          .getPublicUrl(fileName);

        xmlPath = fileName;
        xmlUrl = publicUrl;
      }

      // Upload payment proof if provided
      if (proofFile) {
        const fileName = `payment-proof-${Date.now()}.pdf`;
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

      const { error } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceData.invoice_number,
          invoice_series: invoiceData.invoice_series,
          invoice_type: invoiceData.invoice_type,
          client_id: invoiceData.client_id,
          client_name: invoiceData.client_name,
          client_document: invoiceData.client_document,
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date,
          total_value: invoiceData.total_value,
          tax_value: invoiceData.tax_value,
          status: invoiceData.status,
          payment_method: invoiceData.payment_method,
          payment_date: invoiceData.payment_date,
          description: invoiceData.description,
          notes: invoiceData.notes,
          invoice_pdf_path: pdfPath,
          invoice_pdf_url: pdfUrl,
          invoice_xml_path: xmlPath,
          invoice_xml_url: xmlUrl,
          payment_proof_path: proofPath,
          payment_proof_url: proofUrl,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Nota fiscal criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar nota fiscal');
      console.error('Error creating invoice:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { 
      id: string;
      pdfFile?: File;
      xmlFile?: File;
      proofFile?: File;
    }) => {
      const { pdfFile, xmlFile, proofFile, ...invoiceData } = updates as any;
      
      let updateData = { ...invoiceData };

      // Upload new PDF if provided
      if (pdfFile) {
        const fileName = `invoice-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('company-documents')
          .upload(fileName, pdfFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-documents')
          .getPublicUrl(fileName);

        updateData.invoice_pdf_path = fileName;
        updateData.invoice_pdf_url = publicUrl;
      }

      // Upload new XML if provided
      if (xmlFile) {
        const fileName = `invoice-${Date.now()}.xml`;
        const { error: uploadError } = await supabase.storage
          .from('company-documents')
          .upload(fileName, xmlFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-documents')
          .getPublicUrl(fileName);

        updateData.invoice_xml_path = fileName;
        updateData.invoice_xml_url = publicUrl;
      }

      // Upload new payment proof if provided
      if (proofFile) {
        const fileName = `payment-proof-${Date.now()}.pdf`;
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
        .from('invoices')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Nota fiscal atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar nota fiscal');
      console.error('Error updating invoice:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (invoice: Invoice) => {
      // Delete files from storage
      const filesToDelete = [
        invoice.invoice_pdf_path,
        invoice.invoice_xml_path,
        invoice.payment_proof_path,
      ].filter(Boolean) as string[];

      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('company-documents')
          .remove(filesToDelete);
      }

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Nota fiscal excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir nota fiscal');
      console.error('Error deleting invoice:', error);
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
    invoices,
    isLoading,
    createInvoice: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateInvoice: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteInvoice: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    downloadFile,
    viewFile,
  };
};
