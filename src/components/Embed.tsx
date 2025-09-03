import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstagramEmbedDetector } from '@/hooks/useInstagramEmbedDetector';
import { InstagramFallback } from '@/components/InstagramFallback';
import { EmbedErrorBoundary } from '@/components/EmbedErrorBoundary';

// Twitter agora usa iframe nativo para melhor compatibilidade

const InstagramEmbed = React.lazy(() => 
  import('react-social-media-embed').then(module => ({ 
    default: module.InstagramEmbed 
  }))
);

// Type declaration for Instagram embed script
declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process?: (element?: HTMLElement) => void;
      };
    };
  }
}

interface EmbedProps {
  provider: 'youtube' | 'twitter' | 'instagram';
  id: string;
  type?: string; // For Instagram: 'p', 'reel', 'tv'
  className?: string;
}

// Loading skeleton component
const EmbedSkeleton = () => (
  <Card className="w-full max-w-lg mx-auto animate-pulse">
    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
      <Play className="h-12 w-12 text-muted-foreground" />
    </div>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-3 bg-muted rounded w-1/2"></div>
    </div>
  </Card>
);

// YouTube embed component
const YouTubeEmbed = ({ id }: { id: string }) => (
  <div className="relative w-full max-w-2xl mx-auto">
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="YouTube video player"
        frameBorder="0"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  </div>
);

// Twitter embed with native iframe (more reliable)
const TwitterEmbedWrapper = ({ id }: { id: string }) => {
  const [loadError, setLoadError] = useState(false);
  const tweetUrl = `https://twitter.com/i/status/${id}`;
  const embedUrl = `https://platform.twitter.com/embed/Tweet.html?id=${id}`;

  if (loadError) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">Não foi possível carregar o tweet</p>
          <Button variant="outline" asChild>
            <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver no Twitter/X
            </a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-background border rounded-lg">
        <iframe
          src={embedUrl}
          width="100%"
          height="500"
          frameBorder="0"
          onError={() => setLoadError(true)}
          className="w-full"
          title={`Tweet ${id}`}
        />
      </div>
    </div>
  );
};

// Instagram embed with intelligent detection and elegant fallback
const InstagramEmbedWrapper = ({ id, type = 'p' }: { id: string; type?: string }) => {
  const [embedRef, { isEmbedFailed, isEmbedSuccess, isLoading }, startDetection] = useInstagramEmbedDetector({
    timeout: 3000,
    maxCheckAttempts: 10,
    checkInterval: 500
  });

  const postUrl = `https://www.instagram.com/${type}/${id}/`;

  // Validate Instagram data
  if (!id || !type.match(/^(p|reel|tv)$/)) {
    return (
      <InstagramFallback 
        embedUrl={postUrl}
        reason="blocked"
        className="w-full max-w-lg mx-auto"
      />
    );
  }

  // Start detection after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      startDetection();
    }, 100);

    return () => clearTimeout(timer);
  }, [startDetection]);

  // Process Instagram embeds when component loads
  useEffect(() => {
    if (window.instgrm?.Embeds?.process) {
      try {
        window.instgrm.Embeds.process(embedRef.current);
      } catch (error) {
        console.error('Erro ao processar embed do Instagram:', error);
      }
    }
  }, []);

  // Show intelligent fallback if embed failed
  if (isEmbedFailed) {
    return (
      <InstagramFallback 
        embedUrl={postUrl}
        reason="privacy"
        className="w-full max-w-lg mx-auto"
      />
    );
  }

  return (
    <div ref={embedRef} className="w-full max-w-lg mx-auto">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <Suspense fallback={<EmbedSkeleton />}>
        <InstagramEmbed
          url={postUrl}
          width="100%"
          captioned
        />
      </Suspense>
    </div>
  );
};

// Main Embed component
export const Embed = ({ provider, id, type, className = '' }: EmbedProps) => {
  if (!id || !provider) {
    return (
      <Card className={`w-full max-w-lg mx-auto p-6 text-center ${className}`}>
        <p className="text-destructive">Embed inválido: dados faltando</p>
      </Card>
    );
  }

  const containerClasses = `my-6 ${className}`;

  switch (provider) {
    case 'youtube':
      return (
        <div className={containerClasses}>
          <YouTubeEmbed id={id} />
        </div>
      );
    
    case 'twitter':
      return (
        <div className={containerClasses}>
          <EmbedErrorBoundary 
            fallbackUrl={`https://twitter.com/i/status/${id}`}
            fallbackText="Não foi possível carregar o tweet"
          >
            <TwitterEmbedWrapper id={id} />
          </EmbedErrorBoundary>
        </div>
      );
    
    case 'instagram':
      return (
        <div className={containerClasses}>
          <InstagramEmbedWrapper id={id} type={type} />
        </div>
      );
    
    default:
      return (
        <Card className={`w-full max-w-lg mx-auto p-6 text-center ${className}`}>
          <p className="text-destructive">Tipo de embed não suportado: {provider}</p>
        </Card>
      );
  }
};

export default Embed;