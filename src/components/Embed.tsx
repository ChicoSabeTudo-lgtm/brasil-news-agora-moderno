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

// Instagram embed with native iframe
const InstagramEmbedWrapper = ({ id }: { id: string }) => {
  const postUrl = `https://www.instagram.com/p/${id}/`;

  // Parse Instagram URL to extract type and ID
  const parseInstagramUrl = (url: string) => {
    const regex = /instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/;
    const match = url.match(regex);
    if (match) {
      return { type: match[1], id: match[2] };
    }
    return null;
  };

  const parseResult = parseInstagramUrl(postUrl);

  if (!parseResult) {
    console.error('URL do Instagram inválida:', postUrl);
    return (
      <Card className="w-full max-w-lg mx-auto p-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">URL do Instagram inválida</p>
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

  const { type, id: parsedId } = parseResult;
  const embedUrl = `https://www.instagram.com/${type}/${parsedId}/embed/captioned/`;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
        <iframe
          src={embedUrl}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
          referrerPolicy="origin-when-cross-origin"
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            borderRadius: '8px'
          }}
          title="Instagram embed"
          onError={() => {
            console.error('Erro ao carregar iframe do Instagram:', embedUrl);
          }}
        />
      </div>
      <div className="mt-2 text-center">
        <Button variant="ghost" size="sm" asChild>
          <a href={postUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3 mr-1" />
            Ver no Instagram
          </a>
        </Button>
      </div>
    </div>
  );
};

// Main Embed component
export const Embed = ({ provider, id, className = '' }: EmbedProps) => {
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
          <InstagramEmbedWrapper id={id} />
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