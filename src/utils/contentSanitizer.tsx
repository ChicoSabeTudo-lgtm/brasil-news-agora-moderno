import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { Embed } from '@/components/Embed';
import { parseEmbedMarkers } from '@/utils/embedUtils';

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
    'text-align', 'font-size', 'font-weight', 'font-style', 'text-decoration',
    'data-instgrm-captioned', 'data-instgrm-permalink', 'data-instgrm-version',
    'sandbox', 'referrerpolicy'
  ],
  ADD_TAGS: ['blockquote', 'iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'data-instgrm-captioned', 'data-instgrm-permalink', 'data-instgrm-version', 'sandbox', 'referrerpolicy'],
  ALLOW_DATA_ATTR: true,
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
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

  // Lista de glifos de marcadores comuns (inclui &bull; e símbolo de grau)
  const bullets = '•◦▪▫·‣⁃●○◘◙°';
  const bulletClass = `[${bullets}]`;

  // 1) <li> com glifo logo no início (com ou sem espaços)
  cleaned = cleaned.replace(new RegExp(`<li[^>]*>\\s*${bulletClass}\\s*`, 'gi'), '<li>');

  // 2) <li> com glifo após tags inline (p/span/strong/em/b/i/u)
  //    Ex.: <li><span>•</span> Texto
  cleaned = cleaned.replace(
    new RegExp(`(<li[^>]*>)(?:\\s*<(?:p|span|strong|em|b|i|u)[^>]*>\\s*)*${bulletClass}\\s*`, 'gi'),
    '$1'
  );

  // 3) Remover entidades HTML de bullet (&bull;, &middot;, &deg;) no início do <li>
  cleaned = cleaned.replace(/(<li[^>]*>)\s*(?:&bull;|&middot;|&deg;|&#8226;|&#183;|&#176;)\s*/gi, '$1');
  
  // 3.1) Remover indicador ordinal usado como marcador no início (º, ª)
  cleaned = cleaned.replace(/(<li[^>]*>)\s*[ºª]\s*/gi, '$1');

  // 4) Casos em que o glifo aparece como primeiro caractere de texto dentro do <li>
  cleaned = cleaned.replace(new RegExp(`(<li[^>]*>)(?:\\s|&nbsp;)*${bulletClass}\\s*`, 'gi'), '$1');

  // 5) Casos raros: glifo precedido de <br> no início do item
  cleaned = cleaned.replace(new RegExp(`(<li[^>]*>)(?:\\s*<br\\s*\\/?>\\s*)*${bulletClass}\\s*`, 'gi'), '$1');

  // 6) Se por algum motivo um glifo ainda sobrar no começo de um nó de texto após tags inline
  cleaned = cleaned.replace(
    new RegExp(`(<li[^>]*>(?:\\s*<(?:p|span|strong|em|b|i|u)[^>]*>)*)(?:\\s|&nbsp;)*${bulletClass}\\s*`, 'gi'),
    '$1'
  );

  // 7) <li><p>° ...</p></li> e variantes com entidades
  cleaned = cleaned.replace(new RegExp(`(<li[^>]*>\\s*<p[^>]*>)\\s*${bulletClass}\\s*`, 'gi'), '$1');
  cleaned = cleaned.replace(/(<li[^>]*>\s*<p[^>]*>)\s*(?:&deg;|&bull;|&middot;|&#8226;|&#183;|&#176;)\s*/gi, '$1');
  // 7.1) Versão com indicador ordinal dentro do <p>
  cleaned = cleaned.replace(/(<li[^>]*>\s*<p[^>]*>)\s*[ºª]\s*/gi, '$1');

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
  const processedHtml = removeManualBullets(html);
  
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
  
  // Para embeds do Instagram, preservar estrutura completa
  if (embedCode.includes('instagram.com') || embedCode.includes('data-instgrm-permalink')) {
    console.log('Detectado embed do Instagram:', embedCode);
    
    // Remove o script do Instagram pois será carregado globalmente
    const instagramEmbed = embedCode.replace(/<script[^>]*src=[^>]*instagram\.com\/embed\.js[^>]*><\/script>/gi, '');
    
    // Configuração específica para Instagram preservando todos os estilos e atributos necessários
    const instagramConfig = {
      ALLOWED_TAGS: ['blockquote', 'div', 'p', 'a', 'svg', 'g', 'path'],
      ALLOWED_ATTR: [
        'class', 'data-instgrm-permalink', 'data-instgrm-version', 'data-instgrm-captioned',
        'style', 'href', 'target', 'rel', 'viewBox', 'version', 'xmlns', 'stroke',
        'stroke-width', 'fill', 'fill-rule', 'transform', 'd'
      ],
      ALLOW_DATA_ATTR: true,
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur']
    };
    
    const sanitized = DOMPurify.sanitize(instagramEmbed.trim(), instagramConfig);
    console.log('Instagram embed sanitizado:', sanitized);
    
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
    if (retryCount < 3) {
      setTimeout(() => initializeTwitterWidgets(container, retryCount + 1), 1000);
    }
    return;
  }

  try {
    // Simple widget loading without aggressive fixes
    if (container) {
      (window as any).twttr.widgets.load(container);
    } else {
      (window as any).twttr.widgets.load();
    }
  } catch (error) {
    console.error('Error processing Twitter widgets:', error);
  }
};

/**
 * Initialize Instagram embeds for a specific container
 * @param container - DOM element to process, or null for global processing
 * @param retryCount - Number of retries attempted
 */
export const initializeInstagramEmbeds = (container: HTMLElement | null = null, retryCount = 0): void => {
  if (typeof window === 'undefined') return;

  // Check if Instagram script is loaded
  if (!(window as any).instgrm?.Embeds) {
    if (retryCount < 3) {
      setTimeout(() => initializeInstagramEmbeds(container, retryCount + 1), 1000);
    }
    return;
  }

  try {
    // Process Instagram embeds
    if (container) {
      (window as any).instgrm.Embeds.process(container);
    } else {
      (window as any).instgrm.Embeds.process();
    }
  } catch (error) {
    console.error('Error processing Instagram embeds:', error);
  }
};

/**
 * Simple height fix for Twitter iframes - remove only specific limitations
 * @param container - Container to search for Twitter embeds
 */
const forceTwitterHeightFix = (container: HTMLElement): void => {
  setTimeout(() => {
    // Only fix Twitter iframes if they have height limitations
    const twitterIframes = container.querySelectorAll('iframe[id^="twitter-widget"]');
    
    twitterIframes.forEach((iframe) => {
      const htmlIframe = iframe as HTMLIFrameElement;
      const computedStyle = window.getComputedStyle(htmlIframe);
      
      // Only remove height if it's explicitly limited
      if (computedStyle.maxHeight && computedStyle.maxHeight !== 'none') {
        htmlIframe.style.maxHeight = 'none';
      }
    });
  }, 100);
};

// Process HTML and replace embed markers with React components
const processHtmlWithEmbeds = (html: string) => {
  const markers = parseEmbedMarkers(html);
  
  if (markers.length === 0) {
    // No embed markers, return sanitized HTML as before
    return {
      processedHtml: sanitizeHtml(html),
      embeds: []
    };
  }

  // Split HTML by embed markers and create React elements
  const parts: (string | { type: 'embed'; provider: string; id: string; embedType?: string; key: string })[] = [];
  let lastIndex = 0;

  markers.forEach((marker, index) => {
    // Add HTML content before this marker
    if (marker.index > lastIndex) {
      const beforeContent = html.slice(lastIndex, marker.index);
      if (beforeContent.trim()) {
        parts.push(sanitizeHtml(beforeContent));
      }
    }

    // Add embed component
    parts.push({
      type: 'embed',
      provider: marker.provider,
      id: marker.id,
      embedType: marker.type,
      key: `embed-${index}`
    });

    lastIndex = marker.index + marker.marker.length;
  });

  // Add remaining HTML content
  if (lastIndex < html.length) {
    const remainingContent = html.slice(lastIndex);
    if (remainingContent.trim()) {
      parts.push(sanitizeHtml(remainingContent));
    }
  }

  return { parts };
};

interface SafeHtmlRendererProps {
  html?: string;
  content?: string; // Legacy prop support
  className?: string;
}

/**
 * Creates a safe component for rendering HTML content with embed support
 * @param html - The HTML content to render (new prop)
 * @param content - The content to render (legacy prop for compatibility)
 * @param className - Optional CSS class
 * @returns JSX element with sanitized content and embedded components
 */
export const SafeHtmlRenderer: React.FC<SafeHtmlRendererProps> = ({ 
  html,
  content, 
  className = '' 
}) => {
  // Support both new 'html' prop and legacy 'content' prop
  const htmlContent = html || content || '';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Only initialize social media widgets for remaining HTML content (not embeds)
    const htmlElements = container.querySelectorAll('[data-html-content="true"]');
    htmlElements.forEach((element) => {
      initializeTwitterWidgets(element as HTMLElement);
      initializeInstagramEmbeds(element as HTMLElement);
    });

    // Set up a MutationObserver to handle dynamically added content
    const observer = new MutationObserver(() => {
      const newHtmlElements = container.querySelectorAll('[data-html-content="true"]');
      newHtmlElements.forEach((element) => {
        initializeTwitterWidgets(element as HTMLElement);
        initializeInstagramEmbeds(element as HTMLElement);
      });
    });

    observer.observe(container, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [htmlContent]);

  const { parts } = processHtmlWithEmbeds(htmlContent);

  return (
    <div ref={containerRef} className={className}>
      {parts ? (
        parts.map((part, index) => {
          if (typeof part === 'string') {
            // Render HTML content
            return (
              <div
                key={`html-${index}`}
                data-html-content="true"
                dangerouslySetInnerHTML={{ __html: part }}
              />
            );
          } else if (part.type === 'embed') {
            // Render embed component
            return (
              <Embed
                key={part.key}
                provider={part.provider as 'youtube' | 'twitter' | 'instagram'}
                id={part.id}
                type={part.embedType}
              />
            );
          }
          return null;
        })
      ) : (
        // Fallback for content without embeds
        <div
          data-html-content="true"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }}
        />
      )}
    </div>
  );
};
