import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
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

interface SimpleImageGalleryProps {
  images: NewsImage[];
  newsTitle: string;
}

export const SimpleImageGallery = ({ images, newsTitle }: SimpleImageGalleryProps) => {
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

  const currentImage = images[currentIndex];

  return (
    <div className="mb-6">
      {/* Galeria principal */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden" style={{ boxShadow: 'none' }}>
        {/* Container da imagem */}
        <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: '500px' }}>
          <ImageWithFallback 
            src={getImageUrl(currentImage)} 
            alt={newsTitle}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={toggleFullscreen}
          />
          
          {/* Contador de imagens */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#ef4444', boxShadow: 'none' }}>
              {currentIndex + 1} de {images.length}
            </div>
          )}

          {/* Botão de tela cheia */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            style={{ boxShadow: 'none' }}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Setas de navegação */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                style={{ boxShadow: 'none' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                style={{ boxShadow: 'none' }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Legenda */}
          {currentImage.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gray-50 p-4" style={{ boxShadow: 'none' }}>
              <p className="text-gray-800 text-xs leading-relaxed" style={{ color: '#374151', textShadow: 'none', fontSize: '0.75rem' }}>
                {currentImage.caption}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? "border-red-500 scale-105" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ boxShadow: 'none' }}
            >
              <img 
                src={getImageUrl(image)} 
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full"
                style={{ 
                  boxShadow: 'none',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  width: '100%',
                  height: '100%'
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal tela cheia */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
            style={{ boxShadow: 'none' }}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
                style={{ boxShadow: 'none' }}
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
                style={{ boxShadow: 'none' }}
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          <img 
            src={getImageUrl(currentImage)} 
            alt={newsTitle}
            className="max-w-full max-h-full object-contain"
            style={{ boxShadow: 'none' }}
          />

          {currentImage.caption && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black/80 rounded-lg p-4 inline-block max-w-2xl" style={{ boxShadow: 'none' }}>
                <p className="text-white text-xs" style={{ color: 'white', textShadow: 'none', fontSize: '0.75rem' }}>
                  {currentImage.caption}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
