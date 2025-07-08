import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Plus, 
  Radio,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  stream_url?: string;
  chat_enabled: boolean;
  is_active: boolean;
  viewer_count: number;
  scheduled_start?: string;
  thumbnail_url?: string;
  created_at: string;
}

export const LiveStreamManagement = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStream, setEditingStream] = useState<LiveStream | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stream_url: '',
    chat_enabled: true,
    is_active: false,
    scheduled_start: '',
    thumbnail_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStreams(data || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transmissões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const streamData = {
        ...formData,
        scheduled_start: formData.scheduled_start || null,
        thumbnail_url: formData.thumbnail_url || null,
        description: formData.description || null,
        stream_url: formData.stream_url || null
      };

      if (editingStream) {
        const { error } = await supabase
          .from('live_streams')
          .update(streamData)
          .eq('id', editingStream.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Transmissão atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('live_streams')
          .insert(streamData);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Transmissão criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchStreams();
    } catch (error) {
      console.error('Error saving stream:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a transmissão.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transmissão?')) return;

    try {
      const { error } = await supabase
        .from('live_streams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Transmissão excluída com sucesso!",
      });
      fetchStreams();
    } catch (error) {
      console.error('Error deleting stream:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transmissão.",
        variant: "destructive",
      });
    }
  };

  const toggleStreamStatus = async (stream: LiveStream) => {
    try {
      const { error } = await supabase
        .from('live_streams')
        .update({ 
          is_active: !stream.is_active,
          actual_start: !stream.is_active ? new Date().toISOString() : null,
          actual_end: stream.is_active ? new Date().toISOString() : null
        })
        .eq('id', stream.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Transmissão ${!stream.is_active ? 'iniciada' : 'finalizada'}!`,
      });
      fetchStreams();
    } catch (error) {
      console.error('Error toggling stream:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da transmissão.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      stream_url: '',
      chat_enabled: true,
      is_active: false,
      scheduled_start: '',
      thumbnail_url: ''
    });
    setEditingStream(null);
  };

  const openEditDialog = (stream: LiveStream) => {
    setEditingStream(stream);
    setFormData({
      title: stream.title,
      description: stream.description || '',
      stream_url: stream.stream_url || '',
      chat_enabled: stream.chat_enabled,
      is_active: stream.is_active,
      scheduled_start: stream.scheduled_start ? new Date(stream.scheduled_start).toISOString().slice(0, 16) : '',
      thumbnail_url: stream.thumbnail_url || ''
    });
    setIsDialogOpen(true);
  };

  if (loading && streams.length === 0) {
    return <div>Carregando transmissões...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciar Transmissões ao Vivo</CardTitle>
            <CardDescription>
              Configure e gerencie suas transmissões ao vivo
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Transmissão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingStream ? 'Editar Transmissão' : 'Nova Transmissão'}
                </DialogTitle>
                <DialogDescription>
                  Configure os detalhes da transmissão ao vivo
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Título *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="col-span-3"
                    placeholder="Nome da transmissão"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Descrição da transmissão"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stream_url" className="text-right">
                    URL do Stream
                  </Label>
                  <Input
                    id="stream_url"
                    value={formData.stream_url}
                    onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                    className="col-span-3"
                    placeholder="https://..."
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="thumbnail_url" className="text-right">
                    Thumbnail
                  </Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="col-span-3"
                    placeholder="URL da imagem de capa"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="scheduled_start" className="text-right">
                    Agendamento
                  </Label>
                  <Input
                    id="scheduled_start"
                    type="datetime-local"
                    value={formData.scheduled_start}
                    onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="chat_enabled" className="text-right">
                    Chat Habilitado
                  </Label>
                  <Switch
                    id="chat_enabled"
                    checked={formData.chat_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, chat_enabled: checked })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {streams.map((stream) => (
            <div key={stream.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{stream.title}</h3>
                  <Badge variant={stream.is_active ? "destructive" : "secondary"}>
                    {stream.is_active ? 'AO VIVO' : 'OFFLINE'}
                  </Badge>
                </div>
                
                {stream.description && (
                  <p className="text-sm text-muted-foreground mb-2">{stream.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {stream.scheduled_start && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(stream.scheduled_start).toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{stream.viewer_count} espectadores</span>
                  </div>
                  {stream.chat_enabled && (
                    <div className="flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      <span>Chat ativo</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={stream.is_active ? "destructive" : "default"}
                  size="sm"
                  onClick={() => toggleStreamStatus(stream)}
                >
                  {stream.is_active ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Parar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(stream)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(stream.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {streams.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transmissão configurada ainda.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};