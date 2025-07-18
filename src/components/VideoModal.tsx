import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    video_url: string;
    description?: string;
    duration: string;
    views: number;
    categories?: {
      name: string;
    };
  } | null;
}

export const VideoModal = ({ isOpen, onClose, video }: VideoModalProps) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVideoLoaded(false);
    }
  }, [isOpen]);

  if (!video) return null;

  // Function to extract video ID from different platforms
  const getEmbedUrl = (videoUrl: string) => {
    // YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.includes('youtube.com') 
        ? videoUrl.split('v=')[1]?.split('&')[0]
        : videoUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    
    // Vimeo
    if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    
    // Direct video file
    return videoUrl;
  };

  const embedUrl = getEmbedUrl(video.video_url);
  const isDirectVideo = !embedUrl.includes('youtube.com') && !embedUrl.includes('vimeo.com');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold line-clamp-2">
            {video.title}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            {video.categories && (
              <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                {video.categories.name}
              </span>
            )}
            <span>{video.views.toLocaleString()} visualizações</span>
            <span>{video.duration}</span>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <div className="aspect-video">
              {!isVideoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              
              {isDirectVideo ? (
                <video
                  src={embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onLoadedData={() => setIsVideoLoaded(true)}
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              ) : (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  onLoad={() => setIsVideoLoaded(true)}
                />
              )}
            </div>
          </div>
          
          {video.description && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};