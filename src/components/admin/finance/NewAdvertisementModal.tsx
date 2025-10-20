import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAdvertisements } from '@/hooks/useAdvertisements';
import { useFinanceData } from '@/hooks/useFinance';
import { toast } from '@/hooks/use-toast';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NewAdvertisementModal({ open, onOpenChange }: Props) {
  const { addAdvertisement } = useAdvertisements();
  const { contacts } = useFinanceData();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    contact_id: '',
    ad_type: 'banner' as 'banner' | 'reportagem' | 'rede_social',
    start_date: new Date(),
    end_date: new Date(),
    link: '',
    notes: '',
  });

  const clients = contacts.filter(c => c.type === 'cliente');

  const canSave = form.contact_id.trim().length > 0 && !saving;

  const handleCreate = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const selectedClient = clients.find(c => c.id === form.contact_id);
      await addAdvertisement({
        contact_id: form.contact_id,
        client_name: selectedClient?.name || '',
        ad_type: form.ad_type,
        start_date: format(form.start_date, 'yyyy-MM-dd'),
        end_date: format(form.end_date, 'yyyy-MM-dd'),
        link: form.link || null,
        notes: form.notes || null,
      });
      toast({ title: 'Propaganda criada', description: `${selectedClient?.name} adicionado com sucesso.` });
      onOpenChange(false);
      setForm({
        contact_id: '',
        ad_type: 'banner',
        start_date: new Date(),
        end_date: new Date(),
        link: '',
        notes: '',
      });
    } catch (e: any) {
      toast({ title: 'Erro ao criar propaganda', description: e?.message || 'Tente novamente.', variant: 'destructive' });
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Propaganda</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label>Cliente *</Label>
            {clients.length === 0 ? (
              <div className="border border-dashed border-muted-foreground/25 rounded-md p-4 text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  Nenhum cliente cadastrado ainda
                </div>
                <div className="text-xs text-muted-foreground">
                  Acesse a aba "Clientes" no painel financeiro para cadastrar clientes antes de criar propagandas.
                </div>
              </div>
            ) : (
              <Select value={form.contact_id} onValueChange={(v) => setForm({ ...form, contact_id: v })}>
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
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de Propaganda *</Label>
            <Select value={form.ad_type} onValueChange={(v: any) => setForm({ ...form, ad_type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="reportagem">Reportagem</SelectItem>
                <SelectItem value="rede_social">Rede Social</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data de Início *</Label>
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
              <Label>Data Final *</Label>
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
            <Label>Link da Propaganda</Label>
            <Input 
              type="url"
              placeholder="https://exemplo.com/propaganda" 
              value={form.link} 
              onChange={(e) => setForm({ ...form, link: e.target.value })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea 
              placeholder="Observações sobre a propaganda" 
              value={form.notes} 
              onChange={(e) => setForm({ ...form, notes: e.target.value })} 
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!canSave}>{saving ? 'Criando...' : 'Criar Propaganda'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
