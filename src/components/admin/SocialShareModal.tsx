import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, X, Clock } from 'lucide-react';
import { SocialScheduler } from './SocialScheduler';

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

export const SocialShareModal = ({ isOpen, onClose, onCancel, onShare, newsTitle, newsId, newsImage, mode = 'published' }: SocialShareModalProps) => {
  const handleShare = () => {
    onShare();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Compartilhar nas Redes Sociais</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="immediate" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="immediate" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Compartilhar Agora
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Agendar Compartilhamento
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="immediate" className="space-y-4">
            <p className="text-muted-foreground">
              A notícia <strong>"{newsTitle}"</strong> foi {mode === 'scheduled' ? 'agendada' : 'publicada'} com sucesso!
            </p>
            <p className="text-sm text-muted-foreground">
              Deseja compartilhar esta notícia nas redes sociais agora?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onCancel ?? onClose}>
                <X className="w-4 h-4 mr-2" />
                Não, obrigado
              </Button>
              <Button onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Sim, compartilhar
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule">
            <SocialScheduler 
              newsId={newsId}
              newsTitle={newsTitle}
              newsImage={newsImage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
