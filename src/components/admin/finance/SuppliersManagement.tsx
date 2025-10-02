import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFinanceData } from '@/hooks/useFinance';

export function SuppliersManagement() {
  const { contacts, transactions, createContact } = useFinanceData();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const suppliers = contacts.filter(c => c.type === 'fornecedor');
  const selectedTx = useMemo(() => transactions.filter(t => t.contact_id === selected), [transactions, selected]);

  const currency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Fornecedores / Despesa</h2>
      </div>

      <Card>
        <CardHeader><CardTitle>Novo Fornecedor</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Nome do fornecedor" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={async () => { if (name) { const c = await createContact(name, 'fornecedor'); setSelected(c.id); setName(''); } }}>Adicionar</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Fornecedores</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Despesas</TableHead></TableRow></TableHeader>
              <TableBody>
                {suppliers.map(c => {
                  const total = transactions.filter(t => t.contact_id === c.id && t.type === 'despesa').reduce((a, t) => a + Number(t.value || 0), 0);
                  return (
                    <TableRow key={c.id} className={selected===c.id? 'bg-accent' : ''} onClick={() => setSelected(c.id)}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{currency(total)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Transações do Fornecedor</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Valor</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {selectedTx.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.description}</TableCell>
                    <TableCell className="text-red-600">-{currency(Number(t.value))}</TableCell>
                    <TableCell>{new Date(t.due_date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{t.status}</TableCell>
                  </TableRow>
                ))}
                {selectedTx.length===0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Selecione um fornecedor para ver lançamentos</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SuppliersManagement;

