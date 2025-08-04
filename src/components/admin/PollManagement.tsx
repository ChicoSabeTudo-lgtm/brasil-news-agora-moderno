import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Vote, Eye, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Poll {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_published: boolean;
  end_date?: string;
  created_at: string;
}

interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
  sort_order: number;
}

export const PollManagement = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollOptions, setPollOptions] = useState<{ [key: string]: PollOption[] }>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: false,
    is_published: false,
    end_date: '',
    options: ['', '']
  });

  const { toast } = useToast();

  const fetchPolls = async () => {
    try {
      setLoading(true);
      
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .order('sort_order');

      if (optionsError) throw optionsError;

      setPolls(pollsData || []);
      
      // Agrupar opções por poll_id
      const optionsByPoll = (optionsData || []).reduce((acc, option) => {
        if (!acc[option.poll_id]) {
          acc[option.poll_id] = [];
        }
        acc[option.poll_id].push(option);
        return acc;
      }, {} as { [key: string]: PollOption[] });
      
      setPollOptions(optionsByPoll);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar enquetes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      is_active: false,
      is_published: false,
      end_date: '',
      options: ['', '']
    });
    setEditingPoll(null);
  };

  const openEditDialog = (poll: Poll) => {
    const options = pollOptions[poll.id] || [];
    setFormData({
      title: poll.title,
      description: poll.description || '',
      is_active: poll.is_active,
      is_published: poll.is_published,
      end_date: poll.end_date ? new Date(poll.end_date).toISOString().slice(0, 16) : '',
      options: options.length > 0 ? options.map(opt => opt.option_text) : ['', '']
    });
    setEditingPoll(poll);
    setDialogOpen(true);
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleSave = async () => {
    try {
      const validOptions = formData.options.filter(opt => opt.trim() !== '');
      
      if (!formData.title.trim() || validOptions.length < 2) {
        toast({
          title: 'Erro',
          description: 'Título e pelo menos 2 opções são obrigatórios',
          variant: 'destructive'
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const pollData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active,
        is_published: formData.is_published,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        created_by: user.id
      };

      let pollId;

      if (editingPoll) {
        // Atualizar enquete
        const { data, error } = await supabase
          .from('polls')
          .update(pollData)
          .eq('id', editingPoll.id)
          .select()
          .single();

        if (error) throw error;
        pollId = editingPoll.id;

        // Deletar opções antigas
        await supabase
          .from('poll_options')
          .delete()
          .eq('poll_id', pollId);
      } else {
        // Criar nova enquete
        const { data, error } = await supabase
          .from('polls')
          .insert(pollData)
          .select()
          .single();

        if (error) throw error;
        pollId = data.id;
      }

      // Inserir novas opções
      const optionsToInsert = validOptions.map((option, index) => ({
        poll_id: pollId,
        option_text: option.trim(),
        sort_order: index
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      toast({
        title: 'Sucesso',
        description: `Enquete ${editingPoll ? 'atualizada' : 'criada'} com sucesso`
      });

      setDialogOpen(false);
      resetForm();
      fetchPolls();
    } catch (error) {
      console.error('Error saving poll:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar enquete',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta enquete?')) return;

    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Enquete excluída com sucesso'
      });
      
      fetchPolls();
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir enquete',
        variant: 'destructive'
      });
    }
  };

  const togglePollStatus = async (poll: Poll, field: 'is_active' | 'is_published') => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({ [field]: !poll[field] })
        .eq('id', poll.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Enquete ${!poll[field] ? 'ativada' : 'desativada'} com sucesso`
      });
      
      fetchPolls();
    } catch (error) {
      console.error('Error updating poll:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar enquete',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Enquetes</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Enquete
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPoll ? 'Editar Enquete' : 'Nova Enquete'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da enquete"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional da enquete"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">Data de Encerramento</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Opções da Enquete *</Label>
                <div className="space-y-2 mt-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.options.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Opção
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_published">Publicada</Label>
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Ativa</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editingPoll ? 'Atualizar' : 'Criar'} Enquete
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {polls.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Vote className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma enquete encontrada</h3>
              <p className="text-muted-foreground">Crie sua primeira enquete para começar.</p>
            </CardContent>
          </Card>
        ) : (
          polls.map(poll => {
            const options = pollOptions[poll.id] || [];
            const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);
            
            return (
              <Card key={poll.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{poll.title}</CardTitle>
                      {poll.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {poll.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge variant={poll.is_published ? "default" : "secondary"}>
                        {poll.is_published ? "Publicada" : "Rascunho"}
                      </Badge>
                      <Badge variant={poll.is_active ? "default" : "secondary"}>
                        {poll.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Opções ({totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}):
                      </p>
                      <div className="space-y-1">
                        {options.map(option => (
                          <div key={option.id} className="flex justify-between text-sm">
                            <span>{option.option_text}</span>
                            <span className="font-medium">{option.vote_count} votos</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Criada em {format(new Date(poll.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      {poll.end_date && (
                        <span>
                          Encerra em {format(new Date(poll.end_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(poll)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePollStatus(poll, 'is_published')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {poll.is_published ? 'Despublicar' : 'Publicar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePollStatus(poll, 'is_active')}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        {poll.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(poll.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};