import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Search, Calendar, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { useDailyBriefs } from '@/hooks/useDailyBriefs';
import { useCategories } from '@/hooks/useCategories';
import { DailyBriefsForm } from './DailyBriefsForm';
import { DailyBriefsViewModal } from './DailyBriefsViewModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export const DailyBriefsPanel = () => {
  const { briefs, loading, refetch, deleteBrief } = useDailyBriefs();
  const { categories } = useCategories();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingBrief, setEditingBrief] = useState(null);
  const [viewingBrief, setViewingBrief] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingBrief, setDeletingBrief] = useState<string | null>(null);

  const statusCounts = {
    total: briefs.length,
    rascunho: briefs.filter(b => b.status === 'rascunho').length,
    em_andamento: briefs.filter(b => b.status === 'em_andamento').length,
    finalizada: briefs.filter(b => b.status === 'finalizada').length
  };

  const categoryCounts = categories.map(category => ({
    ...category,
    count: briefs.filter(b => b.category_id === category.id).length
  }));

  const filteredBriefs = briefs.filter(brief => {
    const matchesSearch = brief.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || brief.category_id === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || brief.priority === selectedPriority;
    const matchesStatus = statusFilter === 'all' || brief.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'finalizada': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baixa': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewBrief = (brief) => {
    setViewingBrief(brief);
    setShowViewModal(true);
  };

  const handleEditBrief = (brief) => {
    console.log('🎯 handleEditBrief chamado com:', brief);
    setEditingBrief(brief);
    setShowForm(true);
    console.log('🎯 Modal abrindo para edição...');
  };

  const handleDeleteBrief = async (briefId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pauta?')) {
      return;
    }

    try {
      setDeletingBrief(briefId);
      await deleteBrief(briefId);
      toast({
        title: "Sucesso",
        description: "Pauta excluída com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir pauta.",
        variant: "destructive",
      });
    } finally {
      setDeletingBrief(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    // Delay resetting editingBrief to prevent form reset before modal closes
    setTimeout(() => {
      setEditingBrief(null);
    }, 200);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBrief(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pautas do Dia</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Pauta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pautas</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rascunho</p>
                <p className="text-2xl font-bold text-gray-600">{statusCounts.rascunho}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.em_andamento}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Finalizada</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.finalizada}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Pautas por Categoria</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categoryCounts.map(category => (
            <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="text-center">
                  <div 
                    className="w-8 h-8 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: category.color }}
                  />
                  <p className="text-sm font-medium text-muted-foreground">{category.name}</p>
                  <p className="text-xl font-bold">{category.count}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pautas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todas as prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="rascunho">Rascunho</TabsTrigger>
              <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
              <TabsTrigger value="finalizada">Concluídas</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-4">
              <div className="space-y-3">
                {filteredBriefs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {loading ? 'Carregando...' : 'Nenhuma pauta encontrada.'}
                  </p>
                ) : (
                  filteredBriefs.map(brief => (
                    <Card key={brief.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{brief.title}</h4>
                              <Badge className={getStatusColor(brief.status)}>
                                {brief.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getPriorityColor(brief.priority)}>
                                {brief.priority}
                              </Badge>
                            </div>
                            
                            {brief.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {brief.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {(() => {
                                  const dateParts = brief.brief_date.split('-');
                                  const year = parseInt(dateParts[0]);
                                  const month = parseInt(dateParts[1]) - 1;
                                  const day = parseInt(dateParts[2]);
                                  const localDate = new Date(year, month, day);
                                  return format(localDate, 'dd/MM/yyyy', { locale: ptBR });
                                })()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {brief.brief_time}
                              </div>
                              {brief.categories && (
                                <div className="flex items-center gap-1">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: brief.categories.color }}
                                  />
                                  {brief.categories.name}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewBrief(brief)}
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBrief(brief)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBrief(brief.id)}
                              disabled={deletingBrief === brief.id}
                              title="Excluir"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showForm && (
        <DailyBriefsForm
          key={editingBrief ? `edit-${editingBrief.id}` : 'new-brief'}
          open={showForm}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          brief={editingBrief}
        />
      )}

      {showViewModal && viewingBrief && (
        <DailyBriefsViewModal
          open={showViewModal}
          onClose={() => setShowViewModal(false)}
          brief={viewingBrief}
        />
      )}
    </div>
  );
};
