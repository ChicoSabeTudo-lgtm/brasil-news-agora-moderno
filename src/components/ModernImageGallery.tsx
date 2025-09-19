import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2, Info } from "lucide-react";
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

interface ModernImageGalleryProps {
  images: NewsImage[];
  newsTitle: string;
  variant?: 'marinho' | 'default';
  showCaption?: 'always' | 'hover' | 'never';
}

export const ModernImageGallery = ({ 
  images, 
  newsTitle, 
  variant = 'marinho',
  showCaption = 'hover'
}: ModernImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [showCaptionOverlay, setShowCaptionOverlay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const toggleCaption = () => {
    setShowCaptionOverlay(!showCaptionOverlay);
  };

  // Função para detectar dimensões da imagem
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  // Calcular proporção da imagem
  const getImageAspectRatio = () => {
    if (!imageDimensions) return 16/9; // fallback
    return imageDimensions.width / imageDimensions.height;
  };

  // Determinar se a imagem é vertical ou horizontal
  const isVerticalImage = () => {
    const aspectRatio = getImageAspectRatio();
    return aspectRatio < 1; // altura maior que largura
  };

  // Cores do tema marinho institucional
  const colors = {
    marinho: {
      primary: '#0E2A47',
      hover: '#0B2239',
      accent: '#C6001C',
      text: '#ffffff',
      muted: '#f8f9fa'
    },
    default: {
      primary: '#000000',
      hover: '#333333',
      accent: '#ef4444',
      text: '#000000',
      muted: '#f8f9fa'
    }
  };

  const theme = colors[variant];
  const currentImage = images[currentIndex];

  // Função para processar legenda com formatação especial
  const processCaption = (caption: string) => {
    if (!caption) return '';
    
    const processedCaption = caption
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\b(ativos?|ativo)\b/gi, '<strong>$1</strong>')
      .replace(/\b(marinho|institucional)\b/gi, '<strong>$1</strong>')
      .replace(/\b(vertical|horizontal)\b/gi, '<strong>$1</strong>');
    
    return processedCaption;
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
      <div className="mb-6 modern-gallery-no-shadow" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
        <div className="relative group bg-black rounded-lg overflow-hidden modern-gallery-no-shadow" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
          {/* Container principal - altura fixa para consistência */}
          <div 
            ref={containerRef}
            className="relative bg-black flex items-center justify-center"
            style={{
              height: '500px'
            }}
          >
            <ImageWithFallback 
              src={getImageUrl(image)} 
              alt={newsTitle}
              className="max-w-full max-h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={toggleFullscreen}
              onLoad={handleImageLoad}
            />
            
            {/* Controles superiores */}
            <div className="absolute top-4 right-4 flex gap-2">
              {/* Botão de legenda */}
              {image.caption && showCaption !== 'never' && (
                <button
                  onClick={toggleCaption}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  style={{ boxShadow: 'none !important', filter: 'none !important' }}
                >
                  <Info className="w-4 h-4" />
                </button>
              )}
              
              {/* Botão de tela cheia */}
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Legenda moderna dentro da galeria */}
            {image.caption && showCaption !== 'never' && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
              <div className="flex items-start gap-3" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
                  <Info className="w-3 h-3 text-white" style={{ boxShadow: 'none !important', filter: 'none !important' }} />
                </div>
                <div className="flex-1" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
                  <p 
                    dangerouslySetInnerHTML={{ 
                      __html: processCaption(image.caption) 
                    }}
                    className="text-white text-xs leading-relaxed font-normal"
                    style={{ boxShadow: 'none !important', filter: 'none !important', textShadow: 'none !important' }}
                  />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Modal tela cheia para imagem única */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img 
              src={getImageUrl(image)} 
              alt={newsTitle}
              className="max-w-full max-h-full object-contain"
            />
            {image.caption && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 inline-block max-w-2xl">
                  <p 
                    className="text-white/90"
                    dangerouslySetInnerHTML={{ 
                      __html: processCaption(image.caption) 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Galeria com múltiplas imagens
  return (
    <div className="mb-6 modern-gallery-no-shadow" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
      {/* Galeria principal */}
      <div className="relative group bg-black rounded-lg overflow-hidden modern-gallery-no-shadow" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
        {/* Container principal - altura fixa para consistência */}
        <div 
          ref={containerRef}
          className="relative bg-black flex items-center justify-center"
          style={{
            height: '500px'
          }}
        >
          <ImageWithFallback 
            src={getImageUrl(currentImage)} 
            alt={newsTitle}
            className="max-w-full max-h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={toggleFullscreen}
            onLoad={handleImageLoad}
          />
          
          {/* Contador de imagens */}
          <div 
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: theme.accent, boxShadow: 'none !important', filter: 'none !important' }}
          >
            {currentIndex + 1} de {images.length}
          </div>

          {/* Controles superiores */}
          <div className="absolute top-4 right-4 flex gap-2">
            {/* Botão de legenda */}
            {currentImage.caption && showCaption !== 'never' && (
              <button
                onClick={toggleCaption}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
            
            {/* Botão de tela cheia */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Setas de navegação */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            style={{ boxShadow: 'none !important', filter: 'none !important' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            style={{ boxShadow: 'none !important', filter: 'none !important' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Legenda moderna dentro da galeria */}
          {currentImage.caption && showCaption !== 'never' && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
              <div className="flex items-start gap-3" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
                  <Info className="w-3 h-3 text-white" style={{ boxShadow: 'none !important', filter: 'none !important' }} />
                </div>
                <div className="flex-1" style={{ boxShadow: 'none !important', filter: 'none !important' }}>
                  <p 
                    dangerouslySetInnerHTML={{ 
                      __html: processCaption(currentImage.caption) 
                    }}
                    className="text-white text-xs leading-relaxed font-normal"
                    style={{ boxShadow: 'none !important', filter: 'none !important', textShadow: 'none !important' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Miniaturas */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentIndex 
                ? "border-2 scale-105" 
                : "border-gray-300 hover:border-gray-400"
            }`}
            style={{
              borderColor: index === currentIndex ? theme.accent : undefined,
              boxShadow: 'none !important',
              filter: 'none !important'
            }}
          >
            <img 
              src={getImageUrl(image)} 
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover object-center"
              style={{ boxShadow: 'none' }}
            />
          </button>
        ))}
      </div>

      {/* Modal tela cheia */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Botão fechar */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navegação em tela cheia */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          {/* Imagem principal em tela cheia */}
          <img 
            src={getImageUrl(currentImage)} 
            alt={newsTitle}
            className="max-w-full max-h-full object-contain"
          />

          {/* Contador em tela cheia */}
          <div 
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: theme.accent }}
          >
            {currentIndex + 1} de {images.length}
          </div>

          {/* Legenda em tela cheia */}
          {currentImage.caption && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 inline-block max-w-2xl">
                <p 
                  className="text-white/90"
                  dangerouslySetInnerHTML={{ 
                    __html: processCaption(currentImage.caption) 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



