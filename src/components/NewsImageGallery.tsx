import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2, Camera } from "lucide-react";
import { ImageWithFallback } from './ImageWithFallback';
import { getImageUrl } from '@/utils/imageUtils';

interface NewsImage {
  image_url: string;
  public_url?: string;
  path?: string;
  caption?: string;
  credit?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imageLoadStates, setImageLoadStates] = useState<boolean[]>([]);
  
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  const parseCaption = (raw?: string) => {
    if (!raw) return { text: '' };
    const parts = raw.split('|');
    if (parts.length < 2) return { text: raw.trim() };
    const credit = parts.pop();
    const text = parts.join('|');
    return { text: text.trim(), credit: credit?.trim() };
  };

  // Initialize image load states
  useEffect(() => {
    setImageLoadStates(new Array(images.length).fill(false));
  }, [images.length]);

  // Navigation functions
  const nextImage = useCallback(() => {
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setIsLoading(!imageLoadStates[(currentIndex + 1) % images.length]);
    }
  }, [hasMultipleImages, images.length, imageLoadStates, currentIndex]);

  const prevImage = useCallback(() => {
    if (hasMultipleImages) {
      const newIndex = (currentIndex - 1 + images.length) % images.length;
      setCurrentIndex(newIndex);
      setIsLoading(!imageLoadStates[newIndex]);
    }
  }, [hasMultipleImages, images.length, imageLoadStates, currentIndex]);

  const goToImage = useCallback((index: number) => {
    if (index !== currentIndex && index >= 0 && index < images.length) {
      setCurrentIndex(index);
      setIsLoading(!imageLoadStates[index]);
    }
  }, [currentIndex, images.length, imageLoadStates]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Scroll active thumbnail into view with smooth animation
  useEffect(() => {
    if (activeThumbnailRef.current && thumbnailsRef.current) {
      const thumbnail = activeThumbnailRef.current;
      const container = thumbnailsRef.current;
      
      const thumbnailRect = thumbnail.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const scrollLeft = thumbnail.offsetLeft - container.offsetLeft - 
        (containerRect.width / 2) + (thumbnailRect.width / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
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
        case "Home":
          e.preventDefault();
          goToImage(0);
          break;
        case "End":
          e.preventDefault();
          goToImage(images.length - 1);
          break;
        case " ":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [prevImage, nextImage, isFullscreen, goToImage, images.length, toggleFullscreen]);

  // Enhanced touch/swipe handling
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

    if (isLeftSwipe && hasMultipleImages) {
      nextImage();
    } else if (isRightSwipe && hasMultipleImages) {
      prevImage();
    }
  };

  // Enhanced image loading handler
  const handleImageLoad = useCallback((index: number) => {
    setImageLoadStates(prev => {
      const newStates = [...prev];
      newStates[index] = true;
      return newStates;
    });
    
    if (index === currentIndex) {
      setIsLoading(false);
    }
  }, [currentIndex]);

  const handleMainImageLoad = () => {
    handleImageLoad(currentIndex);
  };

  // Aggressive preloading strategy
  useEffect(() => {
    if (hasMultipleImages) {
      const preloadImage = (index: number) => {
        if (index >= 0 && index < images.length && !imageLoadStates[index]) {
          const img = new Image();
          img.onload = () => handleImageLoad(index);
          img.src = getImageUrl(images[index]);
        }
      };

      // Preload current, next, and previous images
      preloadImage(currentIndex);
      preloadImage((currentIndex + 1) % images.length);
      preloadImage((currentIndex - 1 + images.length) % images.length);
      
      // Preload additional images in background
      setTimeout(() => {
        for (let i = 0; i < images.length; i++) {
          if (i !== currentIndex && 
              i !== (currentIndex + 1) % images.length && 
              i !== (currentIndex - 1 + images.length) % images.length) {
            preloadImage(i);
          }
        }
      }, 1000);
    }
  }, [currentIndex, hasMultipleImages, images, imageLoadStates, handleImageLoad]);

  // Auto-advance functionality (optional)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = useCallback(() => {
    if (hasMultipleImages && !isAutoPlaying) {
      setIsAutoPlaying(true);
      autoPlayRef.current = setInterval(() => {
        nextImage();
      }, 5000);
    }
  }, [hasMultipleImages, isAutoPlaying, nextImage]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    setIsAutoPlaying(false);
  }, []);

  // Stop auto-play on user interaction
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  return (
    <div className="mb-6">
      {/* Main Gallery Container */}
      <div 
        className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseEnter={stopAutoPlay}
        onMouseLeave={() => hasMultipleImages && startAutoPlay()}
      >
        {/* Main Image Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Main Image */}
          <img
            ref={mainImageRef}
            src={getImageUrl(currentImage)}
            alt={currentImage.caption || `${newsTitle} - Imagem ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-all duration-500 ease-out"
            style={{ 
              opacity: isLoading ? 0 : 1,
              transform: isLoading ? 'scale(1.05)' : 'scale(1)'
            }}
            onLoad={handleMainImageLoad}
            onError={() => setIsLoading(false)}
            loading="eager"
          />

          {/* Top Overlay - Counter and Fullscreen */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
            {/* Counter */}
            <div className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-lg">
              {currentIndex + 1} de {images.length}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              aria-label="Tela cheia"
              title="Tela cheia (Espaço)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Arrows - Only visible on hover for multiple images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full opacity-0 hover:opacity-100 group-hover:opacity-100 hover:bg-black/70 transition-all duration-200 z-20"
                aria-label="Imagem anterior"
                title="Imagem anterior (←)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full opacity-0 hover:opacity-100 group-hover:opacity-100 hover:bg-black/70 transition-all duration-200 z-20"
                aria-label="Próxima imagem"
                title="Próxima imagem (→)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Bottom Overlay - Caption */}
          {currentImage.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 z-20">
              {(() => {
                const { text, credit } = parseCaption(currentImage.caption);
                return (
                  <p className="text-white text-sm leading-relaxed font-medium">
                    {text}
                    {credit && (
                      <span className="opacity-90 ml-2 inline-flex items-center gap-1 font-normal">
                        |
                        <Camera className="w-4 h-4" />
                        <span>{credit}</span>
                      </span>
                    )}
                  </p>
                );
              })()}
            </div>
          )}

          {/* Hover overlay for better UX */}
          <div className="absolute inset-0 group" />
        </div>

        {/* Thumbnails Area - Only for multiple images */}
        {hasMultipleImages && (
          <div className="bg-black/95 backdrop-blur-sm p-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              {/* Previous Button */}
              <button
                onClick={prevImage}
                className="flex-shrink-0 p-2 text-white hover:bg-white/10 rounded-md transition-all duration-200 hover:scale-110"
                aria-label="Imagem anterior"
                title="Imagem anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Thumbnails Container */}
              <div 
                ref={thumbnailsRef}
                className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex gap-2 min-w-max py-1">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      ref={index === currentIndex ? activeThumbnailRef : null}
                      onClick={() => goToImage(index)}
                      className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${
                        index === currentIndex 
                          ? 'border-red-500 ring-2 ring-red-500/40 shadow-lg shadow-red-500/25' 
                          : 'border-gray-600 hover:border-gray-400 hover:shadow-md'
                      }`}
                      aria-label={`Ver imagem ${index + 1}`}
                      title={`Imagem ${index + 1}${image.caption ? `: ${image.caption}` : ''}`}
                    >
                      <img 
                        src={getImageUrl(image)} 
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover transition-all duration-300"
                        loading="lazy"
                        style={{
                          filter: index === currentIndex ? 'brightness(1)' : 'brightness(0.7)',
                        }}
                      />
                      {/* Loading indicator for thumbnails */}
                      {!imageLoadStates[index] && (
                        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={nextImage}
                className="flex-shrink-0 p-2 text-white hover:bg-white/10 rounded-md transition-all duration-200 hover:scale-110"
                aria-label="Próxima imagem"
                title="Próxima imagem"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização em tela cheia"
        >
          {/* Close Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors z-10 shadow-lg"
            aria-label="Fechar tela cheia"
            title="Fechar (Escape)"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Fullscreen Image Container */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors shadow-lg"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors shadow-lg"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
                
                {/* Counter in Fullscreen */}
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-md text-lg font-semibold shadow-lg">
                  {currentIndex + 1} de {images.length}
                </div>
              </>
            )}
          </div>

          {/* Caption in Fullscreen */}
          {currentImage.caption && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              {(() => {
                const { text, credit } = parseCaption(currentImage.caption);
                return (
                  <p className="text-white bg-black/70 backdrop-blur-sm rounded-lg p-4 inline-block max-w-2xl shadow-lg text-base">
                    {text}
                    {credit && (
                      <span className="opacity-90 ml-2 inline-flex items-center gap-1 font-normal">
                        |
                        <Camera className="w-4 h-4" />
                        <span>{credit}</span>
                      </span>
                    )}
                  </p>
                );
              })()}
            </div>
          )}

          {/* Fullscreen Thumbnails */}
          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="flex gap-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-12 h-8 rounded overflow-hidden border transition-all ${
                      index === currentIndex 
                        ? 'border-red-500 ring-1 ring-red-500/50' 
                        : 'border-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={getImageUrl(image)} 
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen Reader Instructions */}
      <div className="sr-only">
        <p>
          Galeria de imagens. Use as setas do teclado para navegar. 
          Pressione Espaço para tela cheia. Pressione Escape para sair da tela cheia.
          Home para primeira imagem, End para última imagem.
        </p>
      </div>
    </div>
  );
};
