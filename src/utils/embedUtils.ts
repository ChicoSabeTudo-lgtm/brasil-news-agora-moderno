import { z } from 'zod';

// Validation schemas for embed URLs
export const youtubeUrlSchema = z.string().refine((url) => {
  const patterns = [
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    /(?:youtube\.com\/shorts\/)([^"&?/\s]{11})/
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

// Schema for Instagram blockquote HTML
export const instagramBlockquoteSchema = z.string().refine((html) => {
  return html.includes('data-instgrm-permalink') && html.includes('instagram.com');
}, "Código embed do Instagram inválido");

export const embedUrlSchema = z.union([
  youtubeUrlSchema,
  twitterUrlSchema,
  instagramUrlSchema,
  instagramBlockquoteSchema
]);

// Extract IDs from URLs
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    /(?:youtube\.com\/shorts\/)([^"&?/\s]{11})/
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

export function extractInstagramData(input: string): { type: string; id: string } | null {
  // First try to extract from blockquote HTML
  if (input.includes('data-instgrm-permalink')) {
    const permalinkMatch = input.match(/data-instgrm-permalink="([^"]+)"/);
    if (permalinkMatch) {
      const permalink = permalinkMatch[1];
      const urlMatch = permalink.match(/instagram\.com\/(reel|p|tv)\/([\w-]+)/);
      if (urlMatch) {
        return { type: urlMatch[1], id: urlMatch[2] };
      }
    }
  }
  
  // Clean querystrings and extract from URL
  const cleanUrl = input.split('?')[0].split('#')[0];
  const patterns = [
    /(?:instagram\.com\/(p)\/([\w-]+))/,
    /(?:instagram\.com\/(reel)\/([\w-]+))/,
    /(?:instagram\.com\/(tv)\/([\w-]+))/
  ];
  
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) return { type: match[1], id: match[2] };
  }
  return null;
}

// Legacy function for backward compatibility
export function extractInstagramId(url: string): string | null {
  const data = extractInstagramData(url);
  return data ? data.id : null;
}

// Determine provider from URL or HTML
export function detectProvider(input: string): 'youtube' | 'twitter' | 'instagram' | null {
  if (youtubeUrlSchema.safeParse(input).success) return 'youtube';
  if (twitterUrlSchema.safeParse(input).success) return 'twitter';
  if (instagramUrlSchema.safeParse(input).success || instagramBlockquoteSchema.safeParse(input).success) return 'instagram';
  return null;
}

// Extract embed data from URL or HTML
export function extractEmbedData(input: string): { provider: string; id: string; type?: string } | null {
  const provider = detectProvider(input);
  if (!provider) return null;

  switch (provider) {
    case 'youtube': {
      const id = extractYouTubeId(input);
      return id ? { provider, id } : null;
    }
    case 'twitter': {
      const id = extractTwitterId(input);
      return id ? { provider, id } : null;
    }
    case 'instagram': {
      const data = extractInstagramData(input);
      return data ? { provider, id: data.id, type: data.type } : null;
    }
  }

  return null;
}

// Generate embed marker
export function generateEmbedMarker(provider: string, id: string, type?: string): string {
  const data = type ? { provider, id, type } : { provider, id };
  return `<!--EMBED:${JSON.stringify(data)}-->`;
}

// Parse embed markers from HTML
export function parseEmbedMarkers(html: string): Array<{ marker: string; provider: string; id: string; type?: string; index: number }> {
  const markers: Array<{ marker: string; provider: string; id: string; type?: string; index: number }> = [];
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
          type: data.type,
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