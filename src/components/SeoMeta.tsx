import { useEffect } from 'react';

interface SeoMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

export const SeoMeta = ({ 
  title, 
  description, 
  keywords, 
  canonical, 
  ogImage, 
  ogType = 'website',
  noindex = false 
}: SeoMetaProps) => {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Remove existing SEO meta tags
    const existingSeoTags = document.querySelectorAll('meta[data-seo-meta]');
    existingSeoTags.forEach(tag => tag.remove());

    // Remove existing canonical
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) existingCanonical.remove();

    // Add new meta tags
    const metaTags = [];

    if (description) {
      metaTags.push({ name: 'description', content: description });
      metaTags.push({ property: 'og:description', content: description });
      metaTags.push({ name: 'twitter:description', content: description });
    }

    if (keywords) {
      metaTags.push({ name: 'keywords', content: keywords });
    }

    if (title) {
      metaTags.push({ property: 'og:title', content: title });
      metaTags.push({ name: 'twitter:title', content: title });
    }

    if (ogImage) {
      metaTags.push({ property: 'og:image', content: ogImage });
      metaTags.push({ name: 'twitter:image', content: ogImage });
      metaTags.push({ name: 'twitter:card', content: 'summary_large_image' });
    }

    metaTags.push({ property: 'og:type', content: ogType });
    metaTags.push({ property: 'og:url', content: window.location.href });
    metaTags.push({ name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' });

    // Create and append meta tags
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('data-seo-meta', 'true');
      
      if (tag.name) {
        meta.name = tag.name;
      }
      if (tag.property) {
        meta.setAttribute('property', tag.property);
      }
      meta.content = tag.content;
      
      document.head.appendChild(meta);
    });

    // Add canonical link
    if (canonical) {
      const canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = canonical;
      document.head.appendChild(canonicalLink);
    }

    // Cleanup function
    return () => {
      const seoTags = document.querySelectorAll('meta[data-seo-meta]');
      seoTags.forEach(tag => tag.remove());
      
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) canonicalLink.remove();
    };
  }, [title, description, keywords, canonical, ogImage, ogType, noindex]);

  return null;
};