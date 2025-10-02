import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFinanceData } from '@/hooks/useFinance';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Pencil, Trash2, Search, Mail, Phone, User, Building2, X } from 'lucide-react';
import NewSupplierModal from './NewSupplierModal';

export function SuppliersManagement() {
  const { contacts, transactions, updateContact, deleteContact } = useFinanceData();
  const [selected, setSelected] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingPhone, setEditingPhone] = useState('');
  const [editingCompany, setEditingCompany] = useState('');
  const [editingContactPerson, setEditingContactPerson] = useState('');
  const [openNew, setOpenNew] = useState(false);
  const [q, setQ] = useState('');

  const suppliers = contacts
    .filter(c => c.type === 'fornecedor')
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
  const selectedSupplier = contacts.find(c => c.id === selected);

  const currency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  const handleEdit = (supplier: typeof contacts[0]) => {
    setEditingId(supplier.id);
    setEditingName(supplier.name);
    setEditingEmail(supplier.email || '');
    setEditingPhone(supplier.phone || '');
    setEditingCompany(supplier.company || '');
    setEditingContactPerson(supplier.contact_person || '');
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      await updateContact(editingId, { 
        name: editingName,
        email: editingEmail || null,
        phone: editingPhone || null,
        company: editingCompany || null,
        contact_person: editingContactPerson || null
      });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Fornecedores / Despesa</h2>
        <Button onClick={() => setOpenNew(true)}>+ Novo Fornecedor</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar fornecedores por nome, email, empresa ou pessoa de contato" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {suppliers.map((s) => {
          const total = transactions.filter(t => t.contact_id === s.id && t.type === 'despesa').reduce((a, t) => a + Number(t.value || 0), 0);
          return (
            <Card key={s.id} className="hover:shadow-sm transition">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{s.name}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="w-4 h-4 cursor-pointer hover:text-primary transition" onClick={() => setSelected(s.id)} />
                    <Pencil className="w-4 h-4 cursor-pointer hover:text-primary transition" onClick={() => handleEdit(s)} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Trash2 className="w-4 h-4 cursor-pointer hover:text-destructive transition" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={async () => { await deleteContact(s.id); if (selected===s.id) setSelected(null); }}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {s.company && (
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> {s.company}</div>
                )}
                {s.contact_person && (
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /> {s.contact_person}</div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {s.email}</div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {s.phone}</div>
                )}
                <div className="pt-2 text-xs">{s.created_at ? `Cadastrado em ${new Date(s.created_at).toLocaleDateString('pt-BR')}` : ''}</div>
                <div className="pt-1 text-destructive font-medium">Total em despesas: {currency(total)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Editar Fornecedor</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome do Fornecedor</Label>
              <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editingEmail} onChange={(e) => setEditingEmail(e.target.value)} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={editingPhone} onChange={(e) => setEditingPhone(e.target.value)} />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input value={editingCompany} onChange={(e) => setEditingCompany(e.target.value)} />
            </div>
            <div>
              <Label>Pessoa de Contato</Label>
              <Input value={editingContactPerson} onChange={(e) => setEditingContactPerson(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Transactions Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">{selectedSupplier?.name}</DialogTitle>
                {selectedSupplier?.company && <p className="text-sm text-muted-foreground mt-1">{selectedSupplier.company}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total em Despesas</div>
                  <div className="text-2xl font-bold text-destructive">
                    {currency(selectedTx.filter(t => t.type === 'despesa').reduce((a, t) => a + Number(t.value || 0), 0))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Pago</div>
                  <div className="text-2xl font-bold text-green-600">
                    {currency(selectedTx.filter(t => t.status === 'Pago').reduce((a, t) => a + Number(t.value || 0), 0))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Pendente</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {currency(selectedTx.filter(t => t.status === 'Pendente').reduce((a, t) => a + Number(t.value || 0), 0))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <div>
              <h3 className="font-semibold mb-3">Histórico de Transações ({selectedTx.length})</h3>
              <div className="border rounded-lg overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Método</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTx.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhuma transação registrada para este fornecedor
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedTx.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm">{tx.created_at ? formatDate(tx.created_at) : formatDate(tx.due_date)}</TableCell>
                          <TableCell className="font-medium">{tx.description}</TableCell>
                          <TableCell className="font-semibold text-destructive">{currency(Number(tx.value))}</TableCell>
                          <TableCell className="text-sm">{formatDate(tx.due_date)}</TableCell>
                          <TableCell>
                            <Badge variant={tx.status === 'Pago' ? 'default' : tx.status === 'Atrasado' ? 'destructive' : 'secondary'}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{tx.method || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New supplier modal */}
      <NewSupplierModal open={openNew} onOpenChange={setOpenNew} />
    </div>
  );
}

export default SuppliersManagement;
