import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Save, Eye, Send, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { NewsDownloadManager } from './NewsDownloadManager';
import { NewsGallery } from '@/components/NewsGallery';
import { NewsImageGallery } from '@/components/NewsImageGallery';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MediaManager } from '@/components/MediaManager';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SafeHtmlRenderer, sanitizeEmbedCode } from '@/utils/contentSanitizer';
import { validateAndSanitize, newsSchema } from '@/utils/validation';
import { SocialShareModal } from './SocialShareModal';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const NewsEditor = ({ editingNews, onSave, onNavigateToShare }: { editingNews?: any, onSave?: () => void, onNavigateToShare?: (newsData: { title: string; url: string }) => void }) => {
  const [article, setArticle] = useState({
    title: '',
    subtitle: '',
    metaDescription: '',
    content: '',
    categoryId: '',
    isBreaking: false,
    isFeatured: false,
        tags: '',
        status: 'draft', // draft, published, scheduled
    scheduledPublishAt: null as Date | null
  });
  const [newsImages, setNewsImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [publishedNewsData, setPublishedNewsData] = useState<{ title: string; url: string } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    if (editingNews) {
      setArticle({
        title: editingNews.title || '',
        subtitle: editingNews.subtitle || '',
        metaDescription: editingNews.meta_description || '',
        content: editingNews.content || '',
        categoryId: editingNews.category_id || '',
        isBreaking: editingNews.is_breaking || false,
        isFeatured: editingNews.is_featured || false,
        tags: editingNews.tags?.join(', ') || '',
        status: editingNews.is_published ? 'published' : (editingNews.scheduled_publish_at ? 'scheduled' : 'draft'),
        scheduledPublishAt: editingNews.scheduled_publish_at ? new Date(editingNews.scheduled_publish_at) : null
      });
    }
  }, [editingNews]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (status: 'draft' | 'published' | 'scheduled') => {
    try {
      setLoading(true);

      if (!user?.id) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      if (status === 'scheduled' && !article.scheduledPublishAt) {
        toast({
          title: "Data de agendamento obrigatória",
          description: "Selecione uma data e hora para o agendamento.",
          variant: "destructive",
        });
        return;
      }

      console.log('Saving article with status:', status, 'scheduledPublishAt:', article.scheduledPublishAt);

      // Prepare news data based on status
      const newsData = {
        title: article.title,
        subtitle: article.subtitle || null,
        meta_description: article.metaDescription,
        content: article.content,
        category_id: article.categoryId || null,
        is_breaking: article.isBreaking,
        is_featured: article.isFeatured,
        tags: article.tags ? article.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        author_id: user?.id,
        // Para publicação direta
        is_published: status === 'published',
        published_at: status === 'published' ? new Date().toISOString() : null,
        // Para agendamento
        status: status,
        scheduled_publish_at: status === 'scheduled' ? article.scheduledPublishAt?.toISOString() : null
      };

      console.log('News data to save:', newsData);

      let result;
      let savedNewsId: string;

      if (editingNews) {
        // Update existing news
        result = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingNews.id)
          .select()
          .single();
        savedNewsId = editingNews.id;
        console.log('Updated existing news:', result);
      } else {
        // Create new news
        result = await supabase
          .from('news')
          .insert(newsData)
          .select()
          .single();
        savedNewsId = result.data?.id;
        console.log('Created new news:', result);
      }

      if (result.error) {
        console.error('Database error:', result.error);
        throw result.error;
      }
      
      // Handle scheduling with pg_cron if status is 'scheduled'
      if (status === 'scheduled' && article.scheduledPublishAt && savedNewsId) {
        try {
          console.log('Attempting to schedule post:', {
            savedNewsId,
            scheduledTime: article.scheduledPublishAt.toISOString(),
            formattedTime: format(article.scheduledPublishAt, 'dd/MM/yyyy \'às\' HH:mm')
          });
          
          const { data: scheduleData, error: scheduleError } = await supabase.rpc('schedule_post_publish', {
            p_post_id: savedNewsId,
            p_when: article.scheduledPublishAt.toISOString()
          });

          console.log('Schedule RPC response:', { data: scheduleData, error: scheduleError });

          if (scheduleError) {
            console.error('Schedule error details:', scheduleError);
            const errorMsg = scheduleError.message || scheduleError.hint || scheduleError.details || 'Erro desconhecido no agendamento';
            toast({
              title: "Erro no agendamento",
              description: errorMsg,
              variant: "destructive",
            });
            return;
          }
          
          console.log('Post scheduled successfully');
        } catch (error) {
          console.error('Error scheduling post:', error);
          toast({
            title: "Erro",
            description: "Erro ao agendar a publicação. Verifique o console para mais detalhes.",
            variant: "destructive",
          });
          return;
        }
      }

      // NewsGallery já gerencia o salvamento das imagens automaticamente
      // Removida lógica duplicada de salvamento de imagens
      
      toast({
        title: status === 'draft' ? "Rascunho salvo" : status === 'scheduled' ? "Notícia agendada" : "Notícia publicada",
        description: status === 'draft' 
          ? "Seu rascunho foi salvo com sucesso." 
          : status === 'scheduled'
          ? `A notícia foi agendada para ${format(article.scheduledPublishAt!, 'dd/MM/yyyy \'às\' HH:mm')}.`
          : "A notícia foi publicada e está disponível no site.",
      });

      // Show share modal for published articles
      if (status === 'published' && !editingNews) {
        console.log('Modal should show - conditions met:', { status, editingNews, onNavigateToShare: !!onNavigateToShare });
        const newsUrl = `${window.location.origin}/noticia/${savedNewsId}`;
        setPublishedNewsData({ title: article.title, url: newsUrl });
        setShareModalOpen(true);
        console.log('Share modal opened:', { shareModalOpen: true, publishedNewsData: { title: article.title, url: newsUrl } });
      }

      if ((status === 'published' || status === 'scheduled') && !editingNews) {
        // Reset form after publishing or scheduling new article
        setArticle({
          title: '',
          subtitle: '',
          metaDescription: '',
          content: '',
          categoryId: '',
          isBreaking: false,
          isFeatured: false,
          tags: '',
          status: 'draft',
          scheduledPublishAt: null
        });
        setNewsImages([]);
      }

      onSave?.();
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a notícia. Detalhes no console.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareNews = () => {
    if (publishedNewsData && onNavigateToShare) {
      onNavigateToShare(publishedNewsData);
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>{editingNews ? 'Editar Notícia' : 'Editor de Notícias'}</CardTitle>
        <CardDescription>
          {editingNews ? 'Edite a notícia selecionada' : 'Crie uma nova notícia para o portal'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Digite o título da notícia..."
              value={article.title}
              onChange={(e) => setArticle({ ...article, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={article.categoryId} 
              onValueChange={(value) => setArticle({ ...article, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
          <Input
            id="subtitle"
            placeholder="Digite o subtítulo da notícia..."
            value={article.subtitle}
            onChange={(e) => setArticle({ ...article, subtitle: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta-descrição</Label>
          <Textarea
            id="metaDescription"
            placeholder="Escreva uma meta-descrição para SEO (aparece nos resultados de busca)..."
            rows={3}
            value={article.metaDescription}
            onChange={(e) => setArticle({ ...article, metaDescription: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo</Label>
          <RichTextEditor
            value={article.content}
            onChange={(content) => setArticle({ ...article, content })}
            placeholder="Escreva o conteúdo completo da notícia..."
          />
        </div>

        {/* Image Gallery */}
        <NewsGallery 
          newsId={editingNews?.id}
          isEditor={true}
          onImagesChange={(images) => {
            console.log('Images changed in NewsEditor:', images);
            setNewsImages(images);
          }}
          initialImages={newsImages}
        />

        {/* Downloads Manager */}
        <NewsDownloadManager newsId={editingNews?.id} />

        {/* Media Manager */}
        <MediaManager newsId={editingNews?.id} />

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input
            id="tags"
            placeholder="política, economia, brasil..."
            value={article.tags}
            onChange={(e) => setArticle({ ...article, tags: e.target.value })}
          />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="breaking"
              checked={article.isBreaking}
              onCheckedChange={(checked) => setArticle({ ...article, isBreaking: checked })}
            />
            <Label htmlFor="breaking">Marcar como notícia urgente</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={article.isFeatured}
              onCheckedChange={(checked) => setArticle({ ...article, isFeatured: checked })}
            />
            <Label htmlFor="featured">Marcar como destaque na home</Label>
          </div>
        </div>

        {/* Scheduling Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <Label className="text-sm font-medium">Agendamento de Publicação</Label>
            </div>
            {editingNews?.status === 'scheduled' && (
              <div className="flex items-center space-x-2">
                <span className="bg-amber-100 text-amber-800 px-2 py-1 text-xs font-semibold rounded-full">
                  Agendado
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const { error } = await supabase.rpc('cancel_post_schedule', {
                        p_post_id: editingNews.id
                      });
                      if (error) throw error;
                      
                      toast({
                        title: "Agendamento cancelado",
                        description: "A notícia voltou para rascunho.",
                      });
                      
                      // Refresh page or update state
                      window.location.reload();
                    } catch (error) {
                      console.error('Error canceling schedule:', error);
                      toast({
                        title: "Erro",
                        description: "Não foi possível cancelar o agendamento.",
                        variant: "destructive",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancelar Agendamento
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Data e hora para publicação (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !article.scheduledPublishAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {article.scheduledPublishAt ? (
                    format(article.scheduledPublishAt, 'dd/MM/yyyy \'às\' HH:mm')
                  ) : (
                    <span>Selecione data e hora</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={article.scheduledPublishAt}
                  onSelect={(date) => {
                    if (date) {
                      // Set time to current time if no time is set
                      const now = new Date();
                      date.setHours(now.getHours(), now.getMinutes());
                    }
                    setArticle({ ...article, scheduledPublishAt: date });
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const compareDate = new Date(date);
                    compareDate.setHours(0, 0, 0, 0);
                    return compareDate < today;
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
                {article.scheduledPublishAt && (
                  <div className="p-3 border-t">
                    <Label htmlFor="time" className="text-sm">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={article.scheduledPublishAt ? format(article.scheduledPublishAt, 'HH:mm') : ''}
                      onChange={(e) => {
                        if (article.scheduledPublishAt && e.target.value) {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(article.scheduledPublishAt);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setArticle({ ...article, scheduledPublishAt: newDate });
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                )}
              </PopoverContent>
            </Popover>
            {article.scheduledPublishAt && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setArticle({ ...article, scheduledPublishAt: null })}
                className="text-muted-foreground"
              >
                Remover agendamento
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={loading}>
                <Eye className="w-4 h-4 mr-2" />
                Pré-visualizar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Pré-visualização da Notícia</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Category and Breaking Badge */}
                <div className="flex items-center gap-2">
                  {article.isBreaking && (
                    <span className="bg-news-breaking text-white px-3 py-1 text-sm font-bold uppercase tracking-wide animate-pulse">
                      URGENTE
                    </span>
                  )}
                  <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                    {categories.find(c => c.id === article.categoryId)?.name || 'Categoria'}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {article.title || 'Título da notícia'}
                </h1>

                {/* Subtitle */}
                {article.subtitle && (
                  <h2 className="text-xl text-muted-foreground leading-relaxed">
                    {article.subtitle}
                  </h2>
                )}

                {/* Article Meta */}
                <div className="flex items-center justify-between pb-6 border-b border-border">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <span>Por: {user?.email || 'Autor'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{format(new Date(), 'dd/MM/yyyy \'às\' HH:mm')}</span>
                    </div>
                  </div>
                </div>

                {/* Images Gallery */}
                {newsImages.length > 0 && (
                  <NewsImageGallery 
                    images={newsImages}
                    newsTitle={article.title || 'Título da notícia'}
                  />
                )}

                {/* Article Content */}
                <SafeHtmlRenderer 
                  content={article.content || '<p>Conteúdo da notícia aparecerá aqui...</p>'}
                  className="prose prose-lg max-w-none text-foreground"
                />


                {/* Tags */}
                {article.tags && (
                  <div className="pt-6 border-t border-border">
                    <h4 className="font-semibold mb-3">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.split(',').map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          {article.scheduledPublishAt && (
            <Button
              variant="outline"
              onClick={() => handleSave('scheduled')}
              disabled={loading || !article.title || !article.metaDescription || !article.content || !article.categoryId}
              className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            >
              <Clock className="w-4 h-4 mr-2" />
              {loading ? 'Agendando...' : 'Agendar Publicação'}
            </Button>
          )}
          <Button 
            onClick={() => handleSave('published')}
            disabled={loading || !article.title || !article.metaDescription || !article.content || !article.categoryId}
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Publicando...' : editingNews ? 'Atualizar' : 'Publicar'}
          </Button>
        </div>
      </CardContent>
    </Card>
    
    <SocialShareModal
      isOpen={shareModalOpen}
      onClose={() => setShareModalOpen(false)}
      onShare={handleShareNews}
      newsTitle={publishedNewsData?.title || ''}
      newsId={editingNews?.id || ''}
      newsImage={newsImages.find(img => img.is_featured)?.image_url}
    />
    </>
  );
};
