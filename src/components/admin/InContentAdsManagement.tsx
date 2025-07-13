import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, FileText, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Advertisement {
  id: string;
  title: string;
  position: string;
  ad_code?: string;
  image_url?: string;
  link_url?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  categories: {
    name: string;
    slug: string;
  };
}

interface NewsAdvertisement {
  id: string;
  news_id: string;
  advertisement_id: string;
  paragraph_position: number;
  is_active: boolean;
  created_at: string;
  news: NewsItem;
  advertisements: Advertisement;
}

export function InContentAdsManagement() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [newsAds, setNewsAds] = useState<NewsAdvertisement[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [editingNewsAd, setEditingNewsAd] = useState<NewsAdvertisement | null>(null);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    ad_code: '',
    image_url: '',
    link_url: '',
    is_active: true,
    start_date: '',
    end_date: ''
  });

  const [newsAdFormData, setNewsAdFormData] = useState({
    news_id: '',
    advertisement_id: '',
    paragraph_position: 1,
    is_active: true
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchInContentAds(),
        fetchNewsAdvertisements(),
        fetchNewsList()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInContentAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('position', 'in_content')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error) {
      console.error('Error fetching in-content ads:', error);
    }
  };

  const fetchNewsAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from('news_advertisements')
        .select(`
          *,
          news (id, title, slug, categories (name, slug)),
          advertisements (id, title, ad_code, is_active, position, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewsAds((data || []) as NewsAdvertisement[]);
    } catch (error) {
      console.error('Error fetching news advertisements:', error);
    }
  };

  const fetchNewsList = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          id,
          title,
          slug,
          categories (name, slug)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNewsList(data || []);
    } catch (error) {
      console.error('Error fetching news list:', error);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.ad_code) {
      toast({
        title: "Erro",
        description: "Título e código do anúncio são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        position: 'in_content',
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      if (editingAd) {
        const { error } = await supabase
          .from('advertisements')
          .update(dataToSubmit)
          .eq('id', editingAd.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Anúncio in-content atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert([dataToSubmit]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Anúncio in-content criado com sucesso"
        });
      }

      setIsAdDialogOpen(false);
      setEditingAd(null);
      resetAdForm();
      fetchInContentAds();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar anúncio",
        variant: "destructive"
      });
    }
  };

  const handleAssignAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsAdFormData.news_id || !newsAdFormData.advertisement_id) {
      toast({
        title: "Erro",
        description: "Notícia e anúncio são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingNewsAd) {
        const { error } = await supabase
          .from('news_advertisements')
          .update(newsAdFormData)
          .eq('id', editingNewsAd.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Vinculação atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('news_advertisements')
          .insert([newsAdFormData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Anúncio vinculado à notícia com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingNewsAd(null);
      resetNewsAdForm();
      fetchNewsAdvertisements();
    } catch (error) {
      console.error('Error assigning advertisement:', error);
      if (error.message?.includes('duplicate')) {
        toast({
          title: "Erro",
          description: "Já existe um anúncio nessa posição para esta notícia",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao vincular anúncio",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Anúncio excluído com sucesso"
      });
      fetchInContentAds();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir anúncio",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNewsAd = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta vinculação?')) return;

    try {
      const { error } = await supabase
        .from('news_advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Vinculação removida com sucesso"
      });
      fetchNewsAdvertisements();
    } catch (error) {
      console.error('Error deleting news advertisement:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover vinculação",
        variant: "destructive"
      });
    }
  };

  const toggleAdActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Anúncio ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`
      });
      fetchInContentAds();
    } catch (error) {
      console.error('Error toggling advertisement:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do anúncio",
        variant: "destructive"
      });
    }
  };

  const toggleNewsAdActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news_advertisements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Vinculação ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`
      });
      fetchNewsAdvertisements();
    } catch (error) {
      console.error('Error toggling news advertisement:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da vinculação",
        variant: "destructive"
      });
    }
  };

  const resetAdForm = () => {
    setFormData({
      title: '',
      ad_code: '',
      image_url: '',
      link_url: '',
      is_active: true,
      start_date: '',
      end_date: ''
    });
  };

  const resetNewsAdForm = () => {
    setNewsAdFormData({
      news_id: '',
      advertisement_id: '',
      paragraph_position: 1,
      is_active: true
    });
  };

  const handleEditAd = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      ad_code: ad.ad_code || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      is_active: ad.is_active,
      start_date: ad.start_date ? format(new Date(ad.start_date), 'yyyy-MM-dd') : '',
      end_date: ad.end_date ? format(new Date(ad.end_date), 'yyyy-MM-dd') : ''
    });
    setIsAdDialogOpen(true);
  };

  const handleEditNewsAd = (newsAd: NewsAdvertisement) => {
    setEditingNewsAd(newsAd);
    setNewsAdFormData({
      news_id: newsAd.news_id,
      advertisement_id: newsAd.advertisement_id,
      paragraph_position: newsAd.paragraph_position,
      is_active: newsAd.is_active
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Carregando anúncios in-content...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Anúncios In-Content</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie anúncios que aparecem dentro das notícias entre os parágrafos
        </p>
      </div>

      <Tabs defaultValue="ads" className="w-full">
        <TabsList>
          <TabsTrigger value="ads">Anúncios</TabsTrigger>
          <TabsTrigger value="assignments">Vinculações</TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold">Anúncios In-Content</h4>
            <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingAd(null); resetAdForm(); setIsAdDialogOpen(true); }}>
                  <Code className="w-4 h-4 mr-2" />
                  Novo Anúncio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAd ? 'Editar Anúncio' : 'Novo Anúncio In-Content'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure um anúncio para ser inserido dentro das notícias
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateAd} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título do Anúncio</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ad_code">Código do AdSense/HTML</Label>
                    <Textarea
                      id="ad_code"
                      value={formData.ad_code}
                      onChange={(e) => setFormData({ ...formData, ad_code: e.target.value })}
                      placeholder="Cole aqui o código do AdSense ou HTML do anúncio"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="image_url">URL da Imagem (Opcional)</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="link_url">URL do Link (Opcional)</Label>
                      <Input
                        id="link_url"
                        value={formData.link_url}
                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Data de Início</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">Data de Fim</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Ativo</Label>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAdDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingAd ? 'Atualizar' : 'Criar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Anúncios Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advertisements.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>
                        <Badge variant={ad.is_active ? "default" : "secondary"}>
                          {ad.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ad.start_date && ad.end_date ? (
                          <span className="text-sm">
                            {format(new Date(ad.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(ad.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        ) : ad.start_date ? (
                          <span className="text-sm">
                            A partir de {format(new Date(ad.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        ) : ad.end_date ? (
                          <span className="text-sm">
                            Até {format(new Date(ad.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        ) : (
                          'Sem limite'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAdActive(ad.id, ad.is_active)}
                          >
                            {ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAd(ad)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAd(ad.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold">Vinculações Notícia-Anúncio</h4>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingNewsAd(null); resetNewsAdForm(); setIsDialogOpen(true); }}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nova Vinculação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingNewsAd ? 'Editar Vinculação' : 'Nova Vinculação'}
                  </DialogTitle>
                  <DialogDescription>
                    Vincule um anúncio a uma notícia específica em uma posição de parágrafo
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAssignAd} className="space-y-4">
                  <div>
                    <Label htmlFor="news_id">Notícia</Label>
                    <Select value={newsAdFormData.news_id} onValueChange={(value) => setNewsAdFormData({ ...newsAdFormData, news_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma notícia" />
                      </SelectTrigger>
                      <SelectContent>
                        {newsList.map((news) => (
                          <SelectItem key={news.id} value={news.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{news.title}</span>
                              <span className="text-xs text-muted-foreground">{news.categories.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="advertisement_id">Anúncio</Label>
                    <Select value={newsAdFormData.advertisement_id} onValueChange={(value) => setNewsAdFormData({ ...newsAdFormData, advertisement_id: value })} disabled={advertisements.length === 0}>
                      <SelectTrigger>
                        <SelectValue placeholder={advertisements.length === 0 ? "Nenhum anúncio disponível" : "Selecione um anúncio"} />
                      </SelectTrigger>
                      <SelectContent>
                        {advertisements.filter(ad => ad.is_active).map((ad) => (
                          <SelectItem key={ad.id} value={ad.id}>
                            {ad.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="paragraph_position">Posição do Parágrafo</Label>
                    <Input
                      id="paragraph_position"
                      type="number"
                      min="1"
                      value={newsAdFormData.paragraph_position}
                      onChange={(e) => setNewsAdFormData({ ...newsAdFormData, paragraph_position: parseInt(e.target.value) })}
                      placeholder="Ex: 3 (inserir antes do 3º parágrafo)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      O anúncio será inserido ANTES do parágrafo especificado
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="news_ad_active"
                      checked={newsAdFormData.is_active}
                      onCheckedChange={(checked) => setNewsAdFormData({ ...newsAdFormData, is_active: checked })}
                    />
                    <Label htmlFor="news_ad_active">Ativo</Label>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={advertisements.length === 0}>
                      {editingNewsAd ? 'Atualizar' : 'Vincular'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vinculações Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Notícia</TableHead>
                    <TableHead>Anúncio</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsAds.map((newsAd) => (
                    <TableRow key={newsAd.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{newsAd.news.title}</span>
                          <span className="text-xs text-muted-foreground">{newsAd.news.categories.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{newsAd.advertisements.title}</TableCell>
                      <TableCell>Parágrafo {newsAd.paragraph_position}</TableCell>
                      <TableCell>
                        <Badge variant={newsAd.is_active ? "default" : "secondary"}>
                          {newsAd.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleNewsAdActive(newsAd.id, newsAd.is_active)}
                          >
                            {newsAd.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNewsAd(newsAd)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNewsAd(newsAd.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}