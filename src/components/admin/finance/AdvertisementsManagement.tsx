import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Pencil, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAdvertisements } from '@/hooks/useAdvertisements';
import NewAdvertisementModal from './NewAdvertisementModal';
import { Textarea } from '@/components/ui/textarea';

const AD_TYPE_LABELS = {
  banner: 'Banner',
  reportagem: 'Reportagem',
  rede_social: 'Rede Social',
};

export function AdvertisementsManagement() {
  const { advertisements, updateAdvertisement, deleteAdvertisement } = useAdvertisements();
  const [openNew, setOpenNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    client_name: '',
    ad_type: 'banner' as 'banner' | 'reportagem' | 'rede_social',
    start_date: new Date(),
    end_date: new Date(),
    value: '',
    notes: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const currency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  const filteredAds = advertisements
    .filter((ad) => {
      if (filterType !== 'all' && ad.ad_type !== filterType) return false;
      if (!searchQuery) return true;
      const needle = searchQuery.toLowerCase();
      return ad.client_name.toLowerCase().includes(needle);
    });

  const handleEdit = (ad: typeof advertisements[0]) => {
    setEditingId(ad.id);
    setEditForm({
      client_name: ad.client_name,
      ad_type: ad.ad_type,
      start_date: new Date(ad.start_date),
      end_date: new Date(ad.end_date),
      value: ad.value?.toString() || '',
      notes: ad.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      await updateAdvertisement(editingId, {
        client_name: editForm.client_name,
        ad_type: editForm.ad_type,
        start_date: format(editForm.start_date, 'yyyy-MM-dd'),
        end_date: format(editForm.end_date, 'yyyy-MM-dd'),
        value: editForm.value ? parseFloat(editForm.value) : null,
        notes: editForm.notes || null,
      });
      setEditingId(null);
    }
  };

  const totalValue = filteredAds.reduce((sum, ad) => sum + (ad.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Propagandas</h2>
        <Button onClick={() => setOpenNew(true)}>+ Nova Propaganda</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total de Propagandas</div>
            <div className="text-2xl font-bold">{filteredAds.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Valor Total</div>
            <div className="text-2xl font-bold text-primary">{currency(totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Ativas Este Mês</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredAds.filter(ad => {
                const now = new Date();
                const start = new Date(ad.start_date);
                const end = new Date(ad.end_date);
                return start <= now && end >= now;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

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
                <TableHead>Valor</TableHead>
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
                      <TableCell className="font-semibold">{ad.value ? currency(ad.value) : '-'}</TableCell>
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
              <Label>Nome do Cliente</Label>
              <Input 
                value={editForm.client_name} 
                onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })} 
              />
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
              <Label>Valor (R$)</Label>
              <Input 
                type="number" 
                step="0.01"
                value={editForm.value} 
                onChange={(e) => setEditForm({ ...editForm, value: e.target.value })} 
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
