import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { ImageCaption } from './ImageCaption';
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

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") setIsFullscreen(false);
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isFullscreen]);

  // CORREÇÃO: Single image display - usar mesmo espaço da galeria
  if (images.length === 1) {
    const image = images[0];
    return (
      <div className="mb-4">
        <div className="rounded-xl overflow-hidden bg-muted">
          {/* CORREÇÃO: Usar aspect-video igual à galeria múltipla */}
          <div className="relative group aspect-video bg-muted flex items-center justify-center">
            <ImageWithFallback 
              src={getImageUrl(image)} 
              alt={newsTitle}
              className="max-w-full max-h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={toggleFullscreen}
            />
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {image.caption && <ImageCaption caption={image.caption} />}

        {/* Fullscreen modal for single image */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={getImageUrl(image)} 
              alt={newsTitle}
              className="max-w-full max-h-full object-contain"
            />
            {image.caption && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-foreground/90 bg-background/80 backdrop-blur-sm rounded-lg p-3 inline-block">
                  {image.caption}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Multiple images gallery
  const currentImage = images[currentIndex];

  return (
    <div className="mb-4">
      {/* Main gallery */}
      <div className="rounded-xl overflow-hidden bg-muted">
        {/* Main image */}
        <div className="relative group aspect-video bg-muted flex items-center justify-center">
          <img 
            src={getImageUrl(currentImage)} 
            alt={newsTitle}
            className="max-w-full max-h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={toggleFullscreen}
          />
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="p-4 bg-background/50">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  <img 
                    src={getImageUrl(image)} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      {currentImage.caption && <ImageCaption caption={currentImage.caption} />}

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-full max-h-full">
            <img 
              src={getImageUrl(currentImage)} 
              alt={newsTitle}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation in fullscreen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Counter in fullscreen */}
                <div className="absolute top-4 left-4 px-4 py-2 bg-muted rounded-full text-lg font-medium">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Caption in fullscreen */}
          {currentImage.caption && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-foreground/90 bg-background/80 backdrop-blur-sm rounded-lg p-4 inline-block max-w-2xl">
                {currentImage.caption}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
