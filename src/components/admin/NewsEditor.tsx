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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Save, Eye, Send } from 'lucide-react';
import { ImageGalleryEditor } from './ImageGalleryEditor';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

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
    status: 'draft' // draft, published
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
        status: editingNews.is_published ? 'published' : 'draft'
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

  const handleSave = async (status: 'draft' | 'published') => {
    if (!article.title || !article.metaDescription || !article.content || !article.categoryId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, meta-descrição, conteúdo e categoria.",
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
        title: status === 'draft' ? "Rascunho salvo" : "Notícia publicada",
        description: status === 'draft' 
          ? "Seu rascunho foi salvo com sucesso." 
          : "A notícia foi publicada e está disponível no site.",
      });

      if (status === 'published' && !editingNews) {
        // Reset form after publishing new article
        setArticle({
          title: '',
          subtitle: '',
          metaDescription: '',
          content: '',
          categoryId: '',
          isBreaking: false,
          tags: '',
          status: 'draft'
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