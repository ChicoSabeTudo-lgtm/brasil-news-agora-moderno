import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Instagram, Twitter, Facebook, Linkedin, MessageCircle } from 'lucide-react';
import { SocialScheduledPost } from '@/hooks/useSocialScheduledPosts';

interface SocialPostEditModalProps {
  post: SocialScheduledPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: Partial<SocialScheduledPost>) => Promise<void>;
  loading: boolean;
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

const platformNames = {
  instagram: 'Instagram',
  twitter: 'Twitter',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
};

export const SocialPostEditModal = ({ post, isOpen, onClose, onSave, loading }: SocialPostEditModalProps) => {
  const [formData, setFormData] = useState({
    platform: '',
    content: '',
    image_url: '',
    scheduledDate: undefined as Date | undefined,
    scheduledTime: '',
  });

  useEffect(() => {
    if (post) {
      const scheduledDate = new Date(post.scheduled_for);
      setFormData({
        platform: post.platform,
        content: post.content,
        image_url: post.image_url || '',
        scheduledDate: scheduledDate,
        scheduledTime: format(scheduledDate, 'HH:mm'),
      });
    }
  }, [post]);

  const handleSave = async () => {
    if (!formData.platform || !formData.content || !formData.scheduledDate || !formData.scheduledTime) {
      return;
    }

    const scheduledDateTime = new Date(formData.scheduledDate);
    const [hours, minutes] = formData.scheduledTime.split(':');
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    const updatedPost: Partial<SocialScheduledPost> = {
      platform: formData.platform as 'instagram' | 'twitter' | 'facebook' | 'linkedin' | 'whatsapp',
      content: formData.content,
      image_url: formData.image_url || null,
      scheduled_for: scheduledDateTime.toISOString(),
    };

    await onSave(updatedPost);
    onClose();
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    if (post) {
      const scheduledDate = new Date(post.scheduled_for);
      setFormData({
        platform: post.platform,
        content: post.content,
        image_url: post.image_url || '',
        scheduledDate: scheduledDate,
        scheduledTime: format(scheduledDate, 'HH:mm'),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {post && platformIcons[post.platform as keyof typeof platformIcons] && (
              <>
                {platformIcons[post.platform as keyof typeof platformIcons]({ className: "w-5 h-5" })}
                Editar Post - {platformNames[post.platform as keyof typeof platformNames]}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Edite os detalhes do post agendado para redes sociais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </div>
                  </SelectItem>
                  <SelectItem value="twitter">
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </div>
                  </SelectItem>
                  <SelectItem value="facebook">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </div>
                  </SelectItem>
                  <SelectItem value="linkedin">
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data de Publicação</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduledDate ? format(formData.scheduledDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.scheduledDate}
                  onSelect={(date) => setFormData({ ...formData, scheduledDate: date })}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo do Post</Label>
            <Textarea
              id="content"
              placeholder="Digite o conteúdo do post..."
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <div className="text-xs text-muted-foreground">
              Caracteres: {formData.content.length}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !formData.platform || !formData.content || !formData.scheduledDate || !formData.scheduledTime}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};