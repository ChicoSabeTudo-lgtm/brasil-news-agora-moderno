import NewsGallery from '@/components/NewsGallery';

interface NewsImage {
  id?: string;
  news_id?: string;
  image_url: string;
  path?: string;
  public_url?: string;
  caption?: string;
  is_cover: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

interface ImageGalleryEditorProps {
  newsId?: string;
  onImagesChange?: (images: NewsImage[]) => void;
  initialImages?: NewsImage[];
}

export const ImageGalleryEditor = ({ newsId, onImagesChange, initialImages = [] }: ImageGalleryEditorProps) => {
  return (
    <NewsGallery 
      newsId={newsId}
      isEditor={true}
      onImagesChange={onImagesChange}
      initialImages={initialImages}
    />
  );
};