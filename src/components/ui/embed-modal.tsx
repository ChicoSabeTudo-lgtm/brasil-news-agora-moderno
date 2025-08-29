import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { sanitizeEmbedCode } from '@/utils/contentSanitizer';
import { useToast } from '@/hooks/use-toast';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (embedCode: string) => void;
}

export const EmbedModal = ({ isOpen, onClose, onInsert }: EmbedModalProps) => {
  const [embedCode, setEmbedCode] = useState('');
  const { toast } = useToast();

  const handleInsert = () => {
    if (!embedCode.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um código embed válido.",
        variant: "destructive"
      });
      return;
    }

    try {
      const sanitizedCode = sanitizeEmbedCode(embedCode.trim());
      if (!sanitizedCode) {
        toast({
          title: "Código inválido",
          description: "O código embed não é válido ou não é de uma fonte confiável.",
          variant: "destructive"
        });
        return;
      }

      onInsert(sanitizedCode);
      setEmbedCode('');
      onClose();
      
      toast({
        title: "Embed inserido",
        description: "O código embed foi inserido no conteúdo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar o código embed.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setEmbedCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inserir Embed</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="embed-code">
              Código Embed (YouTube, Instagram, Twitter, etc.)
            </Label>
            <Textarea
              id="embed-code"
              placeholder="Cole aqui o código embed..."
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Suporte para:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>YouTube (iframe embeds)</li>
              <li>Instagram (posts e stories)</li>
              <li>Twitter/X (embedded tweets)</li>
              <li>Outros iframes seguros</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleInsert}>
            Inserir Embed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};