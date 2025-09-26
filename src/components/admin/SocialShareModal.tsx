import { Button } from '@/components/ui/button';
import { Share2, X } from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onShare: () => void;
  newsTitle: string;
  newsId: string;
  newsImage?: string;
  mode?: 'published' | 'scheduled';
}

export const SocialShareModal = ({ isOpen, onClose, onCancel, onShare, newsTitle, mode = 'published' }: SocialShareModalProps) => {
  const handleShare = () => {
    onShare();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Compartilhar nas Redes Sociais</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            A notícia <strong>"{newsTitle}"</strong> foi {mode === 'scheduled' ? 'agendada' : 'publicada'} com sucesso!
          </p>
          <p className="text-sm text-muted-foreground">
            Deseja compartilhar esta notícia nas redes sociais?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onCancel ?? onClose}>
              <X className="w-4 h-4 mr-2" />
              Não, obrigado
            </Button>
            <Button onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

