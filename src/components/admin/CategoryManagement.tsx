import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Edit, Trash2, Plus, Tag, Eye, EyeOff } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  template_type?: string;
  created_at: string;
  updated_at: string;
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#0066cc',
    icon: '',
    is_active: true,
    sort_order: 0,
    template_type: 'standard' as 'standard' | 'grid' | 'list' | 'magazine'
  });
  
  const { userRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso.",
        });
      }

      fetchCategories();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a categoria.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color,
      icon: category.icon || '',
      is_active: category.is_active,
      sort_order: category.sort_order,
      template_type: (category.template_type as 'standard' | 'grid' | 'list' | 'magazine') || 'standard'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso.",
      });

      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Categoria ${!category.is_active ? 'ativada' : 'desativada'} com sucesso.`,
      });

      fetchCategories();
    } catch (error: any) {
      console.error('Error toggling category status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da categoria.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#0066cc',
      icon: '',
      is_active: true,
      sort_order: 0,
      template_type: 'standard' as 'standard' | 'grid' | 'list' | 'magazine'
    });
    setEditingCategory(null);
  };

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Acesso restrito a administradores.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="p-6 flex items-center justify-center text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="sr-only">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciar Categorias</CardTitle>
            <CardDescription>
              Crie e gerencie as categorias do portal de notícias
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? 'Edite as informações da categoria'
                    : 'Preencha os dados da nova categoria'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name,
                        slug: formData.slug || generateSlug(name)
                      });
                    }}
                    placeholder="Ex: Política"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Ex: politica"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição da categoria..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Ordem</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template_type">Tipo de Template</Label>
                  <Select 
                    value={formData.template_type} 
                    onValueChange={(value: 'standard' | 'grid' | 'list' | 'magazine') => 
                      setFormData({ ...formData, template_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Padrão</SelectItem>
                      <SelectItem value="grid">Grade</SelectItem>
                      <SelectItem value="list">Lista</SelectItem>
                      <SelectItem value="magazine">Revista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Categoria ativa</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingCategory ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" style={{ color: category.color }} />
                    {category.name}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {category.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {category.color}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {category.template_type === 'standard' && 'Padrão'}
                    {category.template_type === 'grid' && 'Grade'}
                    {category.template_type === 'list' && 'Lista'}
                    {category.template_type === 'magazine' && 'Revista'}
                    {!category.template_type && 'Padrão'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={category.is_active ? 'default' : 'secondary'}>
                    {category.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </TableCell>
                <TableCell>{category.sort_order}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(category)}
                      title={category.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {category.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {categories.length === 0 && (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
