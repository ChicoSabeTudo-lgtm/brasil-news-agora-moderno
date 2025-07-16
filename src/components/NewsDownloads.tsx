import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface NewsDownloadsProps {
  newsId: string;
}

export const NewsDownloads = ({ newsId }: NewsDownloadsProps) => {
  const [downloads, setDownloads] = useState<NewsDownload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, [newsId]);

  const fetchDownloads = async () => {
    try {
      const { data, error } = await supabase
        .from('news_downloads')
        .select('*')
        .eq('news_id', newsId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setDownloads(data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return null;
  }

  if (downloads.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Arquivos para Download
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {downloads.map((download) => (
            <div
              key={download.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{download.filename}</p>
                  {download.description && (
                    <p className="text-sm text-muted-foreground">{download.description}</p>
                  )}
                  {download.file_size && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(download.file_size)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(download.file_url, download.filename)}
                className="hover:bg-primary hover:text-primary-foreground"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};