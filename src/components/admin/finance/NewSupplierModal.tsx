import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Mail, Phone, User, Building2, Info } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinance';
import { toast } from '@/components/ui/use-toast';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NewSupplierModal({ open, onOpenChange }: Props) {
  const { createContact } = useFinanceData();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    contact_person: '',
    email: '',
    phone: '',
  });

  const canSave = form.name.trim().length > 0 && !saving;

  const handleCreate = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await createContact(form.name, 'fornecedor', {
        email: form.email || null,
        phone: form.phone || null,
        company: form.company || null,
        contact_person: form.contact_person || null,
      } as any);
      toast({ title: 'Fornecedor criado', description: `${form.name} adicionado com sucesso.` });
      onOpenChange(false);
      setForm({ name: '', company: '', contact_person: '', email: '', phone: '' });
    } catch (e: any) {
      toast({ title: 'Erro ao criar fornecedor', description: e?.message || 'Tente novamente.', variant: 'destructive' });
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Fornecedor</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><User className="w-4 h-4" /> Nome do Fornecedor *</Label>
            <Input placeholder="Nome completo ou razão social" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Building2 className="w-4 h-4" /> Empresa</Label>
            <Input placeholder="Nome da empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><User className="w-4 h-4" /> Pessoa de Contato</Label>
            <Input placeholder="Nome da pessoa responsável" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Mail className="w-4 h-4" /> Email</Label>
              <Input type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Phone className="w-4 h-4" /> Telefone</Label>
              <Input placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <Alert className="bg-accent/30 mt-1">
            <Info className="w-4 h-4" />
            <AlertTitle className="text-sm">Dica: Apenas o nome é obrigatório. Você pode adicionar as demais informações depois.</AlertTitle>
          </Alert>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!canSave}>{saving ? 'Criando...' : 'Criar Fornecedor'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
