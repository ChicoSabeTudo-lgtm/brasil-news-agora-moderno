import { useState, useCallback, useMemo } from 'react';

interface ValidationCache {
  [url: string]: {
    isValid: boolean;
    timestamp: number;
  };
}

interface UseEmbedValidatorResult {
  validateInstagramUrl: (url: string) => Promise<boolean>;
  isValidating: boolean;
  clearCache: () => void;
}

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

export const useEmbedValidator = (): UseEmbedValidatorResult => {
  const [isValidating, setIsValidating] = useState(false);
  
  // Cache em memória (em um app real, poderia usar localStorage)
  const cache = useMemo<ValidationCache>(() => ({}), []);

  const clearCache = useCallback(() => {
    Object.keys(cache).forEach(key => delete cache[key]);
  }, [cache]);

  const validateInstagramUrl = useCallback(async (url: string): Promise<boolean> => {
    // Verificar cache primeiro
    const cached = cache[url];
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.isValid;
    }

    setIsValidating(true);

    try {
      // Para Instagram, fazer validação básica da URL
      // Em um ambiente real, poderia usar oEmbed API ou outras verificações
      const instagramUrlPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+/;
      const isValidUrl = instagramUrlPattern.test(url);
      
      // Simular verificação de conectividade (opcional)
      if (isValidUrl) {
        try {
          // Tentar fazer uma requisição HEAD (limitada por CORS, mas pode dar pistas)
          await fetch(url, { 
            method: 'HEAD', 
            mode: 'no-cors',
            cache: 'no-cache'
          });
        } catch (error) {
          // Erro esperado devido a CORS, mas URL provavelmente válida
        }
      }

      // Salvar no cache
      cache[url] = {
        isValid: isValidUrl,
        timestamp: Date.now()
      };

      return isValidUrl;
    } catch (error) {
      console.warn('Erro ao validar URL do Instagram:', error);
      
      // Em caso de erro, fazer validação básica apenas
      const isValid = url.includes('instagram.com');
      cache[url] = {
        isValid,
        timestamp: Date.now()
      };
      
      return isValid;
    } finally {
      setIsValidating(false);
    }
  }, [cache]);

  return {
    validateInstagramUrl,
    isValidating,
    clearCache
  };
};