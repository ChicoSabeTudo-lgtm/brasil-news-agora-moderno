import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { useEmbedValidator } from '../hooks/useEmbedValidator';
import { useInstagramEmbedDetector } from '../hooks/useInstagramEmbedDetector';
import { InstagramFallback } from './InstagramFallback';
import { extractEmbedData } from '../utils/embedUtils';

interface IntelligentEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl: string;
  embedCode?: string;
}

export const IntelligentEmbedModal = ({ 
  isOpen, 
  onClose, 
  embedUrl, 
  embedCode 
}: IntelligentEmbedModalProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [showInstagramWarning, setShowInstagramWarning] = useState(false);
  const [embedData, setEmbedData] = useState<any>(null);
  
  const { validateInstagramUrl } = useEmbedValidator();
  const [embedRef, { isEmbedFailed, isEmbedSuccess, isLoading }, startDetection] = useInstagramEmbedDetector();
  
  const isInstagram = embedUrl.includes('instagram.com');
  const isYoutube = embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be');
  const isTwitter = embedUrl.includes('twitter.com') || embedUrl.includes('x.com');

  useEffect(() => {
    if (!isOpen || !embedUrl) return;

    const processEmbed = async () => {
      const data = extractEmbedData(embedUrl);
      setEmbedData(data);

      if (isInstagram) {
        setIsValidating(true);
        try {
          const isValid = await validateInstagramUrl(embedUrl);
          if (!isValid) {
            setShowInstagramWarning(true);
          }
        } catch (error) {
          console.warn('Erro na validação do Instagram:', error);
        } finally {
          setIsValidating(false);
        }
      }
    };

    processEmbed();
  }, [isOpen, embedUrl, isInstagram, validateInstagramUrl]);

  useEffect(() => {
    if (isInstagram && embedRef.current && !showInstagramWarning) {
      const timer = setTimeout(() => {
        startDetection();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInstagram, showInstagramWarning, startDetection]);

  const handleInstagramConfirm = () => {
    setShowInstagramWarning(false);
  };

  const handleInstagramCancel = () => {
    window.open(embedUrl, '_blank');
    onClose();
  };

  const getEmbedTitle = () => {
    if (isInstagram) return 'Post do Instagram';
    if (isYoutube) return 'Vídeo do YouTube';
    if (isTwitter) return 'Post do Twitter/X';
    return 'Conteúdo Incorporado';
  };

  const renderYouTubeEmbed = () => {
    if (!embedData?.id) return null;
    
    return (
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${embedData.id}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        />
      </div>
    );
  };

  const renderTwitterEmbed = () => {
    if (!embedData?.id) return null;
    
    return (
      <div className="w-full max-w-md mx-auto">
        <iframe
          src={`https://platform.twitter.com/embed/Tweet.html?id=${embedData.id}`}
          width="100%"
          height="500"
          frameBorder="0"
          className="rounded-lg"
        />
      </div>
    );
  };

  const renderInstagramEmbed = () => {
    if (embedCode) {
      return (
        <div 
          ref={embedRef}
          className="w-full max-w-md mx-auto"
          dangerouslySetInnerHTML={{ __html: embedCode }}
        />
      );
    }

    return (
      <div ref={embedRef} className="w-full max-w-md mx-auto">
        <blockquote 
          className="instagram-media" 
          data-instgrm-permalink={embedUrl}
          data-instgrm-version="14"
        />
      </div>
    );
  };

  if (showInstagramWarning) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Aviso - Conteúdo do Instagram
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O conteúdo do Instagram pode não ser exibido corretamente devido às configurações de privacidade. 
              Você pode tentar visualizar aqui ou abrir diretamente no Instagram.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleInstagramCancel} className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver no Instagram
              </Button>
              <Button onClick={handleInstagramConfirm} className="flex-1">
                Tentar Aqui
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getEmbedTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isValidating && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Validando conteúdo...</span>
            </div>
          )}

          {!isValidating && (
            <>
              {isYoutube && renderYouTubeEmbed()}
              {isTwitter && renderTwitterEmbed()}
              {isInstagram && (
                <>
                  {isLoading && (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Carregando post do Instagram...</span>
                    </div>
                  )}
                  
                  {!isLoading && !isEmbedFailed && !isEmbedSuccess && renderInstagramEmbed()}
                  
                  {isEmbedSuccess && (
                    <div className="space-y-2">
                      {renderInstagramEmbed()}
                      <p className="text-sm text-muted-foreground text-center">
                        ✅ Post carregado com sucesso!
                      </p>
                    </div>
                  )}
                  
                  {isEmbedFailed && (
                    <InstagramFallback 
                      embedUrl={embedUrl} 
                      reason="privacy" 
                    />
                  )}
                </>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={() => window.open(embedUrl, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Original
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};