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
import { PlusCircle, Edit, Trash2, Eye, EyeOff, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Advertisement {
  id: string;
  title: string;
  position: 'header' | 'politics' | 'sports' | 'international';
  ad_code?: string;
  image_url?: string;
  link_url?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Mapeamento das posições para os slugs das categorias
const positionToSlug = {
  header: null, // Header não tem categoria
  politics: 'politica',
  sports: 'esportes', 
  international: 'internacional',
  in_content: null // In-content é gerenciado separadamente
};

export function AdvertisementManagement() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    position: '',
    ad_code: '',
    image_url: '',
    link_url: '',
    is_active: true,
    start_date: '',
    end_date: ''
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdvertisements();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getPositionLabels = () => {
    const labels: Record<string, string> = {
      header: 'Abaixo do Header',
      in_content: 'Dentro das Notícias (In-Content)'
    };

    // Buscar os nomes das categorias para as outras posições
    Object.entries(positionToSlug).forEach(([position, slug]) => {
      if (slug) {
        const category = categories.find(cat => cat.slug === slug);
        if (category) {
          labels[position] = `Antes da ${category.name}`;
        } else {
          // Fallback para nomes padrão se a categoria não for encontrada
          const fallbacks: Record<string, string> = {
            politics: 'Antes da Política',
            sports: 'Antes dos Esportes', 
            international: 'Antes do Internacional'
          };
          labels[position] = fallbacks[position] || `Antes da ${position}`;
        }
      }
    });

    return labels;
  };

  const positionLabels = getPositionLabels();

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdvertisements((data || []) as Advertisement[]);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar propagandas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.position) {
      toast({
        title: "Erro",
        description: "Título e posição são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (!formData.ad_code && !formData.image_url) {
      toast({
        title: "Erro", 
        description: "Código da propaganda ou imagem é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
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
          description: "Propaganda atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert([dataToSubmit]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Propaganda criada com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingAd(null);
      resetForm();
      fetchAdvertisements();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar propaganda",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      position: ad.position,
      ad_code: ad.ad_code || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      is_active: ad.is_active,
      start_date: ad.start_date ? format(new Date(ad.start_date), 'yyyy-MM-dd') : '',
      end_date: ad.end_date ? format(new Date(ad.end_date), 'yyyy-MM-dd') : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta propaganda?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Propaganda excluída com sucesso"
      });
      fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir propaganda",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Propaganda ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`
      });
      fetchAdvertisements();
    } catch (error) {
      console.error('Error toggling advertisement:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da propaganda",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('advertisements')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('advertisements')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: data.publicUrl });
      
      toast({
        title: "Sucesso",
        description: "Imagem carregada com sucesso"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar imagem",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      position: '',
      ad_code: '',
      image_url: '',
      link_url: '',
      is_active: true,
      start_date: '',
      end_date: ''
    });
  };

  const openCreateDialog = () => {
    setEditingAd(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Carregando propagandas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gerenciar Propagandas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os espaços publicitários da página inicial
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova Propaganda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'Editar Propaganda' : 'Nova Propaganda'}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes da propaganda
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Posição</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a posição" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(positionLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="ad_code">Código da Propaganda</Label>
                <Textarea
                  id="ad_code"
                  value={formData.ad_code}
                  onChange={(e) => setFormData({ ...formData, ad_code: e.target.value })}
                  placeholder="Cole aqui o código HTML da propaganda"
                  rows={3}
                />
              </div>

              <div className="text-center text-muted-foreground">OU</div>

              <div>
                <Label htmlFor="image_upload">Upload de Imagem</Label>
                <div className="flex gap-2">
                  <Input
                    id="image_upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <Button type="button" disabled={uploading}>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Enviando...' : 'Upload'}
                  </Button>
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded border"
                    />
                  </div>
                )}
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
                  <Label htmlFor="link_url">URL do Link</Label>
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
          <CardTitle>Propagandas Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as propagandas configuradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Posição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advertisements.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.title}</TableCell>
                  <TableCell>{positionLabels[ad.position]}</TableCell>
                  <TableCell>
                    <Badge variant={ad.is_active ? "default" : "secondary"}>
                      {ad.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ad.start_date && format(new Date(ad.start_date), 'dd/MM/yyyy')}
                    {ad.start_date && ad.end_date && ' - '}
                    {ad.end_date && format(new Date(ad.end_date), 'dd/MM/yyyy')}
                    {!ad.start_date && !ad.end_date && 'Sem limite'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(ad.id, ad.is_active)}
                      >
                        {ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {advertisements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma propaganda cadastrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}