import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyCertification {
  id: string;
  certification_type: 'municipal' | 'fgts' | 'estadual' | 'trabalhista' | 'federal';
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expiring_soon' | 'expired';
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  notes: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanyCertifications = () => {
  const queryClient = useQueryClient();

  const { data: certifications, isLoading } = useQuery({
    queryKey: ['company-certifications'],
    queryFn: async () => {
      // Update statuses first
      await supabase.rpc('update_certification_status');
      
      const { data, error } = await supabase
        .from('company_certifications')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (error) throw error;
      return data as CompanyCertification[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ 
      file, 
      certificationType,
      issueDate,
      expiryDate,
      notes 
    }: { 
      file: File;
      certificationType: CompanyCertification['certification_type'];
      issueDate: string;
      expiryDate: string;
      notes?: string;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${certificationType}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('company_certifications')
        .insert({
          certification_type: certificationType,
          issue_date: issueDate,
          expiry_date: expiryDate,
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          notes: notes || null,
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-certifications'] });
      toast.success('Certidão enviada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao enviar certidão');
      console.error('Error uploading certification:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ 
      id,
      certificationType,
      issueDate,
      expiryDate,
      notes 
    }: { 
      id: string;
      certificationType: CompanyCertification['certification_type'];
      issueDate: string;
      expiryDate: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('company_certifications')
        .update({
          certification_type: certificationType,
          issue_date: issueDate,
          expiry_date: expiryDate,
          notes: notes || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-certifications'] });
      toast.success('Certidão atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar certidão');
      console.error('Error updating certification:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (certification: CompanyCertification) => {
      const { error: storageError } = await supabase.storage
        .from('company-documents')
        .remove([certification.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('company_certifications')
        .delete()
        .eq('id', certification.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-certifications'] });
      toast.success('Certidão excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir certidão');
      console.error('Error deleting certification:', error);
    },
  });

  const downloadCertification = async (certification: CompanyCertification) => {
    try {
      const { data, error } = await supabase.storage
        .from('company-documents')
        .download(certification.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = certification.file_name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certification:', error);
      toast.error('Erro ao baixar certidão');
    }
  };

  const viewCertification = async (certification: CompanyCertification) => {
    try {
      const { data, error } = await supabase.storage
        .from('company-documents')
        .createSignedUrl(certification.file_path, 60); // URL válida por 60 segundos
      
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing certification:', error);
      toast.error('Erro ao visualizar certidão');
    }
  };

  return {
    certifications,
    isLoading,
    uploadCertification: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    updateCertification: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteCertification: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    downloadCertification,
    viewCertification,
  };
};
