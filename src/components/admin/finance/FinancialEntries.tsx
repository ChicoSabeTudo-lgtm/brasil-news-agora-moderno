import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingDown, TrendingUp, Calendar, Eye, Edit } from 'lucide-react';

type TxType = 'receita' | 'despesa';
type TxStatus = 'Pendente' | 'Pago' | 'Atrasado';

interface Transaction {
  id: number;
  type: TxType;
  description: string;
  value: number;
  dueDate: string; // ISO date
  payDate?: string;
  status: TxStatus;
  supplier?: string;
  project?: string;
  method?: string;
  category?: string;
  receiptUrl?: string;
}

const currency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function FinancialEntries() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TxType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TxStatus>('all');
  const [projectFilter, setProjectFilter] = useState<'all' | string>('all');

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      type: 'despesa',
      description: 'CONSELHO REGIONAL DE ENGENHARIA',
      value: 308.58,
      dueDate: new Date().toISOString().slice(0, 10),
      status: 'Pago',
      project: 'Portal',
      category: 'Outras Despesas',
    },
  ]);

  const [form, setForm] = useState<Omit<Transaction, 'id'>>({
    type: 'receita',
    description: '',
    value: 0,
    dueDate: '',
    status: 'Pendente',
    supplier: '',
    project: '',
    method: '',
    category: '',
    payDate: '',
    receiptUrl: '',
  });

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (projectFilter !== 'all' && (t.project || '') !== projectFilter) return false;
      if (search && !`${t.description}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, typeFilter, statusFilter, projectFilter, search]);

  const summary = useMemo(() => {
    const received = transactions
      .filter((t) => t.type === 'receita' && t.status === 'Pago')
      .reduce((acc, t) => acc + t.value, 0);
    const paid = transactions
      .filter((t) => t.type === 'despesa' && t.status === 'Pago')
      .reduce((acc, t) => acc + t.value, 0);
    const receivable = transactions
      .filter((t) => t.type === 'receita' && t.status !== 'Pago')
      .reduce((acc, t) => acc + t.value, 0);
    const payable = transactions
      .filter((t) => t.type === 'despesa' && t.status !== 'Pago')
      .reduce((acc, t) => acc + t.value, 0);
    return { received, paid, receivable, payable };
  }, [transactions]);

  const addTransaction = () => {
    const next: Transaction = { id: Date.now(), ...form, value: Number(form.value) } as Transaction;
    setTransactions((prev) => [next, ...prev]);
    setOpen(false);
    setForm({
      type: 'receita',
      description: '',
      value: 0,
      dueDate: '',
      status: 'Pendente',
      supplier: '',
      project: '',
      method: '',
      category: '',
      payDate: '',
      receiptUrl: '',
    });
  };

  const StatusBadge = ({ status }: { status: TxStatus }) => (
    <Badge variant={status === 'Pago' ? 'secondary' : status === 'Pendente' ? 'default' : 'destructive'}>
      {status}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lançamentos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">+ Nova Transação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 flex gap-2">
                <Button
                  variant={form.type === 'receita' ? 'default' : 'outline'}
                  onClick={() => setForm((f) => ({ ...f, type: 'receita' }))}
                  className="flex-1"
                >
                  $ Receita
                </Button>
                <Button
                  variant={form.type === 'despesa' ? 'destructive' : 'outline'}
                  onClick={() => setForm((f) => ({ ...f, type: 'despesa' }))}
                  className="flex-1"
                >
                  $ Despesa
                </Button>
              </div>

              <div className="col-span-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Descrição da transação"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Data de Vencimento</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: TxStatus) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data de Pagamento</Label>
                <Input type="date" value={form.payDate} onChange={(e) => setForm((f) => ({ ...f, payDate: e.target.value }))} />
              </div>

              <div>
                <Label>Fornecedor/Despesa</Label>
                <Input value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))} />
              </div>
              <div>
                <Label>Projeto</Label>
                <Select value={form.project} onValueChange={(v) => setForm((f) => ({ ...f, project: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    <SelectItem value="Portal">Portal</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Método de Pagamento</Label>
                <Select value={form.method} onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Outras Despesas">Outras Despesas</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Assinaturas">Assinaturas</SelectItem>
                    <SelectItem value="Publicidade">Publicidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label>Comprovantes e Documentos</Label>
                <div className="mt-2 rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Clique para selecionar ou arraste arquivos aqui
                  <Input type="file" multiple className="mt-3" />
                </div>
              </div>

              <div className="col-span-2">
                <Label>URL do Comprovante (opcional)</Label>
                <Input placeholder="https://exemplo.com/comprovante.pdf" value={form.receiptUrl} onChange={(e) => setForm((f) => ({ ...f, receiptUrl: e.target.value }))} />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={addTransaction}>Criar Transação</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Receitas Recebidas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-2xl font-semibold text-emerald-600">
            <DollarSign className="w-5 h-5" />
            {currency(summary.received)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Despesas Pagas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-2xl font-semibold text-red-600">
            <TrendingDown className="w-5 h-5" />
            {currency(summary.paid)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">A Receber</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-2xl font-semibold text-blue-600">
            <Calendar className="w-5 h-5" />
            {currency(summary.receivable)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">A Pagar</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-2xl font-semibold text-orange-600">
            <Calendar className="w-5 h-5" />
            {currency(summary.payable)}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input placeholder="Buscar transações..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="flex flex-wrap gap-3">
            <Select defaultValue="mes">
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Período" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Mês atual</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v: 'all' | TxType) => setTypeFilter(v)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v: 'all' | TxStatus) => setStatusFilter(v)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={(v) => setProjectFilter(v)}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Projeto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                <SelectItem value="Portal">Portal</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions table */}
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Relacionado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhuma transação encontrada
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className={t.type === 'despesa' ? 'text-red-600' : 'text-emerald-600'}>
                    {t.type === 'despesa' ? 'Despesa' : 'Receita'}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{t.description}</div>
                    <div className="text-xs text-muted-foreground">Categoria: {t.category || '-'}</div>
                  </TableCell>
                  <TableCell className={t.type === 'despesa' ? 'text-red-600' : ''}>
                    {t.type === 'despesa' ? '-' : ''}
                    {currency(t.value)}
                  </TableCell>
                  <TableCell>{new Date(t.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell>{t.project || '-'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

