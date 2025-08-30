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
      
      // Função para processar embeds com retry aprimorado
      const processEmbeds = (retryCount = 0) => {
        const maxRetries = 15;
        const baseDelay = 300;
        
        if (window.instgrm?.Embeds) {
          try {
            console.log('Processando Instagram embed, tentativa:', retryCount + 1);
            window.instgrm.Embeds.process();
            
            // Verificar se o embed foi processado corretamente
            setTimeout(() => {
              const iframes = containerRef.current?.querySelectorAll('iframe[src*="instagram.com"]');
              if (!iframes || iframes.length === 0) {
                console.warn('Instagram embed não carregou iframe, tentando novamente...');
                if (retryCount < maxRetries) {
                  processEmbeds(retryCount + 1);
                }
              } else {
                console.log('Instagram embed carregado com sucesso');
              }
            }, 1000);
            
          } catch (error) {
            console.warn('Instagram embed processing failed:', error);
            if (retryCount < maxRetries) {
              setTimeout(() => processEmbeds(retryCount + 1), baseDelay * (retryCount + 1));
            }
          }
        } else if (retryCount < maxRetries) {
          // Script não carregado ainda, tentar novamente
          console.log('Instagram script não disponível, tentativa:', retryCount + 1);
          setTimeout(() => processEmbeds(retryCount + 1), baseDelay + (retryCount * 200));
        } else {
          console.warn('Instagram script não carregou após múltiplas tentativas, carregando manualmente');
          // Fallback: carregar o script manualmente
          loadInstagramScript();
        }
      };
      
      // Função para carregar script do Instagram manualmente
      const loadInstagramScript = () => {
        // Verificar se o script já existe
        const existingScript = document.querySelector('script[src*="instagram.com/embed.js"]');
        if (existingScript) {
          console.log('Script do Instagram já existe, aguardando carregamento...');
          setTimeout(() => processEmbeds(0), 1000);
          return;
        }
        
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.instagram.com/embed.js';
        script.onload = () => {
          console.log('Script do Instagram carregado manualmente');
          setTimeout(() => {
            if (window.instgrm?.Embeds) {
              processEmbeds(0);
            }
          }, 500);
        };
        script.onerror = () => {
          console.error('Falha ao carregar script do Instagram');
        };
        document.head.appendChild(script);
      };
      
      // Iniciar processamento
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