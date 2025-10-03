import { useState, useMemo } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Trash2, FileText, AlertCircle, CheckCircle2, Clock, XCircle, Search, Calendar as CalendarIcon, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const invoiceTypes = [
  { value: 'servicos', label: 'Serviços' },
  { value: 'produtos', label: 'Produtos' },
  { value: 'mista', label: 'Mista' },
];

const statusOptions = [
  { value: 'pending', label: 'Pendente', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Pago', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Vencido', icon: AlertCircle, color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-gray-100 text-gray-800' },
];

export function InvoiceManagement() {
  const { invoices, isLoading, createInvoice, isCreating, deleteInvoice, updateInvoice, downloadFile, viewFile } = useInvoices();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // Form state
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_series: '',
    invoice_type: 'servicos',
    client_id: '',
    client_name: '',
    client_document: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    total_value: '',
    tax_value: '0',
    status: 'pending',
    payment_method: '',
    payment_date: '',
    description: '',
    notes: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Fetch clients
  const { data: clients } = useQuery({
    queryKey: ['finance-contacts-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_contacts')
        .select('*')
        .eq('type', 'client')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const handleClientSelect = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client_id: clientId,
        client_name: client.company || client.name,
        client_document: client.phone || '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const invoiceData = {
      ...formData,
      total_value: parseFloat(formData.total_value),
      tax_value: parseFloat(formData.tax_value),
      client_id: formData.client_id || null,
      invoice_series: formData.invoice_series || null,
      due_date: formData.due_date || null,
      payment_date: formData.payment_date || null,
      payment_method: formData.payment_method || null,
      description: formData.description || null,
      notes: formData.notes || null,
      pdfFile: pdfFile || undefined,
      xmlFile: xmlFile || undefined,
      proofFile: proofFile || undefined,
    };

    if (selectedInvoice) {
      updateInvoice({ id: selectedInvoice.id, ...invoiceData } as any, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        },
      });
    } else {
      createInvoice(invoiceData as any, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_number: '',
      invoice_series: '',
      invoice_type: 'servicos',
      client_id: '',
      client_name: '',
      client_document: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      total_value: '',
      tax_value: '0',
      status: 'pending',
      payment_method: '',
      payment_date: '',
      description: '',
      notes: '',
    });
    setPdfFile(null);
    setXmlFile(null);
    setProofFile(null);
    setSelectedInvoice(null);
  };

  const handleEdit = (invoice: any) => {
    setSelectedInvoice(invoice);
    setFormData({
      invoice_number: invoice.invoice_number,
      invoice_series: invoice.invoice_series || '',
      invoice_type: invoice.invoice_type,
      client_id: invoice.client_id || '',
      client_name: invoice.client_name,
      client_document: invoice.client_document,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date || '',
      total_value: invoice.total_value.toString(),
      tax_value: invoice.tax_value.toString(),
      status: invoice.status,
      payment_method: invoice.payment_method || '',
      payment_date: invoice.payment_date || '',
      description: invoice.description || '',
      notes: invoice.notes || '',
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    if (!statusConfig) return null;
    
    const Icon = statusConfig.icon;
    return (
      <Badge className={statusConfig.color}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    return invoices.filter((invoice) => {
      const matchesSearch = searchTerm === "" || 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client_document.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      
      const invoiceDate = new Date(invoice.issue_date + 'T00:00:00');
      const matchesMonth = isWithinInterval(invoiceDate, { start: monthStart, end: monthEnd });
      
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [invoices, searchTerm, statusFilter, selectedMonth]);

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Notas Fiscais</h2>
          <p className="text-muted-foreground">Gerencie as notas fiscais e comprovantes de pagamento</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Nota Fiscal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedInvoice ? 'Editar' : 'Nova'} Nota Fiscal</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Número da NF *</Label>
                  <Input
                    value={formData.invoice_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Série</Label>
                  <Input
                    value={formData.invoice_series}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoice_series: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo da Nota *</Label>
                  <Select value={formData.invoice_type} onValueChange={(value) => setFormData(prev => ({ ...prev, invoice_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {invoiceTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Dados do Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cliente Cadastrado</Label>
                    <Select value={formData.client_id} onValueChange={handleClientSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.company || client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nome/Razão Social *</Label>
                    <Input
                      value={formData.client_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label>CPF/CNPJ *</Label>
                    <Input
                      value={formData.client_document}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_document: e.target.value }))}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Informações Financeiras</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Emissão *</Label>
                    <Input
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Data de Vencimento</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Valor Total *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.total_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, total_value: e.target.value }))}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Valor dos Impostos</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.tax_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax_value: e.target.value }))}
                      placeholder="0,00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Forma de Pagamento</Label>
                    <Input
                      value={formData.payment_method}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                      placeholder="PIX, Boleto, Cartão..."
                    />
                  </div>

                  {formData.status === 'paid' && (
                    <div className="space-y-2">
                      <Label>Data do Pagamento</Label>
                      <Input
                        type="date"
                        value={formData.payment_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição dos Serviços/Produtos</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva os serviços ou produtos da nota fiscal..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>PDF da Nota Fiscal</Label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                  {selectedInvoice?.invoice_pdf_url && !pdfFile && (
                    <p className="text-xs text-muted-foreground">Arquivo atual disponível</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>XML da Nota Fiscal</Label>
                  <Input
                    type="file"
                    accept=".xml"
                    onChange={(e) => setXmlFile(e.target.files?.[0] || null)}
                  />
                  {selectedInvoice?.invoice_xml_url && !xmlFile && (
                    <p className="text-xs text-muted-foreground">Arquivo atual disponível</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Comprovante de Pagamento</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  {selectedInvoice?.payment_proof_url && !proofFile && (
                    <p className="text-xs text-muted-foreground">Arquivo atual disponível</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {selectedInvoice ? 'Atualizar' : 'Criar'} Nota Fiscal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notas Fiscais Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedMonth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) => date && setSelectedMonth(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente, documento ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          
          <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Arquivos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma nota fiscal encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoice_number}
                    {invoice.invoice_series && ` - ${invoice.invoice_series}`}
                  </TableCell>
                  <TableCell>{invoice.client_name}</TableCell>
                  <TableCell>
                    {format(new Date(invoice.issue_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    R$ {invoice.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {invoice.invoice_pdf_path && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewFile(invoice.invoice_pdf_path!)}
                            title="Visualizar PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadFile(invoice.invoice_pdf_path!, `NF-${invoice.invoice_number}.pdf`)}
                            title="Baixar PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {invoice.payment_proof_path && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewFile(invoice.payment_proof_path!)}
                            title="Visualizar Comprovante"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadFile(invoice.payment_proof_path!, `Comprovante-${invoice.invoice_number}.pdf`)}
                            title="Baixar Comprovante"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(invoice)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteInvoice(invoice)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
          
          {invoices?.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma nota fiscal cadastrada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
