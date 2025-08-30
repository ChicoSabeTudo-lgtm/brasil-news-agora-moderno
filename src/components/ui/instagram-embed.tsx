import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface InstagramEmbedProps {
  embedCode: string;
  className?: string;
}

export const InstagramEmbed = ({ embedCode, className }: InstagramEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && embedCode) {
      // Limpar conteúdo anterior
      containerRef.current.innerHTML = '';
      
      // Inserir o HTML bruto do embed
      containerRef.current.innerHTML = embedCode;
      
      // Função para processar embeds com retry
      const processEmbeds = (retryCount = 0) => {
        if (window.instgrm?.Embeds) {
          try {
            window.instgrm.Embeds.process();
          } catch (error) {
            console.warn('Instagram embed processing failed:', error);
            if (retryCount < 3) {
              setTimeout(() => processEmbeds(retryCount + 1), 1000);
            }
          }
        } else if (retryCount < 10) {
          // Retry até 10 vezes com intervalos crescentes
          setTimeout(() => processEmbeds(retryCount + 1), 500 + (retryCount * 500));
        } else {
          console.warn('Instagram script não carregou após múltiplas tentativas');
          // Fallback: carregar o script manualmente
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://www.instagram.com/embed.js';
          script.onload = () => {
            setTimeout(() => {
              if (window.instgrm?.Embeds) {
                window.instgrm.Embeds.process();
              }
            }, 100);
          };
          document.head.appendChild(script);
        }
      };
      
      processEmbeds();
    }
  }, [embedCode]);

  if (!embedCode) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "instagram-embed my-6 flex justify-center",
        className
      )}
    />
  );
};

// Declaração de tipo para o script do Instagram
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}