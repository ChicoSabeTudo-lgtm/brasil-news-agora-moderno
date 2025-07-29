import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, X } from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  newsTitle: string;
}

export const SocialShareModal = ({ isOpen, onClose, onShare, newsTitle }: SocialShareModalProps) => {
  const handleShare = () => {
    onShare();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar nas Redes Sociais
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            A notícia <strong>"{newsTitle}"</strong> foi publicada com sucesso!
          </p>
          <p className="text-sm text-muted-foreground">
            Deseja compartilhar esta notícia nas redes sociais agora?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Não, obrigado
            </Button>
            <Button onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Sim, compartilhar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};