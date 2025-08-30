import { useEffect, useRef, useState, useCallback } from 'react';

interface EmbedDetectorOptions {
  maxCheckAttempts?: number;
  checkInterval?: number;
  timeout?: number;
}

interface EmbedDetectorResult {
  isEmbedFailed: boolean;
  isEmbedSuccess: boolean;
  isLoading: boolean;
}

export const useInstagramEmbedDetector = (
  options: EmbedDetectorOptions = {}
): [React.RefObject<HTMLDivElement>, EmbedDetectorResult, () => void] => {
  const {
    maxCheckAttempts = 10,
    checkInterval = 1000,
    timeout = 3000
  } = options;

  const embedRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkAttemptsRef = useRef(0);

  const [isEmbedFailed, setIsEmbedFailed] = useState(false);
  const [isEmbedSuccess, setIsEmbedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const startDetection = useCallback(() => {
    if (!embedRef.current) return;

    setIsLoading(true);
    setIsEmbedFailed(false);
    setIsEmbedSuccess(false);
    checkAttemptsRef.current = 0;

    // Timeout geral de 3 segundos
    timeoutRef.current = setTimeout(() => {
      setIsEmbedFailed(true);
      setIsLoading(false);
      stopDetection();
    }, timeout);

    intervalRef.current = setInterval(() => {
      if (!embedRef.current) return;

      checkAttemptsRef.current++;
      const container = embedRef.current;

      // Detectar elementos que indicam falha
      const watchOnInstagramElements = container.querySelectorAll(
        '[aria-label*="Watch on Instagram"], [title*="Watch on Instagram"], .instagram-media-caption'
      );
      
      const iframes = container.querySelectorAll('iframe');
      
      // Verificar texto que indica redirecionamento
      const hasWatchOnInstagramText = 
        container.textContent?.includes('Watch on Instagram') || 
        container.textContent?.includes('Ver no Instagram');

      // Verificar se há iframe com dimensões válidas
      let hasValidIframe = false;
      if (iframes.length > 0) {
        iframes.forEach(iframe => {
          const rect = iframe.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 200) {
            hasValidIframe = true;
          }
        });
      }

      // Determinar se embed foi bem-sucedido
      if (hasValidIframe && !hasWatchOnInstagramText && watchOnInstagramElements.length === 0) {
        setIsEmbedSuccess(true);
        setIsLoading(false);
        stopDetection();
        return;
      }

      // Determinar se embed falhou
      if (hasWatchOnInstagramText || watchOnInstagramElements.length > 0) {
        setIsEmbedFailed(true);
        setIsLoading(false);
        stopDetection();
        return;
      }

      // Se atingiu máximo de tentativas sem sucesso nem falha clara
      if (checkAttemptsRef.current >= maxCheckAttempts) {
        setIsEmbedFailed(true);
        setIsLoading(false);
        stopDetection();
      }
    }, checkInterval);
  }, [maxCheckAttempts, checkInterval, timeout, stopDetection]);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return [
    embedRef,
    { isEmbedFailed, isEmbedSuccess, isLoading },
    startDetection
  ];
};