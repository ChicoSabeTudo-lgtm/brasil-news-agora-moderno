import DOMPurify from 'dompurify';
import React from 'react';

// Configure DOMPurify with safe settings - preserving Rich Text Editor formatting
const purifyConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'strike', 'del', 'ins', 'sub', 'sup',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'td', 'th', 'hr', 'iframe', 'video',
    'audio', 'source', 'figure', 'figcaption'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'width', 'height', 'class', 'id',
    'target', 'rel', 'data-*', 'controls', 'autoplay', 'loop', 'muted',
    'poster', 'preload', 'style', 'frameborder', 'allowfullscreen',
    'allow', 'loading', 'decoding', 'color', 'background-color',
    'text-align', 'font-size', 'font-weight', 'font-style', 'text-decoration'
  ],
  ALLOW_DATA_ATTR: true,
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  KEEP_CONTENT: true,
  FORCE_BODY: false
};

/**
 * Removes manual bullet points from HTML content that conflict with <li> elements
 * @param html - The HTML content to clean
 * @returns HTML with manual bullets removed
 */
const removeManualBullets = (html: string): string => {
  if (!html) return '';
  
  let cleaned = html;
  
  // Remove bullets at the start of <li> elements (with possible whitespace)
  cleaned = cleaned.replace(/<li[^>]*>\s*[•◦▪▫·‣⁃]\s*/gi, '<li>');
  
  // Remove bullets that appear after opening li tag and before any other content
  cleaned = cleaned.replace(/(<li[^>]*>)\s*[•◦▪▫·‣⁃]\s*([^<]+)/gi, '$1$2');
  
  // Remove standalone bullet characters followed by text within list items
  cleaned = cleaned.replace(/(<li[^>]*>[^<]*?)\s+[•◦▪▫·‣⁃]\s+/gi, '$1 ');
  
  // Remove bullets at the very beginning of text content in li
  cleaned = cleaned.replace(/(<li[^>]*>)\s*[•◦▪▫·‣⁃]([^<]+)/gi, '$1$2');
  
  return cleaned;
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Debug: Log original HTML if it contains lists
  if (process.env.NODE_ENV === 'development' && html.includes('<li>')) {
    console.log('HTML original com listas:', html.substring(0, 500));
  }
  
  // Remove manual bullets first
  let processedHtml = removeManualBullets(html);
  
  // Debug: Log processed HTML if it was changed
  if (process.env.NODE_ENV === 'development' && processedHtml !== html && html.includes('<li>')) {
    console.log('HTML após remoção de bullets:', processedHtml.substring(0, 500));
  }
  
  // Create a sanitized version
  const sanitized = DOMPurify.sanitize(processedHtml, purifyConfig);
  
  // Log potential security issues in development
  if (process.env.NODE_ENV === 'development' && sanitized !== html) {
    console.warn('Content was sanitized, potential security issue detected');
  }
  
  return sanitized;
};

/**
 * Sanitizes and validates embed codes (YouTube, Instagram, etc.)
 * @param embedCode - The embed code to sanitize
 * @returns Sanitized embed code or empty string if invalid
 */
export const sanitizeEmbedCode = (embedCode: string): string => {
  if (!embedCode) return '';
  
  // Allow specific trusted domains for embeds
  const allowedDomains = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'instagram.com',
    'twitter.com',
    'x.com',
    'facebook.com',
    'tiktok.com',
    'soundcloud.com',
    'open.spotify.com'
  ];
  
  // Check if embed contains allowed domains
  const hasAllowedDomain = allowedDomains.some(domain => 
    embedCode.includes(domain)
  );
  
  if (!hasAllowedDomain) {
    console.warn('Embed code contains untrusted domain');
    return '';
  }
  
  // Sanitize the embed code with proper iframe/embed support
  const embedConfig = {
    ...purifyConfig,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_TAGS: ['iframe', 'blockquote', 'script', 'div', 'p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: [
      'src', 'width', 'height', 'frameborder', 'allowfullscreen', 
      'allow', 'scrolling', 'title', 'style', 'class', 'id',
      'data-instgrm-permalink', 'data-instgrm-version', 'data-instgrm-captioned',
      'cite', 'data-src', 'loading', 'referrerpolicy'
    ],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur']
  };
  
  return DOMPurify.sanitize(embedCode, embedConfig);
};

/**
 * Validates and sanitizes user input
 * @param input - The input to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized input
 */
export const sanitizeUserInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  
  // Trim and limit length
  let sanitized = input.trim().substring(0, maxLength);
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Basic HTML encode for safety
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  return sanitized;
};

/**
 * Creates a safe component for rendering HTML content
 * @param content - The content to render
 * @param className - Optional CSS class
 * @returns JSX element with sanitized content
 */
export const SafeHtmlRenderer: React.FC<{ content: string; className?: string }> = ({ 
  content, 
  className = '' 
}) => {
  const sanitizedContent = sanitizeHtml(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};