// Utility functions for video handling

/**
 * Extracts video ID from different video platforms
 */
export const extractVideoId = (videoUrl: string) => {
  // YouTube
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = videoUrl.includes('youtube.com') 
      ? videoUrl.split('v=')[1]?.split('&')[0]
      : videoUrl.split('youtu.be/')[1]?.split('?')[0];
    return { platform: 'youtube', id: videoId };
  }
  
  // Vimeo
  if (videoUrl.includes('vimeo.com')) {
    const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
    return { platform: 'vimeo', id: videoId };
  }
  
  return { platform: 'unknown', id: null };
};

/**
 * Gets the thumbnail URL for a video based on its platform
 */
export const getVideoThumbnail = (videoUrl: string) => {
  const { platform, id } = extractVideoId(videoUrl);
  
  switch (platform) {
    case 'youtube':
      if (id) {
        // Try maxresdefault first (highest quality)
        return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      }
      break;
    case 'vimeo':
      if (id) {
        // For Vimeo, we'd need to make an API call to get the thumbnail
        // For now, return null and let the fallback handle it
        return null;
      }
      break;
  }
  
  return null;
};

/**
 * Gets the best available thumbnail for a video
 * Tries custom thumbnail first, then auto-generated from video URL
 */
export const getBestVideoThumbnail = (thumbnailUrl: string | null, videoUrl: string, fallbackImage: string) => {
  // If custom thumbnail exists, use it
  if (thumbnailUrl) {
    return thumbnailUrl;
  }
  
  // Try to get auto-generated thumbnail from video platform
  const autoThumbnail = getVideoThumbnail(videoUrl);
  if (autoThumbnail) {
    return autoThumbnail;
  }
  
  // Fall back to default image
  return fallbackImage;
};