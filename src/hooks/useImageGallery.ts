import { useState, useEffect, useCallback, useRef } from 'react';

interface NewsImage {
  image_url: string;
  public_url?: string;
  path?: string;
  caption?: string;
  is_cover: boolean;
  sort_order: number;
}

interface UseImageGalleryProps {
  images: NewsImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const useImageGallery = ({ 
  images, 
  autoPlay = false, 
  autoPlayInterval = 5000 
}: UseImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const hasMultipleImages = images.length > 1;

  // Navigation functions
  const nextImage = useCallback(() => {
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setIsLoading(true);
    }
  }, [hasMultipleImages, images.length]);

  const prevImage = useCallback(() => {
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsLoading(true);
    }
  }, [hasMultipleImages, images.length]);

  const goToImage = useCallback((index: number) => {
    if (index !== currentIndex && index >= 0 && index < images.length) {
      setCurrentIndex(index);
      setIsLoading(true);
    }
  }, [currentIndex, images.length]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const toggleCaptions = useCallback(() => {
    setShowCaptions(prev => !prev);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && hasMultipleImages && !isPaused && !isFullscreen) {
      autoPlayRef.current = setInterval(() => {
        nextImage();
      }, autoPlayInterval);

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [autoPlay, hasMultipleImages, isPaused, isFullscreen, nextImage, autoPlayInterval]);

  // Pause auto-play on user interaction
  const handleUserInteraction = useCallback(() => {
    if (autoPlay && !isPaused) {
      setIsPaused(true);
      // Resume after 10 seconds of inactivity
      setTimeout(() => setIsPaused(false), 10000);
    }
  }, [autoPlay, isPaused]);

  // Preload images for better performance
  useEffect(() => {
    if (hasMultipleImages) {
      const preloadImage = (index: number) => {
        if (index >= 0 && index < images.length) {
          const img = new Image();
          img.src = images[index].image_url || images[index].public_url || '';
        }
      };

      // Preload next and previous images
      const nextIndex = (currentIndex + 1) % images.length;
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      
      preloadImage(nextIndex);
      preloadImage(prevIndex);
    }
  }, [currentIndex, hasMultipleImages, images]);

  // Reset loading state when image changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  return {
    // State
    currentIndex,
    isFullscreen,
    showCaptions,
    isLoading,
    isPaused,
    hasMultipleImages,
    currentImage: images[currentIndex],
    
    // Actions
    nextImage,
    prevImage,
    goToImage,
    toggleFullscreen,
    toggleCaptions,
    toggleAutoPlay,
    setIsLoading,
    handleUserInteraction,
    
    // Computed
    totalImages: images.length,
    isFirstImage: currentIndex === 0,
    isLastImage: currentIndex === images.length - 1,
  };
};
