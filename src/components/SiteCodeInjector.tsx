import { useEffect } from 'react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export const SiteCodeInjector = () => {
  const { config } = useSiteConfig();

  useEffect(() => {
    // Inject header code
    if (config.header_code) {
      const existingHeaderScript = document.getElementById('site-header-code');
      if (existingHeaderScript) {
        existingHeaderScript.remove();
      }

      const headerDiv = document.createElement('div');
      headerDiv.id = 'site-header-code';
      headerDiv.innerHTML = config.header_code;
      document.head.appendChild(headerDiv);
    }

    // Inject footer code
    if (config.footer_code) {
      const existingFooterScript = document.getElementById('site-footer-code');
      if (existingFooterScript) {
        existingFooterScript.remove();
      }

      const footerDiv = document.createElement('div');
      footerDiv.id = 'site-footer-code';
      footerDiv.innerHTML = config.footer_code;
      document.body.appendChild(footerDiv);
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