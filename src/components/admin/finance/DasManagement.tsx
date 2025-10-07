import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Download, FileText, Receipt, Edit, Plus, Search, Calendar as CalendarIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useDasPayments, DasPayment } from "@/hooks/useDasPayments";

export const DasManagement = () => {
  const { payments, isLoading, createPayment, updatePayment, deletePayment, downloadFile, viewFile } = useDasPayments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<DasPayment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DasPayment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const [formData, setFormData] = useState<{
    reference_month: string;
    due_date: string;
    value: string;
    payment_date: string;
    observations: string;
    status: 'pending' | 'paid' | 'overdue';
  }>({
    reference_month: "",
    due_date: "",
    value: "",
    payment_date: "",
    observations: "",
    status: "pending",
  });

  const [boletoFile, setBoletoFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData = {
      ...formData,
      value: parseFloat(formData.value),
      payment_date: formData.payment_date || null,
      boletoFile: boletoFile || undefined,
      proofFile: proofFile || undefined,
    };

    if (editingPayment) {
      updatePayment({ id: editingPayment.id, ...paymentData });
    } else {
      createPayment(paymentData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      reference_month: "",
      due_date: "",
      value: "",
      payment_date: "",
      observations: "",
      status: "pending",
    });
    setBoletoFile(null);
    setProofFile(null);
    setEditingPayment(null);
  };

  const handleEdit = (payment: DasPayment) => {
    setEditingPayment(payment);
    setFormData({
      reference_month: payment.reference_month,
      due_date: payment.due_date,
      value: payment.value.toString(),
      payment_date: payment.payment_date || "",
      observations: payment.observations || "",
      status: payment.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (payment: DasPayment) => {
    setDeleteTarget(payment);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deletePayment(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      paid: "default",
      overdue: "destructive",
    } as const;

    const labels = {
      pending: "Pendente",
      paid: "Pago",
      overdue: "Vencido",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    return payments.filter((payment) => {
      const matchesSearch = searchTerm === "" || 
        format(new Date(payment.reference_month + "-01"), "MMMM 'de' yyyy", { locale: ptBR })
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        payment.value.toString().includes(searchTerm) ||
        payment.observations?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      
      const paymentDate = new Date(payment.reference_month + "-01");
      const matchesMonth = isWithinInterval(paymentDate, { start: monthStart, end: monthEnd });
      
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [payments, searchTerm, statusFilter, selectedMonth]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pagamentos DAS</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Pagamento DAS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPayment ? "Editar" : "Registrar"} Pagamento DAS
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference_month">Mês de Referência *</Label>
                  <Input
                    id="reference_month"
                    type="month"
                    value={formData.reference_month}
                    onChange={(e) =>
                      setFormData({ ...formData, reference_month: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Data de Vencimento *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Valor do DAS *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Data do Pagamento</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  placeholder="Observações sobre o pagamento do DAS..."
                  value={formData.observations}
                  onChange={(e) =>
                    setFormData({ ...formData, observations: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status do Pagamento *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'pending' | 'paid' | 'overdue' })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Vencido</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="boleto">Boleto DAS</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Clique para selecionar ou arraste arquivos aqui
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Máximo 1 arquivos • 5MB cada • application/pdf, image/*
                    </p>
                    <Input
                      id="boleto"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setBoletoFile(e.target.files?.[0] || null)}
                    />
                    {editingPayment?.das_boleto_url && !boletoFile && (
                      <p className="text-xs text-green-600 mt-2">
                        Arquivo existente: Boleto DAS
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anexe o boleto DAS gerado no Portal do Simples Nacional
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof">Comprovante de Pagamento</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <Receipt className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Clique para selecionar ou arraste arquivos aqui
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Máximo 1 arquivos • 5MB cada • application/pdf, image/*
                    </p>
                    <Input
                      id="proof"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    />
                    {editingPayment?.payment_proof_url && !proofFile && (
                      <p className="text-xs text-green-600 mt-2">
                        Arquivo existente: Comprovante
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anexe o comprovante bancário do pagamento realizado
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPayment ? "Atualizar" : "Registrar"} Pagamento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
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
              placeholder="Buscar por mês, valor ou observações..."
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
          </select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referência</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Arquivos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum pagamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {format(new Date(payment.reference_month + "-01"), "MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  {format(new Date(payment.due_date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(payment.value)}
                </TableCell>
                <TableCell>
                  {payment.payment_date
                    ? format(new Date(payment.payment_date), "dd/MM/yyyy")
                    : "-"}
                </TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {payment.das_boleto_path && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewFile(payment.das_boleto_path!)}
                          title="Visualizar Boleto"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            downloadFile(payment.das_boleto_path!, "boleto-das.pdf")
                          }
                          title="Baixar Boleto"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {payment.payment_proof_path && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewFile(payment.payment_proof_path!)}
                          title="Visualizar Comprovante"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            downloadFile(payment.payment_proof_path!, "comprovante.pdf")
                          }
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(payment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(payment)}
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
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento DAS? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
