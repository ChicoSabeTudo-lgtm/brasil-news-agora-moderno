import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Pencil, Trash2, Calendar as CalendarIcon, FileText, Download } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAdvertisements } from '@/hooks/useAdvertisements';
import { useFinanceData } from '@/hooks/useFinance';
import NewAdvertisementModal from './NewAdvertisementModal';
import { Textarea } from '@/components/ui/textarea';
import { downloadAdvertisementsReport } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';

const AD_TYPE_LABELS = {
  banner: 'Banner',
  reportagem: 'Reportagem',
  rede_social: 'Rede Social',
};

export function AdvertisementsManagement() {
  const { advertisements, updateAdvertisement, deleteAdvertisement } = useAdvertisements();
  const { contacts } = useFinanceData();
  const [openNew, setOpenNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    contact_id: '',
    ad_type: 'banner' as 'banner' | 'reportagem' | 'rede_social',
    start_date: new Date(),
    end_date: new Date(),
    link: '',
    notes: '',
  });

  const clients = contacts.filter(c => c.type === 'cliente');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Função para obter o primeiro e último dia do mês atual
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  };

  // Inicializar com o mês atual
  useEffect(() => {
    const currentMonth = getCurrentMonthRange();
    setDateRange(currentMonth);
  }, []);

  const currency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (d: string) => {
    // Garantir que a data seja interpretada como local (sem conversão de timezone)
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const filteredAds = advertisements
    .filter((ad) => {
      // Filtro por tipo
      if (filterType !== 'all' && ad.ad_type !== filterType) return false;
      
      // Filtro por cliente
      if (filterClient !== 'all' && ad.contact_id !== filterClient) return false;
      
      // Filtro por período
      if (dateRange.from && dateRange.to) {
        const adStartDate = new Date(ad.start_date);
        const adEndDate = new Date(ad.end_date);
        const filterStart = new Date(dateRange.from);
        const filterEnd = new Date(dateRange.to);
        
        // Verificar se há sobreposição entre o período da propaganda e o filtro
        const hasOverlap = (adStartDate <= filterEnd && adEndDate >= filterStart);
        if (!hasOverlap) return false;
      }
      
      // Filtro por busca de texto (nome do cliente)
      if (!searchQuery) return true;
      const needle = searchQuery.toLowerCase();
      return ad.client_name.toLowerCase().includes(needle);
    });

  const handleEdit = (ad: typeof advertisements[0]) => {
    setEditingId(ad.id);
    
    // Criar datas locais sem conversão de timezone
    const startDate = new Date(ad.start_date + 'T12:00:00');
    const endDate = new Date(ad.end_date + 'T12:00:00');
    
    setEditForm({
      contact_id: ad.contact_id || '',
      ad_type: ad.ad_type,
      start_date: startDate,
      end_date: endDate,
      link: ad.link || '',
      notes: ad.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      const selectedClient = clients.find(c => c.id === editForm.contact_id);
      await updateAdvertisement(editingId, {
        contact_id: editForm.contact_id,
        client_name: selectedClient?.name || '',
        ad_type: editForm.ad_type,
        start_date: format(editForm.start_date, 'yyyy-MM-dd'),
        end_date: format(editForm.end_date, 'yyyy-MM-dd'),
        link: editForm.link || null,
        notes: editForm.notes || null,
      });
      setEditingId(null);
    }
  };

  const totalAds = filteredAds.length;
  const activeAds = filteredAds.filter(ad => {
    const now = new Date();
    const start = new Date(ad.start_date);
    const end = new Date(ad.end_date);
    return start <= now && end >= now;
  }).length;

  // Função para gerar relatório PDF
  const handleGenerateReport = async () => {
    if (filteredAds.length === 0) {
      toast({
        title: 'Nenhuma propaganda encontrada',
        description: 'Não há propagandas para gerar o relatório com os filtros atuais.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const selectedClient = clients.find(c => c.id === filterClient);
      const clientName = selectedClient ? selectedClient.name : 'Todos os Clientes';
      
      // Validar dados antes de gerar
      if (!clientName || !dateRange.from || !dateRange.to) {
        throw new Error('Dados incompletos para gerar o relatório');
      }
      
      const reportData = {
        advertisements: filteredAds,
        clientName,
        period: {
          from: dateRange.from,
          to: dateRange.to,
        },
        generatedAt: new Date(),
      };

      // Mostrar loading
      toast({
        title: 'Gerando relatório...',
        description: 'Por favor, aguarde enquanto o PDF é criado.',
      });

      // Gerar relatório
      await new Promise(resolve => setTimeout(resolve, 100)); // Pequeno delay para mostrar o toast
      downloadAdvertisementsReport(reportData);
      
      toast({
        title: 'Relatório gerado com sucesso',
        description: `Relatório PDF de ${filteredAds.length} propagandas foi baixado.`,
      });
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: error?.message || 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Propagandas</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleGenerateReport}
            disabled={filteredAds.length === 0}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Gerar Relatório PDF
          </Button>
          <Button onClick={() => setOpenNew(true)}>+ Nova Propaganda</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total de Propagandas</div>
            <div className="text-2xl font-bold">{totalAds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Ativas Este Mês</div>
            <div className="text-2xl font-bold text-green-600">{activeAds}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Filtros de busca */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Buscar por nome do cliente" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="banner">Banner</SelectItem>
              <SelectItem value="reportagem">Reportagem</SelectItem>
              <SelectItem value="rede_social">Rede Social</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de período */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2">
            <Label>Período</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "dd/MM/yyyy", { locale: ptBR }) : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span className="flex items-center text-muted-foreground">até</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateRange.to && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "dd/MM/yyyy", { locale: ptBR }) : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              const currentMonth = getCurrentMonthRange();
              setDateRange(currentMonth);
            }}
          >
            Mês Atual
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setDateRange({ from: undefined, to: undefined });
              setFilterType('all');
              setFilterClient('all');
              setSearchQuery('');
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma propaganda encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredAds.map((ad) => {
                  const now = new Date();
                  const start = new Date(ad.start_date);
                  const end = new Date(ad.end_date);
                  const isActive = start <= now && end >= now;
                  const isPending = start > now;
                  
                  return (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.client_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{AD_TYPE_LABELS[ad.ad_type]}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(ad.start_date)}</TableCell>
                      <TableCell className="text-sm">{formatDate(ad.end_date)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {ad.link ? (
                          <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {ad.link}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive ? 'default' : isPending ? 'secondary' : 'outline'}>
                          {isActive ? 'Ativa' : isPending ? 'Pendente' : 'Finalizada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(ad)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir propaganda?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteAdvertisement(ad.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Editar Propaganda</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={editForm.contact_id} onValueChange={(v) => setEditForm({ ...editForm, contact_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Tipo de Propaganda</Label>
              <Select value={editForm.ad_type} onValueChange={(v: any) => setEditForm({ ...editForm, ad_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="reportagem">Reportagem</SelectItem>
                  <SelectItem value="rede_social">Rede Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(editForm.start_date, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editForm.start_date}
                      onSelect={(date) => date && setEditForm({ ...editForm, start_date: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label>Data Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(editForm.end_date, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editForm.end_date}
                      onSelect={(date) => date && setEditForm({ ...editForm, end_date: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Link da Propaganda</Label>
              <Input 
                type="url"
                value={editForm.link} 
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })} 
              />
            </div>

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea 
                value={editForm.notes} 
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} 
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewAdvertisementModal open={openNew} onOpenChange={setOpenNew} />
    </div>
  );
}

export default AdvertisementsManagement;
