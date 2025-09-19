import { ModernImageGallery } from './ModernImageGallery';

interface NewsImage {
  image_url: string;
  public_url?: string;
  path?: string;
  caption?: string;
  is_cover: boolean;
  sort_order: number;
}

interface InstitutionalImageGalleryProps {
  images: NewsImage[];
  newsTitle: string;
  variant?: 'marinho' | 'default';
  showCaption?: 'always' | 'hover' | 'never';
}

/**
 * Wrapper do ModernImageGallery para compatibilidade com código existente
 * Usa a galeria moderna como padrão em produção
 */
export const InstitutionalImageGallery = ({ 
  images, 
  newsTitle, 
  variant = 'marinho',
  showCaption = 'hover'
}: InstitutionalImageGalleryProps) => {
  return (
    <ModernImageGallery
      images={images}
      newsTitle={newsTitle}
      variant={variant}
      showCaption={showCaption}
    />
  );
};


