import { ModernImageGallery } from './ModernImageGallery';

interface NewsImage {
  image_url: string;
  public_url?: string;
  path?: string;
  caption?: string;
  is_cover: boolean;
  sort_order: number;
}

interface AdaptiveImageGalleryProps {
  images: NewsImage[];
  newsTitle: string;
  variant?: 'marinho' | 'default';
  showCaption?: 'always' | 'hover' | 'never';
}

/**
 * Wrapper do ModernImageGallery com configurações otimizadas para produção
 * Foca na adaptação automática de imagens verticais e horizontais
 */
export const AdaptiveImageGallery = ({ 
  images, 
  newsTitle, 
  variant = 'marinho',
  showCaption = 'hover'
}: AdaptiveImageGalleryProps) => {
  return (
    <ModernImageGallery
      images={images}
      newsTitle={newsTitle}
      variant={variant}
      showCaption={showCaption}
    />
  );
};


