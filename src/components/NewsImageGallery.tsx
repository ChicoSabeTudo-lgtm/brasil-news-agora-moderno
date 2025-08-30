import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) return null;

  // Se há apenas uma imagem, mostra ela normalmente
  if (images.length === 1) {
    const image = images[0];
    return (
      <div className="mb-8">
        <div className="relative main-image">
          <img
            src={getImageUrl(image)}
            alt={newsTitle}
            className="w-full h-auto rounded-lg shadow-lg max-h-[600px] object-cover bg-muted"
          />
          {image.caption && (
            <div className="image-caption">
              <p>{image.caption}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Se há múltiplas imagens, usa a galeria com carousel
  return (
    <div className="image-gallery mb-8">
      {/* Imagem principal */}
      <div className="relative main-image">
        <img
          src={getImageUrl(images[selectedIndex])}
          alt={images[selectedIndex].caption || newsTitle}
          className="w-full h-auto rounded-lg shadow-lg max-h-[600px] object-cover bg-muted"
        />
        {images[selectedIndex].caption && (
          <div className="image-caption">
            <p>{images[selectedIndex].caption}</p>
          </div>
        )}
      </div>

      {/* Carousel de thumbnails */}
      <div className="mt-4">
        <Carousel className="w-full max-w-xs mx-auto">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index} className="basis-1/3">
                <div
                  className={`cursor-pointer transition-all duration-300 rounded-lg overflow-hidden border-2 ${
                    selectedIndex === index
                      ? "border-primary scale-110 shadow-lg"
                      : "border-transparent hover:border-primary/50 hover:scale-105"
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={image.caption || `Imagem ${index + 1}`}
                    className="w-full h-16 object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>

      {/* Contador de imagens */}
      <div className="text-center mt-2">
        <span className="text-sm text-muted-foreground">
          {selectedIndex + 1} de {images.length}
        </span>
      </div>
    </div>
  );
};