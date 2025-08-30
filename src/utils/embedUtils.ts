import { z } from 'zod';

// Validation schemas for embed URLs
export const youtubeUrlSchema = z.string().refine((url) => {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /(?:youtube\.com\/shorts\/)([^"&?\/\s]{11})/
  ];
  return patterns.some(pattern => pattern.test(url));
}, "URL do YouTube inválida");

export const twitterUrlSchema = z.string().refine((url) => {
  const patterns = [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    /(?:twitter\.com|x\.com)\/\w+\/statuses\/(\d+)/
  ];
  return patterns.some(pattern => pattern.test(url));
}, "URL do Twitter/X inválida");

export const instagramUrlSchema = z.string().refine((url) => {
  const patterns = [
    /(?:instagram\.com\/p\/)([\w-]+)/,
    /(?:instagram\.com\/reel\/)([\w-]+)/,
    /(?:instagram\.com\/tv\/)([\w-]+)/
  ];
  return patterns.some(pattern => pattern.test(url));
}, "URL do Instagram inválida");

export const embedUrlSchema = z.union([
  youtubeUrlSchema,
  twitterUrlSchema,
  instagramUrlSchema
]);

// Extract IDs from URLs
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /(?:youtube\.com\/shorts\/)([^"&?\/\s]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractTwitterId(url: string): string | null {
  const patterns = [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    /(?:twitter\.com|x\.com)\/\w+\/statuses\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractInstagramId(url: string): string | null {
  const patterns = [
    /(?:instagram\.com\/p\/)([\w-]+)/,
    /(?:instagram\.com\/reel\/)([\w-]+)/,
    /(?:instagram\.com\/tv\/)([\w-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Determine provider from URL
export function detectProvider(url: string): 'youtube' | 'twitter' | 'instagram' | null {
  if (youtubeUrlSchema.safeParse(url).success) return 'youtube';
  if (twitterUrlSchema.safeParse(url).success) return 'twitter';
  if (instagramUrlSchema.safeParse(url).success) return 'instagram';
  return null;
}

// Extract embed data from URL
export function extractEmbedData(url: string): { provider: string; id: string } | null {
  const provider = detectProvider(url);
  if (!provider) return null;

  let id: string | null = null;
  
  switch (provider) {
    case 'youtube':
      id = extractYouTubeId(url);
      break;
    case 'twitter':
      id = extractTwitterId(url);
      break;
    case 'instagram':
      id = extractInstagramId(url);
      break;
  }

  if (!id) return null;
  
  return { provider, id };
}

// Generate embed marker
export function generateEmbedMarker(provider: string, id: string): string {
  return `<!--EMBED:${JSON.stringify({ provider, id })}-->`;
}

// Parse embed markers from HTML
export function parseEmbedMarkers(html: string): Array<{ marker: string; provider: string; id: string; index: number }> {
  const markers: Array<{ marker: string; provider: string; id: string; index: number }> = [];
  const regex = /<!--EMBED:(\{[^}]+\})-->/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      if (data.provider && data.id) {
        markers.push({
          marker: match[0],
          provider: data.provider,
          id: data.id,
          index: match.index
        });
      }
    } catch (error) {
      console.warn('Invalid embed marker:', match[0]);
    }
  }

  return markers;
}

// Resolve embed token (for legacy compatibility)
export function resolveEmbed(token: string): { provider: string; id: string } | null {
  try {
    const match = token.match(/<!--EMBED:(\{[^}]+\})-->/);
    if (match) {
      const data = JSON.parse(match[1]);
      if (data.provider && data.id) {
        return { provider: data.provider, id: data.id };
      }
    }
  } catch (error) {
    console.warn('Failed to resolve embed token:', token);
  }
  return null;
}