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
    <div className="mb-8">
      {/* Modern Gallery Container */}
      <div 
        ref={galleryRef}
        className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
        tabIndex={0}
        role="img"
        aria-label={`Galeria de imagens: ${newsTitle}. Imagem ${currentIndex + 1} de ${images.length}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Main Image Display Area - Enhanced Height */}
        <div className="relative h-[500px] lg:h-[600px] bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
              <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Main Image with Better Scaling */}
          <img
            ref={mainImageRef}
            src={getImageUrl(currentImage)}
            alt={currentImage.caption || `${newsTitle} - Imagem ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-all duration-500 ease-out"
            style={{ opacity: isLoading ? 0 : 1 }}
            onLoad={handleImageLoad}
            onError={() => setIsLoading(false)}
            loading="lazy"
          />

          {/* Navigation Arrows - Modern Design */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
                aria-label="Imagem anterior"
                tabIndex={0}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
                aria-label="Próxima imagem"
                tabIndex={0}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Modern Colorful Counter */}
          {hasMultipleImages && (
            <div className="absolute top-6 left-6 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white font-bold text-sm shadow-lg">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Control Buttons - Top Right */}
          <div className="absolute top-6 right-6 flex gap-3">
            {/* Caption Toggle */}
            {currentImage.caption && (
              <button
                onClick={toggleCaptions}
                className="p-3 bg-white/10 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
                aria-label={showCaptions ? "Ocultar legendas" : "Mostrar legendas"}
                tabIndex={0}
              >
                {showCaptions ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white" />}
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
              aria-label="Tela cheia"
              tabIndex={0}
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Bottom Gradient Overlay for Info */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
          
          {/* Image Info Overlay */}
          {showCaptions && currentImage.caption && (
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-lg font-medium leading-relaxed drop-shadow-lg">
                {currentImage.caption}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Thumbnails Strip */}
        {hasMultipleImages && (
          <div className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700/50">
            <div className="p-6">
              {/* Thumbnails Navigation */}
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`flex-shrink-0 w-20 h-16 lg:w-24 lg:h-18 rounded-xl overflow-hidden border-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                        index === currentIndex 
                          ? 'border-orange-500 ring-2 ring-orange-500/30 scale-110 shadow-lg shadow-orange-500/25' 
                          : 'border-slate-600 hover:border-slate-400 hover:scale-105 opacity-70 hover:opacity-100'
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
                
                {/* Thumbnail Navigation Arrows */}
                {images.length > 4 && (
                  <>
                    <button
                      onClick={() => {
                        const container = document.querySelector('.overflow-x-auto');
                        if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                      }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 p-2 bg-slate-700/80 backdrop-blur-sm rounded-full hover:bg-slate-600/80 transition-colors shadow-lg"
                      aria-label="Rolar miniaturas para esquerda"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        const container = document.querySelector('.overflow-x-auto');
                        if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 p-2 bg-slate-700/80 backdrop-blur-sm rounded-full hover:bg-slate-600/80 transition-colors shadow-lg"
                      aria-label="Rolar miniaturas para direita"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Enhanced Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-lg flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização em tela cheia"
        >
          {/* Close Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
            aria-label="Fechar tela cheia"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          {/* Fullscreen Image Container */}
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img 
              src={getImageUrl(currentImage)} 
              alt={currentImage.caption || `${newsTitle} - Imagem ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
            
            {/* Navigation in Fullscreen - Only for multiple images */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
                
                {/* Enhanced Counter in Fullscreen */}
                <div className="absolute top-6 left-6 px-5 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white font-bold text-lg shadow-lg">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Enhanced Caption in Fullscreen */}
          {showCaptions && currentImage.caption && (
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <p className="text-white bg-black/60 backdrop-blur-md rounded-2xl p-6 inline-block max-w-3xl text-lg leading-relaxed shadow-xl">
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
