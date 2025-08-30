import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { ImageCaption } from './ImageCaption';

interface NewsImage {
  image_url: string;
  caption?: string;
  is_featured: boolean;
}

interface NewsImageGalleryProps {
  images: NewsImage[];
  newsTitle: string;
  getImageUrl: (image: NewsImage) => string;
}

export const NewsImageGallery = ({ images, newsTitle, getImageUrl }: NewsImageGalleryProps) => {
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

  // Single image display
  if (images.length === 1) {
    const image = images[0];
    return (
      <div className="mb-4">
        <div className="rounded-xl overflow-hidden bg-muted">
          <div className="relative group">
            <img 
              src={getImageUrl(image)} 
              alt={newsTitle}
              className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
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

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Caption footer - separate from gallery */}
      {currentImage.caption && <ImageCaption caption={currentImage.caption} />}

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? "border-primary shadow-lg scale-105" 
                  : "border-border hover:border-primary/50"
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
      )}

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation in fullscreen */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Main fullscreen image */}
          <img 
            src={getImageUrl(currentImage)} 
            alt={newsTitle}
            className="max-w-full max-h-full object-contain"
          />

          {/* Caption in fullscreen */}
          {currentImage.caption && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-foreground/90 bg-background/80 backdrop-blur-sm rounded-lg p-3 inline-block max-w-2xl">
                {currentImage.caption}
              </p>
            </div>
          )}

          {/* Counter in fullscreen */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-muted rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}

    </div>
  );
};