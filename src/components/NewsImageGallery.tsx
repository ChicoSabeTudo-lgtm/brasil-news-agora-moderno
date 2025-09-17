import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2, Eye, EyeOff } from "lucide-react";
import { ImageWithFallback } from './ImageWithFallback';
import { getImageUrl } from '@/utils/imageUtils';

interface NewsImage {
  image_url: string;
  public_url?: string;
  path?: string;
  caption?: string;
  is_cover: boolean;
  sort_order: number;
}

interface NewsImageGalleryProps {
  images: NewsImage[];
  newsTitle: string;
}

export const NewsImageGallery = ({ images, newsTitle }: NewsImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  // Navigation functions
  const nextImage = useCallback(() => {
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setIsLoading(true);
    }
  }, [hasMultipleImages, images.length]);

  const prevImage = useCallback(() => {
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsLoading(true);
    }
  }, [hasMultipleImages, images.length]);

  const goToImage = useCallback((index: number) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
      setIsLoading(true);
    }
  }, [currentIndex]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const toggleCaptions = useCallback(() => {
    setShowCaptions(!showCaptions);
  }, [showCaptions]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with form inputs
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prevImage();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextImage();
          break;
        case "Escape":
          if (isFullscreen) {
            e.preventDefault();
            setIsFullscreen(false);
          }
          break;
        case " ":
          e.preventDefault();
          toggleCaptions();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [prevImage, nextImage, isFullscreen, toggleCaptions]);

  // Touch/Swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  // Image loading handler
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Preload adjacent images for better performance
  useEffect(() => {
    if (hasMultipleImages) {
      const preloadImage = (index: number) => {
        if (index >= 0 && index < images.length) {
          const img = new Image();
          img.src = getImageUrl(images[index]);
        }
      };

      // Preload next and previous images
      preloadImage((currentIndex + 1) % images.length);
      preloadImage((currentIndex - 1 + images.length) % images.length);
    }
  }, [currentIndex, hasMultipleImages, images]);

  // Focus management for accessibility
  useEffect(() => {
    if (galleryRef.current && !isFullscreen) {
      galleryRef.current.focus();
    }
  }, [currentIndex, isFullscreen]);

  return (
    <div className="mb-6">
      {/* Main Gallery Container */}
      <div 
        ref={galleryRef}
        className="relative rounded-xl overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        tabIndex={0}
        role="img"
        aria-label={`Galeria de imagens: ${newsTitle}. Imagem ${currentIndex + 1} de ${images.length}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Main Image Display Area - Fixed 4:3 Aspect Ratio */}
        <div className="relative aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Main Image with Letterboxing */}
          <img
            ref={mainImageRef}
            src={getImageUrl(currentImage)}
            alt={currentImage.caption || `${newsTitle} - Imagem ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-opacity duration-300"
            style={{ opacity: isLoading ? 0 : 1 }}
            onLoad={handleImageLoad}
            onError={() => setIsLoading(false)}
            loading="lazy"
          />

          {/* Navigation Arrows - Only for multiple images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 hover:bg-background/90 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Imagem anterior"
                tabIndex={0}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 hover:bg-background/90 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Próxima imagem"
                tabIndex={0}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter - Only for multiple images */}
          {hasMultipleImages && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Control Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {/* Caption Toggle */}
            {currentImage.caption && (
              <button
                onClick={toggleCaptions}
                className="p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 hover:bg-background/90 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={showCaptions ? "Ocultar legendas" : "Mostrar legendas"}
                tabIndex={0}
              >
                {showCaptions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 hover:bg-background/90 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Tela cheia"
              tabIndex={0}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Hover overlay for better UX */}
          <div className="absolute inset-0 group" />
        </div>

        {/* Thumbnails - Only for multiple images */}
        {hasMultipleImages && (
          <div className="p-4 bg-background/30 backdrop-blur-sm">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    index === currentIndex 
                      ? 'border-primary ring-2 ring-primary/20 scale-105' 
                      : 'border-muted hover:border-muted-foreground/50 hover:scale-105'
                  }`}
                  aria-label={`Ver imagem ${index + 1}`}
                  tabIndex={0}
                >
                  <img 
                    src={getImageUrl(image)} 
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Caption - Only show if enabled and caption exists */}
      {showCaptions && currentImage.caption && (
        <div className="mt-3 px-1">
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            {currentImage.caption}
          </p>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização em tela cheia"
        >
          {/* Close Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Fechar tela cheia"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Fullscreen Image Container */}
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img 
              src={getImageUrl(currentImage)} 
              alt={currentImage.caption || `${newsTitle} - Imagem ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation in Fullscreen - Only for multiple images */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-muted rounded-full hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-muted rounded-full hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
                
                {/* Counter in Fullscreen */}
                {/* Counter in Fullscreen */}
<div className="absolute top-4 left-4 px-4 py-2 bg-red-600 text-white rounded-full text-lg font-medium">
  {currentIndex + 1} de {images.length}
</div>
          {/* Caption in Fullscreen */}
          {showCaptions && currentImage.caption && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-foreground/90 bg-background/80 backdrop-blur-sm rounded-lg p-4 inline-block max-w-2xl">
                {currentImage.caption}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Screen Reader Instructions */}
      <div className="sr-only">
        <p>
          Use as setas do teclado para navegar entre as imagens. 
          Pressione Espaço para alternar legendas. 
          Pressione Escape para sair da tela cheia.
        </p>
      </div>
    </div>
  );
};

// CSS adicional para esconder scrollbar nos thumbnails
const additionalCSS = `
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
`;

// Inject CSS if not already present
if (typeof document !== 'undefined' && !document.getElementById('gallery-styles')) {
  const style = document.createElement('style');
  style.id = 'gallery-styles';
  style.textContent = additionalCSS;
  document.head.appendChild(style);
}
