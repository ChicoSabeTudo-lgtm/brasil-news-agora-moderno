import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamic imports for social media embeds (SSR: false)
const TwitterEmbed = React.lazy(() => 
  import('react-social-media-embed').then(module => ({ 
    default: module.TwitterEmbed 
  }))
);

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

// Twitter embed with fallback
const TwitterEmbedWrapper = ({ id }: { id: string }) => {
  const [loadError, setLoadError] = useState(false);
  const tweetUrl = `https://twitter.com/i/status/${id}`;

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
    <Suspense fallback={<EmbedSkeleton />}>
      <div className="w-full max-w-lg mx-auto">
        <TwitterEmbed
          url={tweetUrl}
          width={550}
          onLoad={() => setLoadError(false)}
          onError={() => setLoadError(true)}
        />
      </div>
    </Suspense>
  );
};

// Instagram embed with official implementation and fallback
const InstagramEmbedWrapper = ({ id, type = 'p' }: { id: string; type?: string }) => {
  const [loadError, setLoadError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const postUrl = `https://www.instagram.com/${type}/${id}/`;

  // Validate Instagram data
  if (!id || !type.match(/^(p|reel|tv)$/)) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">Dados do Instagram inválidos</p>
          <Button variant="outline" asChild>
            <a href={postUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver no Instagram
            </a>
          </Button>
        </div>
      </Card>
    );
  }

  // Initialize Instagram embed with timeout fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (embedRef.current && !embedRef.current.querySelector('iframe')) {
        setShowFallback(true);
      }
    }, 3000);

    // Try to process Instagram embeds
    if (window.instgrm?.Embeds?.process) {
      try {
        window.instgrm.Embeds.process(embedRef.current);
      } catch (error) {
        console.error('Erro ao processar embed do Instagram:', error);
        setLoadError(true);
      }
    }

    return () => clearTimeout(timer);
  }, []);

  // Show fallback card if loading failed or timeout
  if (loadError || showFallback) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Não foi possível carregar o conteúdo do Instagram
          </p>
          <p className="text-xs text-muted-foreground">
            Alguns vídeos/reels podem forçar abrir no Instagram por políticas da plataforma
          </p>
          <Button variant="outline" asChild>
            <a href={postUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Assistir no Instagram
            </a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Suspense fallback={<EmbedSkeleton />}>
      <div className="w-full max-w-lg mx-auto" ref={embedRef}>
        <InstagramEmbed
          url={postUrl}
          width="100%"
          captioned
          onLoad={() => {
            setLoadError(false);
            // Call Instagram embed processing after load
            if (window.instgrm?.Embeds?.process) {
              window.instgrm.Embeds.process(embedRef.current);
            }
          }}
          onError={() => setLoadError(true)}
        />
      </div>
    </Suspense>
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
          <TwitterEmbedWrapper id={id} />
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