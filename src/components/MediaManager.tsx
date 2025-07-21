import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaUpload } from './MediaUpload';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';
import { useNewsMedia } from '@/hooks/useNewsMedia';
import { Trash2, Play, Music, Video, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  url: string;
  fileName: string;
  fileType: 'video' | 'audio';
  mimeType: string;
  fileSize: number;
  duration?: number;
}

interface MediaManagerProps {
  newsId?: string;
  onMediaSelect?: (media: MediaFile) => void;
  className?: string;
}

export const MediaManager = ({ newsId, onMediaSelect, className }: MediaManagerProps) => {
  const { mediaFiles: dbMediaFiles, loading, refetch, deleteMediaFile } = useNewsMedia(newsId);
  const [localMediaFiles, setLocalMediaFiles] = useState<MediaFile[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);

  // Convert database media to MediaFile format
  useEffect(() => {
    const converted = dbMediaFiles.map(media => ({
      id: media.id,
      url: media.file_url,
      fileName: media.file_name,
      fileType: media.file_type,
      mimeType: media.mime_type,
      fileSize: media.file_size,
      duration: media.duration
    }));
    setLocalMediaFiles(converted);
  }, [dbMediaFiles]);

  const handleUploadComplete = (file: MediaFile) => {
    setLocalMediaFiles(prev => [...prev, file]);
    setSelectedMedia(file);
    refetch(); // Refresh from database
  };

  const handleMediaSelect = (media: MediaFile) => {
    setSelectedMedia(media);
    onMediaSelect?.(media);
  };

  const handleMediaRemove = async (mediaId: string) => {
    await deleteMediaFile(mediaId);
    if (selectedMedia?.id === mediaId) {
      setSelectedMedia(null);
    }
  };

  const mediaFiles = localMediaFiles;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const videoFiles = mediaFiles.filter(m => m.fileType === 'video');
  const audioFiles = mediaFiles.filter(m => m.fileType === 'audio');

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Upload de Mídia</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUpload 
            onUploadComplete={handleUploadComplete}
            newsId={newsId}
          />
        </CardContent>
      </Card>

      {/* Media Library */}
      {mediaFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Biblioteca de Mídia</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="videos" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="videos" className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Vídeos ({videoFiles.length})</span>
                </TabsTrigger>
                <TabsTrigger value="audios" className="flex items-center space-x-2">
                  <Music className="h-4 w-4" />
                  <span>Áudios ({audioFiles.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="space-y-3">
                {videoFiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum vídeo foi enviado ainda
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {videoFiles.map((media) => (
                      <div
                        key={media.id}
                        className={cn(
                          "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
                          selectedMedia?.id === media.id 
                            ? "border-primary bg-primary/5" 
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => handleMediaSelect(media)}
                      >
                        <div className="p-2 bg-primary/10 rounded">
                          <Video className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{media.fileName}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Badge variant="secondary">{media.mimeType}</Badge>
                            <span>{formatFileSize(media.fileSize)}</span>
                            {media.duration && <span>{formatDuration(media.duration)}</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMediaRemove(media.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="audios" className="space-y-3">
                {audioFiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum áudio foi enviado ainda
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {audioFiles.map((media) => (
                      <div
                        key={media.id}
                        className={cn(
                          "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
                          selectedMedia?.id === media.id 
                            ? "border-primary bg-primary/5" 
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => handleMediaSelect(media)}
                      >
                        <div className="p-2 bg-primary/10 rounded">
                          <Music className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{media.fileName}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Badge variant="secondary">{media.mimeType}</Badge>
                            <span>{formatFileSize(media.fileSize)}</span>
                            {media.duration && <span>{formatDuration(media.duration)}</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMediaRemove(media.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Media Preview */}
      {selectedMedia && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {selectedMedia.fileType === 'video' ? (
                <Video className="h-5 w-5" />
              ) : (
                <Music className="h-5 w-5" />
              )}
              <span>Pré-visualização</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMedia.fileType === 'video' ? (
              <VideoPlayer 
                src={selectedMedia.url}
                className="w-full max-h-96"
              />
            ) : (
              <AudioPlayer 
                src={selectedMedia.url}
                title={selectedMedia.fileName}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};