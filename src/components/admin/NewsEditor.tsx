import { useState } from 'react';
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
import { Save, Eye, Send } from 'lucide-react';

const categories = [
  'Política',
  'Economia', 
  'Esportes',
  'Tecnologia',
  'Internacional',
  'Nacional',
  'Entretenimento',
  'Saúde'
];

export const NewsEditor = () => {
  const [article, setArticle] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    imageUrl: '',
    isBreaking: false,
    status: 'draft' // draft, published
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async (status: 'draft' | 'published') => {
    setLoading(true);
    
    try {
      // Aqui você implementaria a lógica para salvar no Supabase
      // Por enquanto, apenas simulamos o salvamento
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: status === 'draft' ? "Rascunho salvo" : "Notícia publicada",
        description: status === 'draft' 
          ? "Seu rascunho foi salvo com sucesso." 
          : "A notícia foi publicada e está disponível no site.",
      });

      if (status === 'published') {
        // Reset form after publishing
        setArticle({
          title: '',
          summary: '',
          content: '',
          category: '',
          imageUrl: '',
          isBreaking: false,
          status: 'draft'
        });
      }
    } catch (error) {
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
        <CardTitle>Editor de Notícias</CardTitle>
        <CardDescription>
          Crie ou edite notícias para o portal
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
              value={article.category} 
              onValueChange={(value) => setArticle({ ...article, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Resumo</Label>
          <Textarea
            id="summary"
            placeholder="Escreva um breve resumo da notícia..."
            rows={3}
            value={article.summary}
            onChange={(e) => setArticle({ ...article, summary: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            placeholder="Escreva o conteúdo completo da notícia..."
            rows={10}
            value={article.content}
            onChange={(e) => setArticle({ ...article, content: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL da Imagem</Label>
          <Input
            id="imageUrl"
            placeholder="https://exemplo.com/imagem.jpg"
            value={article.imageUrl}
            onChange={(e) => setArticle({ ...article, imageUrl: e.target.value })}
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
            disabled={loading || !article.title || !article.content}
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};