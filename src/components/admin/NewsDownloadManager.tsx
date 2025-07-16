import { useState, useEffect } from 'react';
import { Plus, Download, Trash2, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface NewsDownload {
  id: string;
  filename: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  description: string | null;
  sort_order: number;
}

interface NewsDownloadManagerProps {
  newsId: string | null;
  onDownloadsChange?: (downloads: NewsDownload[]) => void;
}

export const NewsDownloadManager = ({ newsId, onDownloadsChange }: NewsDownloadManagerProps) => {
  const [downloads, setDownloads] = useState<NewsDownload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDownload, setNewDownload] = useState({
    file: null as File | null,
    description: ''
  });

  useEffect(() => {
    if (newsId) {
      fetchDownloads();
    }
  }, [newsId]);

  const fetchDownloads = async () => {
    if (!newsId) return;

    try {
      const { data, error } = await supabase
        .from('news_downloads')
        .select('*')
        .eq('news_id', newsId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setDownloads(data || []);
      onDownloadsChange?.(data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast.error('Erro ao carregar downloads');
    }
  };

  const handleFileUpload = async () => {
    if (!newDownload.file || !newsId) return;

    setIsUploading(true);
    
    try {
      const fileExt = newDownload.file.name.split('.').pop();
      const fileName = `${newsId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('news-downloads')
        .upload(fileName, newDownload.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('news-downloads')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('news_downloads')
        .insert({
          news_id: newsId,
          filename: newDownload.file.name,
          file_url: publicUrl,
          file_size: newDownload.file.size,
          file_type: newDownload.file.type,
          description: newDownload.description || null,
          sort_order: downloads.length
        });

      if (insertError) throw insertError;

      toast.success('Arquivo adicionado com sucesso');
      setShowAddDialog(false);
      setNewDownload({ file: null, description: '' });
      fetchDownloads();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao fazer upload do arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDownload = async (downloadId: string, fileUrl: string) => {
    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('news_downloads')
        .delete()
        .eq('id', downloadId);

      if (deleteError) throw deleteError;

      // Delete from storage
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('news-downloads')
          .remove([`${newsId}/${fileName}`]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      }

      toast.success('Download removido com sucesso');
      fetchDownloads();
    } catch (error) {
      console.error('Error deleting download:', error);
      toast.error('Erro ao remover download');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Tamanho desconhecido';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!newsId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Arquivos para Download
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Salve a notícia primeiro para adicionar arquivos de download.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Arquivos para Download
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {downloads.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhum arquivo de download adicionado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {downloads.map((download) => (
                <div key={download.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{download.filename}</p>
                      {download.description && (
                        <p className="text-sm text-muted-foreground">{download.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(download.file_size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(download.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDownload(download.id, download.file_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Arquivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Arquivo para Download</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Arquivo</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setNewDownload({
                      ...newDownload,
                      file: e.target.files?.[0] || null
                    })}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    placeholder="Descreva o conteúdo do arquivo..."
                    value={newDownload.description}
                    onChange={(e) => setNewDownload({
                      ...newDownload,
                      description: e.target.value
                    })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleFileUpload}
                    disabled={!newDownload.file || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};