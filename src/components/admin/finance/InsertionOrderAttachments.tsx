import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Trash2 } from 'lucide-react';
import { useInsertionOrderAttachments, AttachmentType } from '@/hooks/useInsertionOrderAttachments';
import { toast } from 'sonner';

interface Props {
  orderId?: string;
}

export function InsertionOrderAttachments({ orderId }: Props) {
  const { attachments, uploadAttachment, deleteAttachment, getAttachmentsByType } = 
    useInsertionOrderAttachments(orderId);
  
  const piDocRef = useRef<HTMLInputElement>(null);
  const marketingRef = useRef<HTMLInputElement>(null);
  const proofRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File | null, type: AttachmentType) => {
    if (!file || !orderId) return;
    
    try {
      await uploadAttachment(file, type, orderId);
      toast.success('Arquivo enviado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar arquivo');
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Deseja realmente excluir este arquivo?')) return;
    
    try {
      await deleteAttachment(attachmentId);
      toast.success('Arquivo excluído com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir arquivo');
    }
  };

  const renderAttachmentSection = (
    title: string,
    type: AttachmentType,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    const items = getAttachmentsByType(type);
    
    return (
      <div className="space-y-2">
        <Label>{title}</Label>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={!orderId}
            className="w-full justify-start"
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar arquivo
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0] || null, type)}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          
          {items.length > 0 && (
            <div className="space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate flex-1"
                  >
                    {item.file_name}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!orderId) {
    return (
      <div className="p-4 bg-muted rounded text-sm text-muted-foreground">
        Salve o PI primeiro para adicionar anexos
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Anexos</h3>
      
      {renderAttachmentSection('Documento PI', 'pi_document', piDocRef)}
      {renderAttachmentSection('Material de Divulgação', 'marketing_material', marketingRef)}
      {renderAttachmentSection('Comprovantes', 'proof', proofRef)}
    </div>
  );
}
