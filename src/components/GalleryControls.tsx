import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Play, 
  Pause,
  Download,
  Share2
} from 'lucide-react';

interface GalleryControlsProps {
  hasMultipleImages: boolean;
  showCaptions: boolean;
  isPaused?: boolean;
  autoPlay?: boolean;
  currentCaption?: string;
  currentImageUrl: string;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFullscreen: () => void;
  onToggleCaptions: () => void;
  onToggleAutoPlay?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
}

export const GalleryControls: React.FC<GalleryControlsProps> = ({
  hasMultipleImages,
  showCaptions,
  isPaused = false,
  autoPlay = false,
  currentCaption,
  currentImageUrl,
  onPrevious,
  onNext,
  onToggleFullscreen,
  onToggleCaptions,
  onToggleAutoPlay,
  onDownload,
  onShare,
  className = ""
}) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = currentImageUrl;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'Imagem',
          text: currentCaption || 'Confira esta imagem',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast notification here
      } catch (error) {
        console.log('Erro ao copiar URL:', error);
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Navigation Controls - Only for multiple images */}
      {hasMultipleImages && (
        <>
          <button
            onClick={onPrevious}
            className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Imagem anterior"
            title="Imagem anterior (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onNext}
            className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Próxima imagem"
            title="Próxima imagem (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Auto-play Control */}
          {autoPlay && onToggleAutoPlay && (
            <button
              onClick={onToggleAutoPlay}
              className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={isPaused ? "Retomar apresentação" : "Pausar apresentação"}
              title={isPaused ? "Retomar apresentação" : "Pausar apresentação"}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          )}
        </>
      )}

      {/* Caption Toggle */}
      {currentCaption && (
        <button
          onClick={onToggleCaptions}
          className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={showCaptions ? "Ocultar legendas" : "Mostrar legendas"}
          title={showCaptions ? "Ocultar legendas (Espaço)" : "Mostrar legendas (Espaço)"}
        >
          {showCaptions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Baixar imagem"
        title="Baixar imagem"
      >
        <Download className="w-4 h-4" />
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Compartilhar"
        title="Compartilhar"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* Fullscreen Button */}
      <button
        onClick={onToggleFullscreen}
        className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Tela cheia"
        title="Tela cheia"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};
