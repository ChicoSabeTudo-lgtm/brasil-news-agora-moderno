import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { embedUrlSchema, extractEmbedData, generateEmbedMarker } from '@/utils/embedUtils';
import { Youtube, Twitter, Instagram, ExternalLink } from 'lucide-react';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (embedMarker: string) => void;
}

export const EmbedModal = ({ isOpen, onClose, onInsert }: EmbedModalProps) => {
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

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

      // Generate embed marker
      const marker = generateEmbedMarker(embedData.provider, embedData.id);
      
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

  const handleClose = () => {
    setUrl('');
    onClose();
  };

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
              type="url"
              placeholder="Cole aqui a URL (YouTube, Twitter/X ou Instagram)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isValidating}
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
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Instagram className="h-5 w-5 text-pink-500" />
                <div className="text-sm">
                  <div className="font-medium">Instagram</div>
                  <div className="text-muted-foreground">Posts, Reels e IGTV</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isValidating}>
            Cancelar
          </Button>
          <Button onClick={handleInsert} disabled={isValidating || !url.trim()}>
            {isValidating ? "Validando..." : "Inserir Embed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};