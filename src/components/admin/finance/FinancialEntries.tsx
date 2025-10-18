import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingDown, TrendingUp, Calendar, Eye, Edit, Trash2, FileText, Building2, CreditCard, User, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { Calendar as DayPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DateRange } from 'react-day-picker';
import { useFinanceData, type FinanceTransaction, type TxStatus, type TxType } from '@/hooks/useFinance';
import NewTransactionModal from './NewTransactionModal';

const getCurrentMonthRange = (): DateRange => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: start,
    to: end,
  };
};

const currency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function FinancialEntries() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, projects, categories, contacts } = useFinanceData();
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<FinanceTransaction | null>(null);
  const [editing, setEditing] = useState<FinanceTransaction | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TxType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TxStatus>('all');
  const [projectFilter, setProjectFilter] = useState<'all' | string>('all');
  
  // Período pré-selecionado: mês atual
  const [range, setRange] = useState<DateRange | undefined>(getCurrentMonthRange());

  useEffect(() => {
    // Ao carregar, define o filtro para o mês atual sempre que entrar na tela
    setRange(getCurrentMonthRange());
  }, []);

  // Local form removed; handled by modal component

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      
      // Lógica aprimorada para filtro de status
      if (statusFilter !== 'all') {
        if (statusFilter === 'Atrasado') {
          // Para "Atrasado", verifica se a transação não está paga e a data de vencimento passou
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(t.due_date + 'T00:00:00');
          dueDate.setHours(0, 0, 0, 0);
          
          if (t.status === 'Pago' || dueDate >= today) return false;
        } else {
          // Para outros status, usa a lógica normal
          if (t.status !== statusFilter) return false;
        }
      }
      
      if (projectFilter !== 'all' && (t.project_id || '') !== projectFilter) return false;
      // Só aplica filtro de data se o range estiver definido
      if (range?.from || range?.to) {
        const d = new Date(t.due_date + 'T00:00:00'); // Força timezone local
        if (range?.from) {
          const from = new Date(range.from);
          from.setHours(0, 0, 0, 0);
          if (d < from) return false;
        }
        if (range?.to) {
          const to = new Date(range.to);
          to.setHours(23, 59, 59, 999);
          if (d > to) return false;
        }
      }
      if (search && !`${t.description}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, typeFilter, statusFilter, projectFilter, range, search]);

  const catMap = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c.name])), [categories]);
  
  // Contadores de status para o filtro
  const statusCounts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let pendente = 0;
    let pago = 0;
    let atrasado = 0;
    
    transactions.forEach(t => {
      const dueDate = new Date(t.due_date + 'T00:00:00');
      dueDate.setHours(0, 0, 0, 0);
      
      if (t.status === 'Pago') {
        pago++;
      } else if (t.status === 'Pendente') {
        if (dueDate < today) {
          atrasado++;
        } else {
          pendente++;
        }
      }
    });
    
    return { pendente, pago, atrasado };
  }, [transactions]);
  const summary = useMemo(() => {
    const inRange = transactions.filter((t) => {
      if (!range?.from && !range?.to) return true;
      const d = new Date(t.due_date + 'T00:00:00');
      if (range?.from) {
        const from = new Date(range.from);
        from.setHours(0, 0, 0, 0);
        if (d < from) return false;
      }
      if (range?.to) {
        const to = new Date(range.to);
        to.setHours(23, 59, 59, 999);
        if (d > to) return false;
      }
      return true;
    });

    const received = inRange
      .filter((t) => t.type === 'receita' && t.status === 'Pago')
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const paid = inRange
      .filter((t) => t.type === 'despesa' && t.status === 'Pago')
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const receivable = inRange
      .filter((t) => t.type === 'receita' && t.status !== 'Pago')
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const payable = inRange
      .filter((t) => t.type === 'despesa' && t.status !== 'Pago')
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const balance = received - paid;

    // Calcular atrasos
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueReceivable = inRange
      .filter((t) => {
        const dueDate = new Date(t.due_date + 'T00:00:00');
        return t.type === 'receita' && t.status !== 'Pago' && dueDate < today;
      })
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0);

    const overduePayable = inRange
      .filter((t) => {
        const dueDate = new Date(t.due_date + 'T00:00:00');
        return t.type === 'despesa' && t.status !== 'Pago' && dueDate < today;
      })
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0);

    return { received, paid, receivable, payable, balance, overdueReceivable, overduePayable };
  }, [transactions, range]);

  const handleCreated = () => setOpen(false);

  const StatusBadge = ({ transaction }: { transaction: FinanceTransaction }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(transaction.due_date + 'T00:00:00');
    dueDate.setHours(0, 0, 0, 0);
    
    // Calcula se está atrasado dinamicamente
    const isOverdue = transaction.status !== 'Pago' && dueDate < today;
    const displayStatus = isOverdue ? 'Atrasado' : transaction.status;
    
    return (
      <Badge variant={
        displayStatus === 'Pago' ? 'secondary' : 
        displayStatus === 'Pendente' ? 'default' : 
        'destructive'
      }>
        {displayStatus}
      </Badge>
    );
  };

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#1f3b80] via-[#1c2541] to-[#0b132b] text-white shadow-xl">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(255,255,255,0.35), transparent 55%)' }} />
          <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-6 top-6 h-16 w-16 rounded-full bg-white/10" />
          <CardHeader className="relative pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Saldo do período</p>
                <CardTitle className="text-base text-white">Resumo Financeiro</CardTitle>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70">
                <Calendar className="h-3.5 w-3.5" />
                {range?.from && range?.to ? `${range.from.toLocaleDateString('pt-BR')} • ${range.to.toLocaleDateString('pt-BR')}` : 'Período corrente'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative flex flex-col gap-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-sm text-white/70">Saldo líquido</span>
                <p className="text-4xl font-bold tracking-tight">{currency(summary.balance)}</p>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60 mb-2">Previsão de saldo do período</p>
              <p className="text-sm text-white/80">
                Considerando receitas e despesas pendentes, o saldo projetado para o período é de <span className="font-semibold text-white">{currency(summary.balance + summary.receivable - summary.payable)}</span>
              </p>
            </div>

            <p className="text-xs text-white/60">Valores refletem as transações aplicadas aos filtros de período e status.</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards - Atrasos */}
      {(summary.overdueReceivable > 0 || summary.overduePayable > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.overdueReceivable > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-4 h-4" />
                  Atrasado a Receber
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-2xl font-semibold text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  {currency(summary.overdueReceivable)}
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Valores em atraso que deveriam ter sido recebidos
                </p>
              </CardContent>
            </Card>
          )}

          {summary.overduePayable > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  Atrasado a Pagar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-2xl font-semibold text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  {currency(summary.overduePayable)}
                </div>
                <p className="text-xs text-red-600 mt-1">
                  Valores em atraso que deveriam ter sido pagos
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status ({transactions.length})</SelectItem>
                <SelectItem value="Pendente">Pendente ({statusCounts.pendente})</SelectItem>
                <SelectItem value="Pago">Pago ({statusCounts.pago})</SelectItem>
                <SelectItem value="Atrasado">⚠️ Atrasado ({statusCounts.atrasado})</SelectItem>
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
                    <div className="text-xs text-muted-foreground">Categoria: {catMap[t.category_id || ''] || '-'}</div>
                  </TableCell>
                  <TableCell className={t.type === 'despesa' ? 'text-red-600' : ''}>
                    {t.type === 'despesa' ? '-' : ''}
                    {currency(Number(t.value))}
                  </TableCell>
                  <TableCell>{new Date(t.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell><StatusBadge transaction={t} /></TableCell>
                  <TableCell>{contacts.find(c => c.id === t.contact_id)?.name || '-'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewing(t)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditing(t)}><Edit className="w-4 h-4" /></Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={async () => {
                        if (confirm('Tem certeza que deseja excluir esta transação?')) {
                          await deleteTransaction(t.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6 text-primary" />
              Detalhes da Transação
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${viewing.type === 'receita' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <p className="font-semibold">{viewing.type === 'receita' ? 'Receita' : 'Despesa'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="font-semibold text-lg">{currency(Number(viewing.value))}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vencimento</p>
                      <p className="font-semibold">{new Date(viewing.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                      {viewing.pay_date && (
                        <p className="text-xs text-muted-foreground mt-1">Pago em: {new Date(viewing.pay_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                      <Badge variant={viewing.status === 'Pago' ? 'secondary' : viewing.status === 'Pendente' ? 'default' : 'destructive'}>
                        {viewing.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Projeto</p>
                      <p className="font-semibold">{projects.find(p => p.id === viewing.project_id)?.name || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Categoria</p>
                      <p className="font-semibold">{catMap[viewing.category_id || ''] || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-pink-100 text-pink-700">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contato</p>
                      <p className="font-semibold">{contacts.find(c => c.id === viewing.contact_id)?.name || viewing.supplier || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-700">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Método de Pagamento</p>
                      <p className="font-semibold">{viewing.method || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">Descrição</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{viewing.description}</p>
              </div>

              {viewing.receipt_url && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Comprovante</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={viewing.receipt_url} target="_blank" rel="noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      Abrir Comprovante
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editing && (
        <Dialog open={true} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Edit className="w-6 h-6 text-primary" />
                Editar Transação
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Tipo</Label>
                  <Select value={editing.type} onValueChange={(v: TxType) => setEditing({ ...editing, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Descrição</Label>
                  <Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </div>

                <div>
                  <Label>Valor</Label>
                  <Input type="number" step="0.01" value={editing.value} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) } as any)} />
                </div>

                <div>
                  <Label>Vencimento</Label>
                  <Input 
                    type="date" 
                    value={editing.due_date || ''} 
                    onChange={(e) => setEditing({ ...editing, due_date: e.target.value })} 
                  />
                </div>

                <div>
                  <Label>Data de Pagamento</Label>
                  <Input 
                    type="date" 
                    value={editing.pay_date || ''} 
                    onChange={(e) => setEditing({ ...editing, pay_date: e.target.value || null })} 
                  />
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

                <div className="col-span-2">
                  <Label>Fornecedor (texto livre)</Label>
                  <Input value={editing.supplier || ''} onChange={(e) => setEditing({ ...editing, supplier: e.target.value })} placeholder="Nome do fornecedor" />
                </div>

                <div>
                  <Label>Contato</Label>
                  <Select value={editing.contact_id || 'none'} onValueChange={(v) => setEditing({ ...editing, contact_id: v === 'none' ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione um contato" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {contacts.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Projeto</Label>
                  <Select value={editing.project_id || 'none'} onValueChange={(v) => setEditing({ ...editing, project_id: v === 'none' ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione um projeto" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Categoria</Label>
                  <Select value={editing.category_id || 'none'} onValueChange={(v) => setEditing({ ...editing, category_id: v === 'none' ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {categories.filter(cat => cat.type === editing.type).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Método de Pagamento</Label>
                  <Select value={editing.method || 'none'} onValueChange={(v) => setEditing({ ...editing, method: v === 'none' ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o método" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Débito">Débito</SelectItem>
                      <SelectItem value="Crédito">Crédito</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={async () => { 
                if (editing) { 
                  await updateTransaction(editing.id, editing); 
                  setEditing(null); 
                } 
              }}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
