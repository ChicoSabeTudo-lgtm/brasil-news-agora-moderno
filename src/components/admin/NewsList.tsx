import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { NewsEditor } from './NewsEditor';

interface News {
  id: string;
  title: string;
  summary: string;
  slug: string | null;
  is_published: boolean;
  is_breaking: boolean;
  is_featured: boolean;
  published_at: string | null;
  scheduled_publish_at: string | null;
  status: string;
  created_at: string;
  views: number;
  author_id: string;
  categories: {
    name: string;
  } | null;
  profiles: {
    full_name: string | null;
  } | null;
  news_images?: {
    image_url: string;
    is_cover: boolean;
    caption: string;
  }[];
}

interface Category {
  id: string;
  name: string;
}

export const NewsList = ({ onNavigateToShare }: { onNavigateToShare?: (newsData: { title: string; url: string }) => void }) => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data: newsData, error } = await supabase
        .from('news')
        .select(`
          *,
          categories (
            name
          ),
          news_images (
            image_url,
            is_cover,
            caption
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar perfis dos autores separadamente (incluindo notícias sem author_id)
      const userIds = newsData?.map(news => news.author_id).filter(Boolean) || [];
      let profilesData: any[] = [];
      
      if (userIds.length > 0) {
        // Buscar perfis
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      // Combinar dados
      const newsWithProfiles = newsData?.map(news => {
        if (!news.author_id) {
          return {
            ...news,
            profiles: { full_name: 'Sistema' }
          };
        }
        
        const profile = profilesData.find(p => p.user_id === news.author_id);
        return {
          ...news,
          profiles: profile || {
            user_id: news.author_id,
            full_name: news.author_id ? `Usuário ${news.author_id.slice(0, 8)}` : 'Desconhecido'
          }
        };
      }) || [];

      setNews(newsWithProfiles as any);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notícias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(newsItem => {
    const matchesSearch = newsItem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || newsItem.categories?.name === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && newsItem.is_published) ||
      (filterStatus === 'draft' && !newsItem.is_published && newsItem.status !== 'scheduled') ||
      (filterStatus === 'scheduled' && newsItem.status === 'scheduled');
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = async (newsItem: News) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', newsItem.id)
        .single();

      if (error) throw error;
      
      setEditingNews(data);
      setShowEditor(true);
    } catch (error) {
      console.error('Error fetching news for edit:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a notícia para edição.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;
    
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Notícia excluída",
        description: "A notícia foi excluída com sucesso.",
      });

      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notícia.",
        variant: "destructive",
      });
    }
  };

  const handleEditorSave = () => {
    setShowEditor(false);
    setEditingNews(null);
    fetchNews();
  };

  const handleView = async (newsItem: News) => {
    if (!newsItem.is_published) {
      toast({
        title: "Notícia não disponível",
        description: "Esta notícia ainda não foi publicada.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Buscar dados completos da notícia incluindo categoria
      const { data, error } = await supabase
        .from('news')
        .select(`
          id,
          slug,
          categories (
            slug
          )
        `)
        .eq('id', newsItem.id)
        .single();

      if (error) throw error;

      if (data?.slug && data?.categories?.slug) {
        // Usar rota com categoria e slug
        window.open(`/${data.categories.slug}/${data.slug}`, '_blank');
      } else if (data?.id) {
        // Fallback para rota por ID
        window.open(`/noticia/${data.id}`, '_blank');
      } else {
        throw new Error('Slug ou ID não encontrado');
      }
    } catch (error) {
      console.error('Error building article URL:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir a notícia. Link inválido ou dados incompletos.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (newsItem: News) => {
    if (newsItem.status === 'scheduled') {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Agendado</Badge>;
    } else if (newsItem.is_published) {
      return <Badge variant="default">Publicado</Badge>;
    } else {
      return <Badge variant="secondary">Rascunho</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não publicado';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (showEditor) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowEditor(false);
              setEditingNews(null);
            }}
          >
            ← Voltar para lista
          </Button>
        </div>
        <NewsEditor editingNews={editingNews} onSave={handleEditorSave} onNavigateToShare={onNavigateToShare} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lista de Notícias</CardTitle>
            <CardDescription>
              Gerencie todas as notícias do portal
            </CardDescription>
          </div>
          <Button onClick={() => setShowEditor(true)}>
            <span className="mr-2">+</span>
            Criar Nova Notícia
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar notícias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="published">Publicados</SelectItem>
              <SelectItem value="draft">Rascunhos</SelectItem>
              <SelectItem value="scheduled">Agendados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Imagem</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Publicado em</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Carregando notícias...
                  </TableCell>
                </TableRow>
              ) : filteredNews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-center">
                      <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                          ? 'Nenhuma notícia encontrada com os filtros aplicados.'
                          : 'Nenhuma notícia cadastrada ainda. Clique em "Criar Nova Notícia" para começar.'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNews.map((newsItem) => (
                  <TableRow key={newsItem.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {newsItem.is_breaking && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                        <span className="line-clamp-2">{newsItem.title}</span>
                        <div className="flex gap-1 ml-auto">
                          {newsItem.is_featured && (
                            <Badge variant="default" className="text-xs bg-amber-500 hover:bg-amber-600">
                              DESTAQUE
                            </Badge>
                          )}
                          {newsItem.is_breaking && (
                            <Badge variant="destructive" className="text-xs">
                              URGENTE
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {newsItem.news_images && newsItem.news_images.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={newsItem.news_images.find(img => img.is_cover)?.image_url || newsItem.news_images[0]?.image_url}
                            alt="Capa da notícia"
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span className="text-xs text-muted-foreground">
                            {newsItem.news_images.length} imagem{newsItem.news_images.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem imagem</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{newsItem.categories?.name || 'Sem categoria'}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(newsItem)}</TableCell>
                    <TableCell>
                      <span className={`text-sm ${
                        newsItem.profiles?.full_name === 'Sistema' ? 'text-blue-600' :
                        newsItem.profiles?.full_name === 'Usuário Removido' ? 'text-red-600' :
                        'text-foreground'
                      }`}>
                        {newsItem.profiles?.full_name || 'Sem autor'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(newsItem.published_at)}
                    </TableCell>
                    <TableCell>{newsItem.views.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(userRole === 'admin' || userRole === 'redator') && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(newsItem)}
                              title="Editar notícia"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleView(newsItem)}
                              title="Visualizar notícia"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {(userRole === 'admin' || userRole === 'redator') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(newsItem.id)}
                            className="text-destructive hover:text-destructive"
                            title="Excluir notícia"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-8">
            <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Nenhuma notícia encontrada com os filtros aplicados.'
                : 'Nenhuma notícia cadastrada ainda.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};