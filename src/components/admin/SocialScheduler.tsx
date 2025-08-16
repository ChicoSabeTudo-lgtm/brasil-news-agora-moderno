import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock, X, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useSocialScheduledPosts, SocialScheduledPost } from '@/hooks/useSocialScheduledPosts';
import { useAuth } from '@/hooks/useAuth';

interface SocialSchedulerProps {
  newsId: string;
  newsTitle: string;
  newsImage?: string;
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
};

const platformNames = {
  instagram: 'Instagram',
  twitter: 'Twitter',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};

const statusColors = {
  scheduled: 'bg-amber-100 text-amber-800',
  published: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export const SocialScheduler = ({ newsId, newsTitle, newsImage }: SocialSchedulerProps) => {
  const { user } = useAuth();
  const { posts, loading, schedulePost, cancelSchedule, publishNow, fetchPosts } = useSocialScheduledPosts();
  
  const [formData, setFormData] = useState({
    platform: '',
    content: '',
    scheduledDate: undefined as Date | undefined,
    scheduledTime: '',
  });

  const newsPosts = posts.filter(post => post.news_id === newsId);

  const handleSchedule = async () => {
    if (!formData.platform || !formData.content || !formData.scheduledDate || !formData.scheduledTime || !user?.id) {
      return;
    }

    const scheduledDateTime = new Date(formData.scheduledDate);
    const [hours, minutes] = formData.scheduledTime.split(':');
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    try {
      console.log('🎯 Starting schedule process with data:', {
        news_id: newsId,
        platform: formData.platform,
        content: formData.content,
        image_url: newsImage,
        scheduled_for: scheduledDateTime.toISOString(),
        created_by: user.id,
      });

      await schedulePost({
        news_id: newsId,
        platform: formData.platform,
        content: formData.content,
        image_url: newsImage,
        scheduled_for: scheduledDateTime.toISOString(),
        created_by: user.id,
      });

      console.log('✅ Schedule completed successfully');

      // Reset form
      setFormData({
        platform: '',
        content: '',
        scheduledDate: undefined,
        scheduledTime: '',
      });

      // Refresh posts for this news
      await fetchPosts();
    } catch (error) {
      console.error('Error scheduling post:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const Icon = platformIcons[platform as keyof typeof platformIcons];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Agendar Compartilhamento
          </CardTitle>
          <CardDescription>
            Agende posts para redes sociais baseados nesta notícia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  {formData.scheduledDate ? format(formData.scheduledDate, "dd/MM/yyyy") : "Selecione uma data"}
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
            <Label htmlFor="content">Conteúdo do Post</Label>
            <Textarea
              id="content"
              placeholder="Digite o conteúdo do post..."
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Título da notícia: {newsTitle}
            </p>
          </div>

          <Button 
            onClick={handleSchedule}
            disabled={loading || !formData.platform || !formData.content || !formData.scheduledDate || !formData.scheduledTime}
            className="w-full"
          >
            {loading ? 'Agendando...' : 'Agendar Post'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de posts agendados */}
      {newsPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Posts Agendados</CardTitle>
            <CardDescription>
              Posts agendados para esta notícia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {newsPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getPlatformIcon(post.platform)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {platformNames[post.platform as keyof typeof platformNames]}
                        </span>
                        <Badge className={statusColors[post.status]}>
                          {post.status === 'scheduled' && 'Agendado'}
                          {post.status === 'published' && 'Publicado'}
                          {post.status === 'failed' && 'Falhou'}
                          {post.status === 'cancelled' && 'Cancelado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {post.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.status === 'scheduled' && `Agendado para: ${format(new Date(post.scheduled_for), 'dd/MM/yyyy \'às\' HH:mm')}`}
                        {post.status === 'published' && post.published_at && `Publicado em: ${format(new Date(post.published_at), 'dd/MM/yyyy \'às\' HH:mm')}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {post.status === 'scheduled' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => publishNow(post.id)}
                          disabled={loading}
                        >
                          Publicar Agora
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelSchedule(post.id)}
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};