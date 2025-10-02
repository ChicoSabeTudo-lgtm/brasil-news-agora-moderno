import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFinanceData } from '@/hooks/useFinance';
import { Button as ShButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Pencil, Trash2, Search, Mail, Phone, User, Building2 } from 'lucide-react';
import NewClientModal from './NewClientModal';

export function ClientsManagement() {
  const { contacts, transactions, createContact, updateContact, deleteContact } = useFinanceData();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [openNew, setOpenNew] = useState(false);
  const [q, setQ] = useState('');

  const clients = contacts
    .filter(c => c.type === 'cliente')
    .filter(c => {
      if (!q) return true;
      const needle = q.toLowerCase();
      return (
        c.name?.toLowerCase().includes(needle) ||
        (c.email || '').toLowerCase().includes(needle) ||
        (c.company || '').toLowerCase().includes(needle) ||
        (c.contact_person || '').toLowerCase().includes(needle)
      );
    });
  const selectedTx = useMemo(() => transactions.filter(t => t.contact_id === selected), [transactions, selected]);

  const currency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clientes / Receita</h2>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clientes / Receita</h2>
        <Button onClick={() => setOpenNew(true)}>+ Novo Cliente</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar clientes por nome, email, empresa ou pessoa de contato" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map((c) => {
          const total = transactions.filter(t => t.contact_id === c.id && t.type === 'receita').reduce((a, t) => a + Number(t.value || 0), 0);
          return (
            <Card key={c.id} className="hover:shadow-sm transition">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="w-4 h-4 cursor-pointer" onClick={() => setSelected(c.id)} />
                    <Pencil className="w-4 h-4 cursor-pointer" onClick={() => { setEditingId(c.id); setEditingName(c.name); }} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Trash2 className="w-4 h-4 cursor-pointer" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={async () => { await deleteContact(c.id); if (selected===c.id) setSelected(null); }}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {c.company && (
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> {c.company}</div>
                )}
                {c.contact_person && (
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /> {c.contact_person}</div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {c.email}</div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {c.phone}</div>
                )}
                <div className="pt-2 text-xs">{c.created_at ? `Cadastrado em ${new Date(c.created_at).toLocaleDateString('pt-BR')}` : ''}</div>
                <div className="pt-1 text-primary font-medium">Total em receitas: {currency(total)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
          <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
          <DialogFooter>
            <ShButton variant="outline" onClick={() => setEditingId(null)}>Cancelar</ShButton>
            <ShButton onClick={async () => { if (editingId) { await updateContact(editingId, { name: editingName }); setEditingId(null); } }}>Salvar</ShButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New client modal */}
      <NewClientModal open={openNew} onOpenChange={setOpenNew} />
    </div>
  );
}

export default ClientsManagement;
