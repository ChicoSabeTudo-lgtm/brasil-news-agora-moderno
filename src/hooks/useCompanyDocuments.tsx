import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  document_type: string;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanyDocuments = () => {
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['company-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CompanyDocument[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ 
      file, 
      documentType, 
      description 
    }: { 
      file: File; 
      documentType: string; 
      description?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('company_documents')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: user.id,
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-documents'] });
      toast.success('Documento enviado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao enviar documento');
      console.error('Error uploading document:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (document: CompanyDocument) => {
      const { error: storageError } = await supabase.storage
        .from('company-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-documents'] });
      toast.success('Documento excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir documento');
      console.error('Error deleting document:', error);
    },
  });

  const downloadDocument = async (document: CompanyDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('company-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Download iniciado!');
    } catch (error) {
      toast.error('Erro ao baixar documento');
      console.error('Error downloading document:', error);
    }
  };

  return {
    documents,
    isLoading,
    uploadDocument: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    deleteDocument: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    downloadDocument,
  };
};
