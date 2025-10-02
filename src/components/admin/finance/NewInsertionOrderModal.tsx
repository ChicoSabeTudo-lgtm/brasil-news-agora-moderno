import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useInsertionOrders } from '@/hooks/useInsertionOrders';
import { useFinanceData } from '@/hooks/useFinance';
import { toast } from '@/hooks/use-toast';
import { InsertionOrderAttachments } from './InsertionOrderAttachments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrder?: any;
};

export default function NewInsertionOrderModal({ open, onOpenChange, editingOrder }: Props) {
  const { addOrder, updateOrder } = useInsertionOrders();
  const { contacts } = useFinanceData();
  const [saving, setSaving] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(editingOrder?.id);
  const [form, setForm] = useState({
    pi_number: '',
    contact_id: '',
    vehicle: '',
    value: '',
    start_date: new Date(),
    end_date: new Date(),
    payment_status: 'Pendente' as 'Pendente' | 'Pago',
    email_sent: false,
    notes: '',
  });

  useEffect(() => {
    if (editingOrder) {
      setCurrentOrderId(editingOrder.id);
      setForm({
        pi_number: editingOrder.pi_number || '',
        contact_id: editingOrder.contact_id || '',
        vehicle: editingOrder.vehicle || '',
        value: editingOrder.value?.toString() || '',
        start_date: new Date(editingOrder.start_date),
        end_date: new Date(editingOrder.end_date),
        payment_status: editingOrder.payment_status || 'Pendente',
        email_sent: editingOrder.email_sent || false,
        notes: editingOrder.notes || '',
      });
    } else {
      setCurrentOrderId(undefined);
    }
  }, [editingOrder]);

  const clients = contacts.filter(c => c.type === 'cliente');
  const canSave = form.pi_number.trim().length > 0 && form.vehicle.trim().length > 0 && form.value && !saving;

  const handleCreate = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload = {
        pi_number: form.pi_number,
        contact_id: form.contact_id || null,
        vehicle: form.vehicle,
        value: parseFloat(form.value),
        start_date: format(form.start_date, 'yyyy-MM-dd'),
        end_date: format(form.end_date, 'yyyy-MM-dd'),
        payment_status: form.payment_status,
        email_sent: form.email_sent,
        notes: form.notes || null,
      };

      if (editingOrder) {
        await updateOrder(editingOrder.id, payload);
        toast({ title: 'PI atualizado', description: `${form.pi_number} atualizado com sucesso.` });
      } else {
        const newOrder = await addOrder(payload);
        setCurrentOrderId(newOrder.id);
        toast({ title: 'PI criado', description: `${form.pi_number} criado com sucesso. Agora você pode adicionar anexos.` });
      }
      
      if (!editingOrder) {
        // Não fecha o modal se for criação para permitir adicionar anexos
        // onOpenChange(false);
      }
    } catch (e: any) {
      toast({ title: 'Erro ao salvar PI', description: e?.message || 'Tente novamente.', variant: 'destructive' });
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingOrder ? 'Editar PI' : 'Novo PI'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="attachments" disabled={!currentOrderId}>
              Anexos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label>Número PI *</Label>
                <Input 
                  placeholder="PI-2025-001" 
                  value={form.pi_number} 
                  onChange={(e) => setForm({ ...form, pi_number: e.target.value })} 
                />
              </div>

              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select value={form.contact_id} onValueChange={(v) => setForm({ ...form, contact_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Veículo *</Label>
                <Input 
                  placeholder="Jornal, TV, Rádio, etc." 
                  value={form.vehicle} 
                  onChange={(e) => setForm({ ...form, vehicle: e.target.value })} 
                />
              </div>

              <div className="space-y-1.5">
                <Label>Valor *</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  value={form.value} 
                  onChange={(e) => setForm({ ...form, value: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Data Início *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.start_date ? format(form.start_date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.start_date}
                        onSelect={(date) => date && setForm({ ...form, start_date: date })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label>Data Fim *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.end_date ? format(form.end_date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.end_date}
                        onSelect={(date) => date && setForm({ ...form, end_date: date })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Status de Pagamento</Label>
                <Select value={form.payment_status} onValueChange={(v: any) => setForm({ ...form, payment_status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email_sent" 
                  checked={form.email_sent} 
                  onCheckedChange={(checked) => setForm({ ...form, email_sent: checked === true })} 
                />
                <Label htmlFor="email_sent" className="cursor-pointer">Email Enviado</Label>
              </div>

              <div className="space-y-1.5">
                <Label>Observações</Label>
                <Textarea 
                  placeholder="Observações adicionais sobre o PI" 
                  value={form.notes} 
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attachments">
            <InsertionOrderAttachments orderId={currentOrderId} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {currentOrderId ? 'Fechar' : 'Cancelar'}
          </Button>
          <Button onClick={handleCreate} disabled={!canSave}>
            {saving ? 'Salvando...' : editingOrder ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
