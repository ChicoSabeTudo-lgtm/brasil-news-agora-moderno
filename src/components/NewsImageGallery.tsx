import { useEffect, useRef } from "react";
import ImageGallery from "@/utils/imageGallery";
import "@/styles/imageGallery.css";

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
  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryInstanceRef = useRef<ImageGallery | null>(null);

  useEffect(() => {
    if (!galleryRef.current || !images || images.length === 0) return;

    // Se há apenas uma imagem, usa a estrutura da galeria mas sem navegação
    if (images.length === 1) {
      const image = images[0];
      galleryRef.current.innerHTML = `
        <div class="gallery-main mb-8">
          <div class="main-image-container">
            <img class="main-image" src="${getImageUrl(image)}" alt="${newsTitle}" />
            ${image.caption ? `
              <div class="image-overlay">
                <p class="main-caption">${image.caption}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `;
      return;
    }

    // Para múltiplas imagens, usar a galeria JavaScript moderna
    const galleryId = `gallery-${Math.random().toString(36).substr(2, 9)}`;
    galleryRef.current.id = galleryId;

    const galleryImages = images.map(image => ({
      src: getImageUrl(image),
      caption: image.caption || ''
    }));

    // Criar nova instância da galeria
    galleryInstanceRef.current = new ImageGallery(galleryId, galleryImages);

    // Cleanup
    return () => {
      if (galleryInstanceRef.current) {
        galleryInstanceRef.current.destroy();
        galleryInstanceRef.current = null;
      }
    };
  }, [images, newsTitle, getImageUrl]);

  if (!images || images.length === 0) return null;

  return <div ref={galleryRef} className="mb-8"></div>;
};