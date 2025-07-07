import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Phone, Calendar, MessageSquare, Eye, CheckCircle, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  responded_by: string | null;
}

export const ContactManagement = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          status,
          responded_at: status === 'responded' ? new Date().toISOString() : null,
          responded_by: status === 'responded' ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Status atualizado com sucesso!",
      });

      fetchMessages();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro ao atualizar status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'in-progress':
        return <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" />Em Andamento</Badge>;
      case 'responded':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Respondido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStats = () => {
    const pending = messages.filter(m => m.status === 'pending').length;
    const inProgress = messages.filter(m => m.status === 'in-progress').length;
    const responded = messages.filter(m => m.status === 'responded').length;
    
    return { pending, inProgress, responded, total: messages.length };
  };

  const stats = getStats();

  if (loading) {
    return <div className="p-6 text-center">Carregando mensagens...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-orange-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Eye className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Respondidos</p>
                <p className="text-2xl font-bold text-green-500">{stats.responded}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens de Contato</CardTitle>
          <CardDescription>
            Gerencie todas as mensagens recebidas através do formulário de contato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      {format(new Date(message.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      {message.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      {message.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={message.subject}>
                      {message.subject}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(message.status)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedMessage(message)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Mensagem de Contato</DialogTitle>
                          <DialogDescription>
                            Detalhes da mensagem recebida
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedMessage && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Nome:</label>
                                <p className="text-sm text-muted-foreground">{selectedMessage.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email:</label>
                                <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                              </div>
                            </div>

                            {selectedMessage.phone && (
                              <div>
                                <label className="text-sm font-medium">Telefone:</label>
                                <p className="text-sm text-muted-foreground">{selectedMessage.phone}</p>
                              </div>
                            )}

                            <div>
                              <label className="text-sm font-medium">Assunto:</label>
                              <p className="text-sm text-muted-foreground">{selectedMessage.subject}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Mensagem:</label>
                              <div className="mt-2 p-4 bg-muted rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Data de Envio:</label>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(selectedMessage.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status Atual:</label>
                                <div className="mt-1">
                                  {getStatusBadge(selectedMessage.status)}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">Alterar Status:</label>
                              <div className="flex gap-2">
                                <Select 
                                  value={newStatus || selectedMessage.status} 
                                  onValueChange={setNewStatus}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                                    <SelectItem value="responded">Respondido</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  onClick={() => {
                                    if (newStatus && newStatus !== selectedMessage.status) {
                                      updateMessageStatus(selectedMessage.id, newStatus);
                                      setNewStatus("");
                                    }
                                  }}
                                  disabled={!newStatus || newStatus === selectedMessage.status}
                                >
                                  Atualizar
                                </Button>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button asChild className="flex-1">
                                <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Responder por Email
                                </a>
                              </Button>
                              {selectedMessage.phone && (
                                <Button variant="outline" asChild>
                                  <a href={`tel:${selectedMessage.phone}`}>
                                    <Phone className="w-4 h-4 mr-2" />
                                    Ligar
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma mensagem encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};