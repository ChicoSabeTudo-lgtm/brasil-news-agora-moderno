import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFinanceData } from '@/hooks/useFinance';
import { Button as ShButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function ClientsManagement() {
  const { contacts, transactions, createContact, updateContact, deleteContact } = useFinanceData();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const clients = contacts.filter(c => c.type === 'cliente');
  const selectedTx = useMemo(() => transactions.filter(t => t.contact_id === selected), [transactions, selected]);

  const currency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clientes / Receita</h2>
      </div>

      <Card>
        <CardHeader><CardTitle>Novo Cliente</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Nome do cliente" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={async () => { if (name) { const c = await createContact(name, 'cliente'); setSelected(c.id); setName(''); } }}>Adicionar</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Clientes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Receitas</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {clients.map(c => {
                  const total = transactions.filter(t => t.contact_id === c.id && t.type === 'receita').reduce((a, t) => a + Number(t.value || 0), 0);
                  return (
                    <TableRow key={c.id} className={selected===c.id? 'bg-accent' : ''}>
                      <TableCell onClick={() => setSelected(c.id)} className="cursor-pointer">{c.name}</TableCell>
                      <TableCell onClick={() => setSelected(c.id)} className="cursor-pointer">{currency(total)}</TableCell>
                      <TableCell className="space-x-2">
                        <ShButton size="sm" variant="outline" onClick={() => { setEditingId(c.id); setEditingName(c.name); }}>Editar</ShButton>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <ShButton size="sm" variant="destructive">Excluir</ShButton>
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Transações do Cliente</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Valor</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {selectedTx.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>{currency(Number(t.value))}</TableCell>
                    <TableCell>{new Date(t.due_date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{t.status}</TableCell>
                  </TableRow>
                ))}
                {selectedTx.length===0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Selecione um cliente para ver lançamentos</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
    </div>
  );
}

export default ClientsManagement;
