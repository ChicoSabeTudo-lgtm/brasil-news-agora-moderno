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
import { ImageGalleryEditor } from './ImageGalleryEditor';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const NewsEditor = ({ editingNews, onSave }: { editingNews?: any, onSave?: () => void }) => {
  const [article, setArticle] = useState({
    title: '',
    subtitle: '',
    metaDescription: '',
    content: '',
    categoryId: '',
    isBreaking: false,
    tags: '',
    status: 'draft', // draft, published, scheduled
    scheduledPublishAt: null as Date | null
  });
  const [newsImages, setNewsImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
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
    if (!article.title || !article.metaDescription || !article.content || !article.categoryId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, meta-descrição, conteúdo e categoria.",
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

    setLoading(true);
    
    try {
      const newsData = {
        title: article.title,
        subtitle: article.subtitle || null,
        meta_description: article.metaDescription,
        content: article.content,
        category_id: article.categoryId,
        is_breaking: article.isBreaking,
        is_published: status === 'published',
        published_at: status === 'published' ? new Date().toISOString() : null,
        scheduled_publish_at: status === 'scheduled' ? article.scheduledPublishAt?.toISOString() : null,
        tags: article.tags ? article.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        author_id: user?.id
      };

      let result;
      if (editingNews) {
        // Update existing news
        result = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingNews.id)
          .select()
          .single();
      } else {
        // Create new news
        result = await supabase
          .from('news')
          .insert(newsData)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      toast({
        title: status === 'draft' ? "Rascunho salvo" : status === 'scheduled' ? "Notícia agendada" : "Notícia publicada",
        description: status === 'draft' 
          ? "Seu rascunho foi salvo com sucesso." 
          : status === 'scheduled'
          ? `A notícia foi agendada para ${format(article.scheduledPublishAt!, 'dd/MM/yyyy \'às\' HH:mm')}.`
          : "A notícia foi publicada e está disponível no site.",
      });

      if ((status === 'published' || status === 'scheduled') && !editingNews) {
        // Reset form after publishing or scheduling new article
        setArticle({
          title: '',
          subtitle: '',
          metaDescription: '',
          content: '',
          categoryId: '',
          isBreaking: false,
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
        description: "Não foi possível salvar a notícia.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <ImageGalleryEditor
          newsId={editingNews?.id}
          onImagesChange={setNewsImages}
          initialImages={newsImages}
        />

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input
            id="tags"
            placeholder="política, economia, brasil..."
            value={article.tags}
            onChange={(e) => setArticle({ ...article, tags: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="breaking"
            checked={article.isBreaking}
            onCheckedChange={(checked) => setArticle({ ...article, isBreaking: checked })}
          />
          <Label htmlFor="breaking">Marcar como notícia urgente</Label>
        </div>

        {/* Scheduling Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <Label className="text-sm font-medium">Agendamento de Publicação</Label>
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
                  disabled={(date) => date < new Date()}
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
          <Button variant="outline" disabled={loading}>
            <Eye className="w-4 h-4 mr-2" />
            Pré-visualizar
          </Button>
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
  );
};