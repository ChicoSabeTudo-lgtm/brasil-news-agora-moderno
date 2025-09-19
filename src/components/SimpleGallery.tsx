import { useState } from "react";

interface NewsImage {
  image_url: string;
  public_url?: string;
  path?: string;
  caption?: string;
  is_cover: boolean;
  sort_order: number;
}

interface SimpleGalleryProps {
  images: NewsImage[];
  newsTitle: string;
}

export const SimpleGallery = ({ images, newsTitle }: SimpleGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div>Nenhuma imagem encontrada</div>;
  }

  const currentImage = images[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Galeria Simples (Debug)</h3>
      
      {/* Debug info */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>Total de imagens:</strong> {images.length}</p>
        <p><strong>Imagem atual:</strong> {currentIndex + 1}</p>
        <p><strong>URL da imagem:</strong> {currentImage.image_url}</p>
        <p><strong>Public URL:</strong> {currentImage.public_url}</p>
      </div>

      {/* Galeria principal */}
      <div className="relative group bg-gray-200 rounded-lg overflow-hidden">
        <div className="relative aspect-video bg-gray-200 flex items-center justify-center">
          <img 
            src={currentImage.image_url || currentImage.public_url} 
            alt={newsTitle}
            className="max-w-full max-h-full object-contain cursor-pointer"
            onError={(e) => {
              console.error('Erro ao carregar imagem:', e);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Imagem carregada com sucesso');
            }}
          />
          
          {/* Contador */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
            {currentIndex + 1} de {images.length}
          </div>

          {/* Setas */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white"
              >
                →
              </button>
            </>
          )}
        </div>
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                index === currentIndex 
                  ? "border-red-600" 
                  : "border-gray-300"
              }`}
            >
              <img 
                src={image.image_url || image.public_url} 
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Legenda */}
      {currentImage.caption && (
        <div className="mt-3 text-sm text-gray-700">
          <p>{currentImage.caption}</p>
        </div>
      )}
    </div>
  );
};

