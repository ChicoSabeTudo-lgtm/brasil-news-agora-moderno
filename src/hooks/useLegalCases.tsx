import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface LegalCase {
  id: string;
  case_number: string;
  case_type: string;
  status: string;
  lawyer_name: string;
  start_date: string;
  hearing_date: string | null;
  plaintiff: string;
  defendant: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
}

export interface LegalCaseDocument {
  id: string;
  legal_case_id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export const useLegalCases = () => {
  const queryClient = useQueryClient();
  const supabaseClient = supabase;

  // Fetch legal cases
  const { data: legalCases, isLoading } = useQuery({
    queryKey: ['legal-cases'],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('legal_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LegalCase[];
    },
  });

  // Create legal case
  const createMutation = useMutation({
    mutationFn: async (caseData: {
      case_number: string;
      case_type: string;
      status: string;
      lawyer_name: string;
      start_date: string;
      hearing_date: string | null;
      plaintiff: string;
      defendant: string;
      description: string | null;
      documents?: File[];
    }) => {
      const { documents, ...legalCaseData } = caseData;
      
      // Insert legal case
      const { data: newCase, error: caseError } = await supabaseClient
        .from('legal_cases')
        .insert([legalCaseData])
        .select()
        .single();

      if (caseError) throw caseError;

      // Upload documents if any
      if (documents && documents.length > 0) {
        for (const file of documents) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${newCase.id}/${Date.now()}.${fileExt}`;
          const filePath = `legal-cases/${fileName}`;

          const { error: uploadError } = await supabaseClient.storage
            .from('company-documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabaseClient.storage
            .from('company-documents')
            .getPublicUrl(filePath);

          const { error: docError } = await supabaseClient
            .from('legal_case_documents')
            .insert([{
              legal_case_id: newCase.id,
              file_name: file.name,
              file_path: filePath,
              file_url: publicUrl,
              file_size: file.size,
              mime_type: file.type,
            }]);

          if (docError) throw docError;
        }
      }

      return newCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-cases'] });
      toast({
        title: 'Sucesso',
        description: 'Processo judicial criado com sucesso',
      });
    },
    onError: (error) => {
      console.error('Error creating legal case:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar processo judicial',
        variant: 'destructive',
      });
    },
  });

  // Update legal case
  const updateMutation = useMutation({
    mutationFn: async (caseData: {
      id: string;
      case_number: string;
      case_type: string;
      status: string;
      lawyer_name: string;
      start_date: string;
      hearing_date: string | null;
      plaintiff: string;
      defendant: string;
      description: string | null;
      documents?: File[];
    }) => {
      const { id, documents, ...updateData } = caseData;

      const { data, error } = await supabaseClient
        .from('legal_cases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Upload new documents if any
      if (documents && documents.length > 0) {
        for (const file of documents) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${id}/${Date.now()}.${fileExt}`;
          const filePath = `legal-cases/${fileName}`;

          const { error: uploadError } = await supabaseClient.storage
            .from('company-documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabaseClient.storage
            .from('company-documents')
            .getPublicUrl(filePath);

          const { error: docError } = await supabaseClient
            .from('legal_case_documents')
            .insert([{
              legal_case_id: id,
              file_name: file.name,
              file_path: filePath,
              file_url: publicUrl,
              file_size: file.size,
              mime_type: file.type,
            }]);

          if (docError) throw docError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-cases'] });
      toast({
        title: 'Sucesso',
        description: 'Processo judicial atualizado com sucesso',
      });
    },
    onError: (error) => {
      console.error('Error updating legal case:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar processo judicial',
        variant: 'destructive',
      });
    },
  });

  // Delete legal case
  const deleteMutation = useMutation({
    mutationFn: async (legalCase: LegalCase) => {
      // Delete associated documents from storage
      const { data: documents } = await supabaseClient
        .from('legal_case_documents')
        .select('file_path')
        .eq('legal_case_id', legalCase.id);

      if (documents) {
        for (const doc of documents) {
          await supabaseClient.storage
            .from('company-documents')
            .remove([doc.file_path]);
        }
      }

      const { error } = await supabaseClient
        .from('legal_cases')
        .delete()
        .eq('id', legalCase.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-cases'] });
      toast({
        title: 'Sucesso',
        description: 'Processo judicial excluído com sucesso',
      });
    },
    onError: (error) => {
      console.error('Error deleting legal case:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir processo judicial',
        variant: 'destructive',
      });
    },
  });

  // Get documents for a case
  const { data: documents } = useQuery({
    queryKey: ['legal-case-documents'],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('legal_case_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LegalCaseDocument[];
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (document: LegalCaseDocument) => {
      const { error: storageError } = await supabaseClient.storage
        .from('company-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabaseClient
        .from('legal_case_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-case-documents'] });
      toast({
        title: 'Documento removido',
        description: 'O documento foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting legal case document:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o documento.',
        variant: 'destructive',
      });
    }
  });

  // Download file
  const downloadFile = async (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    legalCases,
    documents,
    isLoading,
    createCase: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateCase: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteCase: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    downloadFile,
    deleteDocument: deleteDocumentMutation.mutate,
    isDeletingDocument: deleteDocumentMutation.isPending,
  };
};
