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
      
      // Processar scripts do Instagram
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      } else {
        // Se o script do Instagram ainda não carregou, tentar novamente em 500ms
        setTimeout(() => {
          if (window.instgrm) {
            window.instgrm.Embeds.process();
          }
        }, 500);
      }
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