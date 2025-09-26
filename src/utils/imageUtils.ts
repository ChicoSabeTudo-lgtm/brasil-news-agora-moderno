interface NewsImage {
  image_url: string;
  public_url?: string;
  path?: string;
  is_cover: boolean;
  sort_order: number;
}

export function getImageUrl(image: NewsImage): string {
  // Prioridade: public_url > image_url > construir URL a partir do path
  if (image.public_url && image.public_url.trim() !== '') {
    return image.public_url;
  }
  
  if (image.image_url && image.image_url.trim() !== '') {
    return image.image_url;
  }
  
  if (image.path && image.path.trim() !== '') {
    return publicStorageUrl(`news-images/${image.path}`);
  }
  
  return '';
}

export function getCoverImage(images: NewsImage[]): NewsImage | undefined {
  return images.find(img => img.is_cover) || images[0];
}

export function getNonCoverImages(images: NewsImage[]): NewsImage[] {
  return images.filter(img => !img.is_cover).sort((a, b) => a.sort_order - b.sort_order);
}
export function publicStorageUrl(path: string): string {
  const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const clean = (path || '').replace(/^\//, '');
  if (!base) return `/${clean}`;
  return `${base}/storage/v1/object/public/${clean}`;
}
