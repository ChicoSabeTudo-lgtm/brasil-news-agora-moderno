import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AttachmentType = 'pi_document' | 'marketing_material' | 'proof';

export interface InsertionOrderAttachment {
  id: string;
  insertion_order_id: string;
  attachment_type: AttachmentType;
  file_name: string;
  file_url: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export function useInsertionOrderAttachments(orderId?: string) {
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<InsertionOrderAttachment[]>([]);

  const fetchAttachments = useCallback(async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('insertion_order_attachments')
        .select('*')
        .eq('insertion_order_id', orderId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setAttachments((data || []) as InsertionOrderAttachment[]);
    } catch (e: any) {
      console.error('Erro ao carregar anexos:', e);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchAttachments();
    }
  }, [orderId, fetchAttachments]);

  const uploadAttachment = async (
    file: File,
    attachmentType: AttachmentType,
    insertionOrderId: string
  ) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${insertionOrderId}/${attachmentType}/${Date.now()}.${fileExt}`;
    
    // Upload para storage
    const { error: uploadError, data } = await supabase.storage
      .from('insertion-order-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('insertion-order-attachments')
      .getPublicUrl(fileName);

    // Salvar registro no banco
    const { data: attachment, error: dbError } = await supabase
      .from('insertion_order_attachments')
      .insert({
        insertion_order_id: insertionOrderId,
        attachment_type: attachmentType,
        file_name: file.name,
        file_url: publicUrl,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) throw dbError;
    
    setAttachments((prev) => [...prev, attachment as InsertionOrderAttachment]);
    return attachment as InsertionOrderAttachment;
  };

  const deleteAttachment = async (attachmentId: string) => {
    const attachment = attachments.find((a) => a.id === attachmentId);
    if (!attachment) return;

    // Deletar do storage
    const { error: storageError } = await supabase.storage
      .from('insertion-order-attachments')
      .remove([attachment.file_path]);

    if (storageError) throw storageError;

    // Deletar do banco
    const { error: dbError } = await supabase
      .from('insertion_order_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) throw dbError;
    
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const getAttachmentsByType = (type: AttachmentType) => {
    return attachments.filter((a) => a.attachment_type === type);
  };

  return {
    loading,
    attachments,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    getAttachmentsByType,
  };
}
