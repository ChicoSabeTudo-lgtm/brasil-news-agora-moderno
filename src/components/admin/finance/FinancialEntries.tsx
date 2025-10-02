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
import { Calendar as DayPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DateRange } from 'react-day-picker';
import { useFinanceData, type FinanceTransaction, type TxStatus, type TxType } from '@/hooks/useFinance';
import NewTransactionModal from './NewTransactionModal';

const currency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function FinancialEntries() {
  const { transactions, addTransaction, updateTransaction, projects, categories, contacts } = useFinanceData();
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<FinanceTransaction | null>(null);
  const [editing, setEditing] = useState<FinanceTransaction | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TxType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TxStatus>('all');
  const [projectFilter, setProjectFilter] = useState<'all' | string>('all');
  const [range, setRange] = useState<DateRange | undefined>();

  // Local form removed; handled by modal component

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (projectFilter !== 'all' && (t.project_id || '') !== projectFilter) return false;
      if (range?.from || range?.to) {
        const d = new Date(t.due_date);
        if (range?.from && d < new Date(range.from.setHours(0,0,0,0))) return false;
        if (range?.to && d > new Date(range.to.setHours(23,59,59,999))) return false;
      }
      if (search && !`${t.description}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, typeFilter, statusFilter, projectFilter, search]);

  const summary = useMemo(() => {
    const received = transactions
      .filter((t) => t.type === 'receita' && t.status === 'Pago')
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const paid = transactions
      .filter((t) => t.type === 'despesa' && t.status === 'Pago')
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const receivable = transactions
      .filter((t) => t.type === 'receita' && t.status !== 'Pago')
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const payable = transactions
      .filter((t) => t.type === 'despesa' && t.status !== 'Pago')
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    return { received, paid, receivable, payable };
  }, [transactions]);

  const handleCreated = () => setOpen(false);

  const StatusBadge = ({ status }: { status: TxStatus }) => (
    <Badge variant={status === 'Pago' ? 'secondary' : status === 'Pendente' ? 'default' : 'destructive'}>
      {status}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lançamentos</h2>
        <Button className="gap-2" onClick={() => setOpen(true)}>+ Nova Transação</Button>
        <NewTransactionModal 
          open={open}
          onOpenChange={setOpen}
          projects={projects}
          categories={categories}
          createTransaction={addTransaction as any}
          onCreated={handleCreated}
        />
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[220px] justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {range?.from ? (
                    range.to ? `${range.from.toLocaleDateString('pt-BR')} - ${range.to.toLocaleDateString('pt-BR')}` : `${range.from.toLocaleDateString('pt-BR')}`
                  ) : (
                    <span>Selecionar período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DayPicker mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>

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
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
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
                    <div className="text-xs text-muted-foreground">Categoria: {t.category_id || '-'}</div>
                  </TableCell>
                  <TableCell className={t.type === 'despesa' ? 'text-red-600' : ''}>
                    {t.type === 'despesa' ? '-' : ''}
                    {currency(Number(t.value))}
                  </TableCell>
                  <TableCell>{new Date(t.due_date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell><StatusBadge status={t.status as TxStatus} /></TableCell>
                  <TableCell>{contacts.find(c => c.id === t.contact_id)?.name || '-'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewing(t)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditing(t)}><Edit className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes da Transação</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div><b>Tipo:</b> {viewing.type}</div>
              <div><b>Descrição:</b> {viewing.description}</div>
              <div><b>Valor:</b> {currency(Number(viewing.value))}</div>
              <div><b>Vencimento:</b> {new Date(viewing.due_date).toLocaleDateString('pt-BR')}</div>
              <div><b>Status:</b> {viewing.status}</div>
              <div><b>Projeto:</b> {viewing.project_id || '-'}</div>
              <div><b>Categoria:</b> {viewing.category_id || '-'}</div>
              <div><b>Método:</b> {viewing.method || '-'}</div>
              <div><b>Comprovante:</b> {viewing.receipt_url ? <a className="text-primary underline" href={viewing.receipt_url} target="_blank" rel="noreferrer">Abrir</a> : '-'}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Editar Transação</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Descrição</Label>
                <Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <Label>Valor</Label>
                <Input type="number" value={editing.value} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) } as any)} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editing.status} onValueChange={(v: TxStatus) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={async () => { if (editing) { await updateTransaction(editing.id, { description: editing.description, value: editing.value, status: editing.status }); setEditing(null); } }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
