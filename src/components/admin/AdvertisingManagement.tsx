import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building, Mail, Phone, Calendar, DollarSign, Eye, CheckCircle, Clock, User, Globe, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdvertisingRequest {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string | null;
  advertising_type: string;
  budget_range: string;
  campaign_description: string;
  status: string;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  responded_by: string | null;
}

export const AdvertisingManagement = () => {
  const [requests, setRequests] = useState<AdvertisingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AdvertisingRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('advertising_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Erro ao carregar solicitações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('advertising_requests')
        .update({ 
          status,
          responded_at: status === 'responded' ? new Date().toISOString() : null,
          responded_by: status === 'responded' ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Status atualizado com sucesso!",
      });

      fetchRequests();
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
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAdTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'banner-display': 'Banner Display',
      'conteudo-patrocinado': 'Conteúdo Patrocinado',
      'pacote-premium': 'Pacote Premium',
      'newsletter': 'Newsletter Patrocinada',
      'personalizado': 'Solução Personalizada'
    };
    return types[type] || type;
  };

  const getStats = () => {
    const pending = requests.filter(r => r.status === 'pending').length;
    const inProgress = requests.filter(r => r.status === 'in-progress').length;
    const responded = requests.filter(r => r.status === 'responded').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    
    return { pending, inProgress, responded, approved, total: requests.length };
  };

  const stats = getStats();

  if (loading) {
    return <div className="p-6 text-center">Carregando solicitações...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Building className="h-4 w-4 text-muted-foreground" />
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
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Respondidos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.responded}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Anúncios</CardTitle>
          <CardDescription>
            Gerencie todas as solicitações de anúncios recebidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      {format(new Date(request.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                      {request.company_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      {request.contact_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getAdTypeDisplay(request.advertising_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                      {request.budget_range}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Solicitação de Anúncio</DialogTitle>
                          <DialogDescription>
                            Detalhes da solicitação de publicidade
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedRequest && (
                          <div className="space-y-6">
                            {/* Company Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Empresa:</label>
                                <p className="text-sm text-muted-foreground">{selectedRequest.company_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Contato:</label>
                                <p className="text-sm text-muted-foreground">{selectedRequest.contact_name}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Email:</label>
                                <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Telefone:</label>
                                <p className="text-sm text-muted-foreground">{selectedRequest.phone}</p>
                              </div>
                            </div>

                            {selectedRequest.website && (
                              <div>
                                <label className="text-sm font-medium">Website:</label>
                                <p className="text-sm text-muted-foreground">
                                  <a 
                                    href={selectedRequest.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {selectedRequest.website}
                                  </a>
                                </p>
                              </div>
                            )}

                            {/* Campaign Details */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Tipo de Anúncio:</label>
                                <div className="mt-1">
                                  <Badge variant="outline">
                                    {getAdTypeDisplay(selectedRequest.advertising_type)}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Orçamento Mensal:</label>
                                <div className="mt-1">
                                  <Badge variant="secondary">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {selectedRequest.budget_range}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Descrição da Campanha:</label>
                              <div className="mt-2 p-4 bg-muted rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">{selectedRequest.campaign_description}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Data da Solicitação:</label>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(selectedRequest.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status Atual:</label>
                                <div className="mt-1">
                                  {getStatusBadge(selectedRequest.status)}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">Alterar Status:</label>
                              <div className="flex gap-2">
                                <Select 
                                  value={newStatus || selectedRequest.status} 
                                  onValueChange={setNewStatus}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                                    <SelectItem value="responded">Respondido</SelectItem>
                                    <SelectItem value="approved">Aprovado</SelectItem>
                                    <SelectItem value="rejected">Rejeitado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  onClick={() => {
                                    if (newStatus && newStatus !== selectedRequest.status) {
                                      updateRequestStatus(selectedRequest.id, newStatus);
                                      setNewStatus("");
                                    }
                                  }}
                                  disabled={!newStatus || newStatus === selectedRequest.status}
                                >
                                  Atualizar
                                </Button>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button asChild className="flex-1">
                                <a href={`mailto:${selectedRequest.email}?subject=Proposta Comercial - ${selectedRequest.company_name}`}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Enviar Proposta
                                </a>
                              </Button>
                              <Button variant="outline" asChild>
                                <a href={`tel:${selectedRequest.phone}`}>
                                  <Phone className="w-4 h-4 mr-2" />
                                  Ligar
                                </a>
                              </Button>
                              {selectedRequest.website && (
                                <Button variant="outline" asChild>
                                  <a href={selectedRequest.website} target="_blank" rel="noopener noreferrer">
                                    <Globe className="w-4 h-4 mr-2" />
                                    Website
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

          {requests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};