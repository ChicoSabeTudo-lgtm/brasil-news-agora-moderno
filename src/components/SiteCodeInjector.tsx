import { useEffect } from 'react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import DOMPurify from 'dompurify';
import { securityLogger, SecurityEventType } from '@/utils/securityLogger';

// Whitelist de domínios confiáveis para scripts externos
const TRUSTED_SCRIPT_DOMAINS = [
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'facebook.net',
  'connect.facebook.net',
  'platform.twitter.com',
  'instagram.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cloudflare.com',
  'chicosabetudo.sigametech.com.br'
];

/**
 * Valida se uma URL de script é de um domínio confiável
 */
const isScriptUrlTrusted = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return TRUSTED_SCRIPT_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

/**
 * Sanitiza código customizado permitindo apenas scripts externos confiáveis
 */
const sanitizeCustomCode = (code: string): string => {
  if (!code) return '';

  // Configuração restritiva de DOMPurify
  const config = {
    ALLOWED_TAGS: ['script', 'noscript', 'meta', 'link', 'style'],
    ALLOWED_ATTR: ['src', 'async', 'defer', 'type', 'rel', 'href', 'name', 'content', 'property', 'crossorigin', 'integrity'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: false,
    FORBID_TAGS: ['iframe', 'object', 'embed', 'applet', 'form']
  };

  let sanitized = DOMPurify.sanitize(code, config);

  // Validação adicional: remover scripts inline (apenas src externos)
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitized;
  
  const scripts = tempDiv.querySelectorAll('script');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    
    // Se não tem src ou src não é confiável, remover
    if (!src || !isScriptUrlTrusted(src)) {
      console.warn('[SECURITY] Script bloqueado:', src || 'inline script');
      securityLogger.log(
        SecurityEventType.SCRIPT_BLOCKED,
        { scriptSrc: src || 'inline', reason: !src ? 'inline script' : 'untrusted domain' }
      );
      script.remove();
    }
  });

  return tempDiv.innerHTML;
};

export const SiteCodeInjector = () => {
  const { config } = useSiteConfig();

  useEffect(() => {
    // Inject header code (sanitizado)
    if (config.header_code) {
      const existingHeaderScript = document.getElementById('site-header-code');
      if (existingHeaderScript) {
        existingHeaderScript.remove();
      }

      const sanitizedHeaderCode = sanitizeCustomCode(config.header_code);
      
      if (sanitizedHeaderCode.trim()) {
        const headerDiv = document.createElement('div');
        headerDiv.id = 'site-header-code';
        headerDiv.innerHTML = sanitizedHeaderCode;
        document.head.appendChild(headerDiv);
        
        console.log('[SECURITY] Header code injected (sanitized)');
      }
    }

    // Inject footer code (sanitizado)
    if (config.footer_code) {
      const existingFooterScript = document.getElementById('site-footer-code');
      if (existingFooterScript) {
        existingFooterScript.remove();
      }

      const sanitizedFooterCode = sanitizeCustomCode(config.footer_code);
      
      if (sanitizedFooterCode.trim()) {
        const footerDiv = document.createElement('div');
        footerDiv.id = 'site-footer-code';
        footerDiv.innerHTML = sanitizedFooterCode;
        document.body.appendChild(footerDiv);
        
        console.log('[SECURITY] Footer code injected (sanitized)');
      }
    }

    // Cleanup function
    return () => {
      const headerScript = document.getElementById('site-header-code');
      const footerScript = document.getElementById('site-footer-code');
      
      if (headerScript) headerScript.remove();
      if (footerScript) footerScript.remove();
    };
  }, [config.header_code, config.footer_code]);

  return null;
};