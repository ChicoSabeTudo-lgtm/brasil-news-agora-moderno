import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Video, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MediaUploadProps {
  onUploadComplete: (file: {
    id: string;
    url: string;
    fileName: string;
    fileType: 'video' | 'audio';
    mimeType: string;
    fileSize: number;
    duration?: number;
  }) => void;
  newsId?: string;
  accept?: string;
  className?: string;
}

export const MediaUpload = ({ 
  onUploadComplete, 
  newsId, 
  accept = "video/*,audio/*",
  className 
}: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileType = (mimeType: string): 'video' | 'audio' => {
    return mimeType.startsWith('video/') ? 'video' : 'audio';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMediaDuration = (file: File): Promise<number | undefined> => {
    return new Promise((resolve) => {
      const isVideo = file.type.startsWith('video/');
      const element = isVideo ? document.createElement('video') : document.createElement('audio');
      
      element.preload = 'metadata';
      element.onloadedmetadata = () => {
        URL.revokeObjectURL(element.src);
        resolve(Math.round(element.duration));
      };
      element.onerror = () => resolve(undefined);
      element.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // Verificar se é vídeo ou áudio
      const fileType = getFileType(file.type);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      // Obter duração da mídia
      const duration = await getMediaDuration(file);

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('news-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('news-media')
        .getPublicUrl(uploadData.path);

      // Salvar metadados no banco de dados (se newsId estiver disponível)
      let mediaRecord = null;
      if (newsId) {
        const { data, error: dbError } = await supabase
          .from('news_media')
          .insert({
            news_id: newsId,
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_type: fileType,
            mime_type: file.type,
            file_size: file.size,
            duration
          })
          .select()
          .single();

        if (dbError) throw dbError;
        mediaRecord = data;
      }

      const result = {
        id: mediaRecord?.id || Date.now().toString(),
        url: urlData.publicUrl,
        fileName: file.name,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
        duration
      };

      onUploadComplete(result);

      toast({
        title: "Upload concluído",
        description: `${fileType === 'video' ? 'Vídeo' : 'Áudio'} enviado com sucesso!`,
      });

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao enviar o arquivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Verificar se é um arquivo de mídia válido
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo de vídeo ou áudio",
        variant: "destructive",
      });
      return;
    }

    // Verificar tamanho (limite de 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 100MB",
        variant: "destructive",
      });
      return;
    }

    uploadFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          uploading && "pointer-events-none opacity-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          {uploading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Enviando...</span>
            </div>
          ) : (
            <>
              <div className="flex space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Music className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">
                  Arraste e solte seus arquivos de mídia aqui
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ou clique para selecionar vídeos e áudios (máx. 100MB)
                </p>
              </div>
              <Button variant="outline" size="sm" type="button">
                <Upload className="h-4 w-4 mr-2" />
                Selecionar arquivo
              </Button>
            </>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Enviando arquivo...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}
    </div>
  );
};