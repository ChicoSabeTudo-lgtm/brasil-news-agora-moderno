import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEmbedValidator } from '@/hooks/useEmbedValidator';
import { embedUrlSchema, extractEmbedData, generateEmbedMarker } from '@/utils/embedUtils';
import { Youtube, Twitter, Instagram, ExternalLink, AlertTriangle } from 'lucide-react';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (embedMarker: string) => void;
}

export const EmbedModal = ({ isOpen, onClose, onInsert }: EmbedModalProps) => {
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showInstagramWarning, setShowInstagramWarning] = useState(false);
  const { toast } = useToast();
  const { validateInstagramUrl, isValidating: isValidatingUrl } = useEmbedValidator();

  const handleInsert = async () => {
    if (!url.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);

    try {
      // Validate URL format
      const validation = embedUrlSchema.safeParse(url.trim());
      if (!validation.success) {
        toast({
          title: "URL inválida",
          description: "A URL deve ser do YouTube, Twitter/X ou Instagram.",
          variant: "destructive"
        });
        return;
      }

      // Extract embed data
      const embedData = extractEmbedData(url.trim());
      if (!embedData) {
        toast({
          title: "Não foi possível processar",
          description: "Não foi possível extrair os dados da URL fornecida.",
          variant: "destructive"
        });
        return;
      }

      // Special validation for Instagram
      if (embedData.provider === 'instagram') {
        const isValidInstagram = await validateInstagramUrl(url.trim());
        if (!isValidInstagram) {
          toast({
            title: "URL do Instagram inválida",
            description: "A URL do Instagram não parece ser válida ou acessível.",
            variant: "destructive"
          });
          return;
        }
        
        // Show warning for Instagram embeds
        setShowInstagramWarning(true);
        return;
      }

      // Generate embed marker with type for Instagram
      const marker = embedData.type 
        ? generateEmbedMarker(embedData.provider, embedData.id, embedData.type)
        : generateEmbedMarker(embedData.provider, embedData.id);
      
      onInsert(marker);
      setUrl('');
      onClose();
      
      toast({
        title: "Embed inserido",
        description: `${embedData.provider === 'youtube' ? 'Vídeo do YouTube' : 
                     embedData.provider === 'twitter' ? 'Tweet' : 
                     'Post do Instagram'} inserido com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar a URL do embed.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleInstagramConfirm = () => {
    const embedData = extractEmbedData(url.trim());
    if (embedData) {
      const marker = embedData.type 
        ? generateEmbedMarker(embedData.provider, embedData.id, embedData.type)
        : generateEmbedMarker(embedData.provider, embedData.id);
      
      onInsert(marker);
      setUrl('');
      setShowInstagramWarning(false);
      onClose();
      
      toast({
        title: "Embed do Instagram inserido",
        description: "Lembre-se que alguns conteúdos podem redirecionar para o Instagram.",
      });
    }
  };

  const handleInstagramCancel = () => {
    setShowInstagramWarning(false);
    // Abrir diretamente no Instagram
    window.open(url.trim(), '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setUrl('');
    setShowInstagramWarning(false);
    onClose();
  };

  if (showInstagramWarning) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Aviso sobre Instagram
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <Instagram className="h-5 w-5 text-pink-500 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium text-foreground">
                  Conteúdo do Instagram detectado
                </p>
                <p className="text-muted-foreground">
                  Alguns vídeos/reels do Instagram podem não reproduzir diretamente no seu site e irão redirecionar para o Instagram. Isso é controlado pelas configurações de privacidade do autor.
                </p>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>O que você quer fazer?</strong></p>
              <ul className="mt-2 space-y-1 ml-4">
                <li>• <strong>Tentar Embed:</strong> Inserir o embed que pode funcionar ou mostrar um cartão com link</li>
                <li>• <strong>Abrir no Instagram:</strong> Abrir diretamente na plataforma</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleInstagramCancel}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir no Instagram
            </Button>
            <Button onClick={handleInstagramConfirm}>
              Tentar Embed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inserir Embed</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="embed-url">
              URL do Conteúdo
            </Label>
            <Input
              id="embed-url"
              type="text"
              placeholder="Cole URL ou código embed (YouTube, Twitter/X ou Instagram)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isValidating || isValidatingUrl}
            />
          </div>
          
          <div className="space-y-3">
            <p className="text-sm font-medium">Plataformas suportadas:</p>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Youtube className="h-5 w-5 text-red-500" />
                <div className="text-sm">
                  <div className="font-medium">YouTube</div>
                  <div className="text-muted-foreground">youtube.com, youtu.be</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Twitter className="h-5 w-5 text-blue-500" />
                <div className="text-sm">
                  <div className="font-medium">Twitter/X</div>
                  <div className="text-muted-foreground">twitter.com, x.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                <Instagram className="h-5 w-5 text-pink-500" />
                <div className="text-sm">
                  <div className="font-medium">Instagram</div>
                  <div className="text-muted-foreground">URLs ou código embed</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    ⚠️ Alguns conteúdos podem redirecionar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isValidating || isValidatingUrl}>
            Cancelar
          </Button>
          <Button onClick={handleInsert} disabled={isValidating || isValidatingUrl || !url.trim()}>
            {(isValidating || isValidatingUrl) ? "Validando..." : "Inserir Embed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};