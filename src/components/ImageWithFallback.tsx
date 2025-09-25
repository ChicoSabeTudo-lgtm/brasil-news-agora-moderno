import { useState } from 'react';
import { Image } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onClick?: () => void;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc,
  onError,
  onClick,
  onLoad: onLoadProp
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    onLoadProp?.(event);
  };

  // Se não há src ou houve erro e não há fallback
  if (!src || (hasError && !fallbackSrc)) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Image className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <img
        src={hasError && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
      />
    </div>
  );
}