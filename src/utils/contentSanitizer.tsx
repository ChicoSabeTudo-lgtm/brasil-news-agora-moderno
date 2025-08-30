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

  // Para embeds do Twitter, remover o script e manter apenas o blockquote
  if (embedCode.includes('twitter-tweet') || embedCode.includes('twitter.com') || embedCode.includes('x.com')) {
    console.log('Detectado embed do Twitter:', embedCode);
    
    // Remove o script do Twitter pois já está carregado globalmente
    let twitterEmbed = embedCode.replace(/<script[^>]*src=[^>]*twitter\.com\/widgets\.js[^>]*><\/script>/gi, '');
    twitterEmbed = twitterEmbed.replace(/<script[^>]*src=[^>]*platform\.twitter\.com\/widgets\.js[^>]*><\/script>/gi, '');
    
    console.log('Twitter embed após remoção do script:', twitterEmbed);
    
    // Configuração específica para Twitter com TODOS os atributos necessários
    const twitterConfig = {
      ALLOWED_TAGS: ['blockquote', 'div', 'p', 'br', 'strong', 'em', 'a', 'span'],
      ALLOWED_ATTR: [
        'class', 'data-media-max-width', 'data-theme', 'data-cards', 'data-conversation',
        'data-tweet-id', 'data-src', 'data-lang', 'data-width', 'data-height',
        'href', 'lang', 'dir', 'cite', 'rel', 'target', 'title',
        'ref_src', 'twsrc', 'data-*'
      ],
      ALLOW_DATA_ATTR: true,
      FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur']
    };
    
    const sanitized = DOMPurify.sanitize(twitterEmbed.trim(), twitterConfig);
    console.log('Twitter embed sanitizado:', sanitized);
    
    return sanitized;
  }
  
  // Sanitize the embed code with proper iframe/embed support (para outros embeds)
  const embedConfig = {
    ...purifyConfig,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_TAGS: ['iframe', 'blockquote', 'div', 'p', 'br', 'strong', 'em', 'a'],
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
 * Extract Twitter tweet ID from URL or embed code
 * @param content - Twitter embed code or URL
 * @returns Tweet ID if found, null otherwise
 */
export const extractTwitterId = (content: string): string | null => {
  // Extract from tweet URL
  const urlMatch = content.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  if (urlMatch) return urlMatch[1];

  // Extract from data-tweet-id attribute
  const dataMatch = content.match(/data-tweet-id="(\d+)"/);
  if (dataMatch) return dataMatch[1];

  return null;
};

/**
 * Initialize Twitter widgets for a specific container (useful for modals)
 * @param container - DOM element to process, or null for global processing
 * @param retryCount - Number of retries attempted
 */
export const initializeTwitterWidgets = (container: HTMLElement | null = null, retryCount = 0): void => {
  if (typeof window === 'undefined') return;

  // Check if Twitter script is loaded
  if (!(window as any).twttr?.widgets) {
    if (retryCount < 5) {
      setTimeout(() => initializeTwitterWidgets(container, retryCount + 1), 500 * (retryCount + 1));
    }
    return;
  }

  try {
    // Use only widgets.load() to avoid duplication
    if (container) {
      (window as any).twttr.widgets.load(container).then(() => {
        // Force height corrections after widget loads
        forceTwitterHeightFix(container);
      });
    } else {
      (window as any).twttr.widgets.load().then(() => {
        // Force height corrections globally
        forceTwitterHeightFix(document.body);
      });
    }
  } catch (error) {
    console.error('Error processing Twitter widgets:', error);
    if (retryCount < 3) {
      setTimeout(() => initializeTwitterWidgets(container, retryCount + 1), 1000);
    }
  }
};

/**
 * Force height fix for Twitter iframes
 * @param container - Container to search for Twitter embeds
 */
const forceTwitterHeightFix = (container: HTMLElement): void => {
  // Wait a bit for iframe to be fully rendered
  setTimeout(() => {
    const twitterIframes = container.querySelectorAll('iframe[id^="twitter-widget"]');
    
    twitterIframes.forEach((iframe) => {
      const htmlIframe = iframe as HTMLIFrameElement;
      
      // Remove height restrictions
      htmlIframe.style.height = 'auto';
      htmlIframe.style.maxHeight = 'none';
      htmlIframe.style.minHeight = 'auto';
      
      // Try to access iframe content if same-origin
      try {
        if (htmlIframe.contentDocument) {
          const body = htmlIframe.contentDocument.body;
          if (body) {
            body.style.height = 'auto';
            body.style.maxHeight = 'none';
            body.style.overflow = 'visible';
          }
        }
      } catch (e) {
        // Cross-origin iframe, can't access content
        console.log('Cannot access iframe content (cross-origin)');
      }
    });

    // Also fix blockquote containers
    const twitterBlocks = container.querySelectorAll('.twitter-tweet');
    twitterBlocks.forEach((block) => {
      const htmlBlock = block as HTMLElement;
      htmlBlock.style.height = 'auto';
      htmlBlock.style.maxHeight = 'none';
      htmlBlock.style.minHeight = 'auto';
      htmlBlock.style.overflow = 'visible';
    });
  }, 500);
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
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && sanitizedContent.includes('twitter-tweet')) {
      // Initialize Twitter widgets for this specific container
      const timer = setTimeout(() => {
        initializeTwitterWidgets(containerRef.current);
      }, 100);

      // Set up mutation observer to watch for iframe changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const addedNodes = Array.from(mutation.addedNodes);
            addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                if (element.tagName === 'IFRAME' && element.id?.startsWith('twitter-widget')) {
                  // Force height fix on new iframe
                  setTimeout(() => {
                    element.style.height = 'auto';
                    element.style.maxHeight = 'none';
                    element.style.minHeight = 'auto';
                  }, 100);
                }
              }
            });
          }
        });
      });

      if (containerRef.current) {
        observer.observe(containerRef.current, { 
          childList: true, 
          subtree: true 
        });
      }

      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }
  }, [sanitizedContent]);

  return (
    <div 
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};