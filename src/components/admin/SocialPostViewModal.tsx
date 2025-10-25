import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import { Instagram, Twitter, Facebook, Linkedin, MessageCircle, Clock, Calendar, User, Eye, Edit } from 'lucide-react';
import { SocialScheduledPost } from '@/hooks/useSocialScheduledPosts';

interface SocialPostViewModalProps {
  post: SocialScheduledPost | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
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

const statusColors = {
  scheduled: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800',
  published: 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800',
  failed: 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-800',
  cancelled: 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-800',
};

const statusNames = {
  scheduled: 'Agendado',
  published: 'Publicado',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

export const SocialPostViewModal = ({ post, isOpen, onClose, onEdit }: SocialPostViewModalProps) => {
  if (!post) return null;

  const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons];
  
  // Só permite editar se o post estiver agendado
  const canEdit = post.status === 'scheduled';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Visualizar Post
          </DialogTitle>
          <DialogDescription>
            Detalhes do post agendado para redes sociais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho com plataforma e status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {PlatformIcon && <PlatformIcon className="w-6 h-6" />}
              <div>
                <h3 className="font-semibold">
                  {platformNames[post.platform as keyof typeof platformNames]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  ID: {post.id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <Badge variant="outline" className={statusColors[post.status]}>
              {statusNames[post.status]}
            </Badge>
          </div>

          {/* Informações de timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                Agendado para
              </div>
              <p className="text-sm text-muted-foreground">
                {formatInTimeZone(new Date(post.scheduled_for), 'America/Fortaleza', 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
              </p>
            </div>

            {post.published_at && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  Publicado em
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatInTimeZone(new Date(post.published_at), 'America/Fortaleza', 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          {/* Conteúdo do post */}
          <div className="space-y-2">
            <h4 className="font-medium">Conteúdo do Post</h4>
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap text-sm">{post.content}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                {post.content.length} caracteres
              </div>
            </div>
          </div>

          {/* URL da imagem se existir */}
          {post.image_url && (
            <div className="space-y-2">
              <h4 className="font-medium">Imagem</h4>
              <div className="space-y-2">
                <img 
                  src={post.image_url} 
                  alt="Preview da imagem do post" 
                  className="max-w-full h-auto rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-xs text-muted-foreground break-all">
                  {post.image_url}
                </p>
              </div>
            </div>
          )}

          {/* Informações de erro se houver */}
          {post.status === 'failed' && post.error_message && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Mensagem de Erro</h4>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{post.error_message}</p>
              </div>
            </div>
          )}

          {/* Metadados */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium text-sm">Metadados</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Criado em:</span><br />
                {format(new Date(post.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </div>
              <div>
                <span className="font-medium">Atualizado em:</span><br />
                {format(new Date(post.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </div>
              <div>
                <span className="font-medium">ID da Notícia:</span><br />
                {post.news_id}
              </div>
              <div>
                <span className="font-medium">Criado por:</span><br />
                {post.created_by}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {canEdit && onEdit && (
            <Button onClick={() => {
              onEdit();
              onClose();
            }} className="gap-2">
              <Edit className="w-4 h-4" />
              Editar Post
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};