import { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Trash2, Download, FileText, Edit, Plus, Search, 
  Calendar as CalendarIcon, AlertTriangle, Scale 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLegalCases, LegalCase } from "@/hooks/useLegalCases";

const caseTypes = [
  { value: 'civil', label: 'Cível' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'labor', label: 'Trabalhista' },
  { value: 'tax', label: 'Tributário' },
  { value: 'family', label: 'Família' },
  { value: 'other', label: 'Outro' },
];

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'archived', label: 'Arquivado' },
  { value: 'concluded', label: 'Concluído' },
];

export const LegalCaseManagement = () => {
  const { legalCases, documents, isLoading, createCase, updateCase, deleteCase, downloadFile } = useLegalCases();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LegalCase | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    case_number: "",
    case_type: "civil",
    status: "active",
    lawyer_name: "",
    start_date: new Date().toISOString().split('T')[0],
    hearing_date: "",
    plaintiff: "",
    defendant: "",
    description: "",
  });

  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const caseData = {
      ...formData,
      hearing_date: formData.hearing_date || null,
      description: formData.description || null,
      documents: documentFiles.length > 0 ? documentFiles : undefined,
    };

    if (editingCase) {
      updateCase({ id: editingCase.id, ...caseData } as any);
    } else {
      createCase(caseData as any);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      case_number: "",
      case_type: "civil",
      status: "active",
      lawyer_name: "",
      start_date: new Date().toISOString().split('T')[0],
      hearing_date: "",
      plaintiff: "",
      defendant: "",
      description: "",
    });
    setDocumentFiles([]);
    setEditingCase(null);
  };

  const handleEdit = (legalCase: LegalCase) => {
    setEditingCase(legalCase);
    setFormData({
      case_number: legalCase.case_number,
      case_type: legalCase.case_type,
      status: legalCase.status,
      lawyer_name: legalCase.lawyer_name,
      start_date: legalCase.start_date,
      hearing_date: legalCase.hearing_date || "",
      plaintiff: legalCase.plaintiff,
      defendant: legalCase.defendant,
      description: legalCase.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (legalCase: LegalCase) => {
    setDeleteTarget(legalCase);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteCase(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; className: string; label: string }> = {
      active: {
        variant: "default",
        className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
        label: "Ativo"
      },
      suspended: {
        variant: "secondary",
        className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
        label: "Suspenso"
      },
      archived: {
        variant: "outline",
        className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
        label: "Arquivado"
      },
      concluded: {
        variant: "default",
        className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        label: "Concluído"
      },
    };

    const config = statusConfig[status] || { 
      variant: "default", 
      className: "", 
      label: status 
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getHearingAlert = (hearingDate: string | null) => {
    if (!hearingDate) return null;
    
    const daysUntil = differenceInDays(new Date(hearingDate), new Date());
    
    if (daysUntil < 0) {
      return <Badge variant="destructive" className="ml-2">Audiência passou</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge variant="destructive" className="ml-2 gap-1">
        <AlertTriangle className="h-3 w-3" />
        {daysUntil} dias
      </Badge>;
    } else if (daysUntil <= 30) {
      return <Badge variant="secondary" className="ml-2">
        {daysUntil} dias
      </Badge>;
    }
    
    return null;
  };

  const upcomingHearings = useMemo(() => {
    if (!legalCases) return [];
    
    return legalCases
      .filter(c => c.hearing_date)
      .filter(c => {
        const daysUntil = differenceInDays(new Date(c.hearing_date!), new Date());
        return daysUntil >= 0 && daysUntil <= 30;
      })
      .sort((a, b) => new Date(a.hearing_date!).getTime() - new Date(b.hearing_date!).getTime());
  }, [legalCases]);

  const filteredCases = useMemo(() => {
    if (!legalCases) return [];
    
    return legalCases.filter((legalCase) => {
      const matchesSearch = searchTerm === "" || 
        legalCase.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        legalCase.lawyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        legalCase.plaintiff.toLowerCase().includes(searchTerm.toLowerCase()) ||
        legalCase.defendant.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || legalCase.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [legalCases, searchTerm, statusFilter]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6" />
            Processos Judiciais
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os processos judiciais da empresa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Processo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCase ? "Editar" : "Adicionar Novo"} Processo Judicial
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="case_number">Número do Processo *</Label>
                  <Input
                    id="case_number"
                    placeholder="Ex: 0001234-56.2023.8.26.0100"
                    value={formData.case_number}
                    onChange={(e) =>
                      setFormData({ ...formData, case_number: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case_type">Tipo *</Label>
                  <Select
                    value={formData.case_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, case_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {caseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lawyer_name">Advogado *</Label>
                  <Input
                    id="lawyer_name"
                    placeholder="Nome do advogado"
                    value={formData.lawyer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, lawyer_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hearing_date">Data da Audiência</Label>
                  <Input
                    id="hearing_date"
                    type="date"
                    value={formData.hearing_date}
                    onChange={(e) =>
                      setFormData({ ...formData, hearing_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plaintiff">Autor *</Label>
                  <Input
                    id="plaintiff"
                    placeholder="Nome do autor"
                    value={formData.plaintiff}
                    onChange={(e) =>
                      setFormData({ ...formData, plaintiff: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defendant">Réu *</Label>
                  <Input
                    id="defendant"
                    placeholder="Nome do réu"
                    value={formData.defendant}
                    onChange={(e) =>
                      setFormData({ ...formData, defendant: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição / Observações</Label>
                <Textarea
                  id="description"
                  placeholder="Informações adicionais sobre o processo..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents">Documentos</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Selecione arquivos para anexar
                  </p>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept="application/pdf,image/*,.doc,.docx"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setDocumentFiles(files);
                    }}
                  />
                  {documentFiles.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      {documentFiles.length} arquivo(s) selecionado(s)
                    </p>
                  )}
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
                  {editingCase ? "Atualizar" : "Salvar"} Processo
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {upcomingHearings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Audiências próximas:</strong>
            <ul className="mt-2 space-y-1">
              {upcomingHearings.slice(0, 3).map((c) => (
                <li key={c.id} className="text-sm">
                  {c.case_number} - {format(new Date(c.hearing_date!), "dd/MM/yyyy", { locale: ptBR })}
                  {" "}({differenceInDays(new Date(c.hearing_date!), new Date())} dias)
                </li>
              ))}
            </ul>
            {upcomingHearings.length > 3 && (
              <p className="text-xs text-muted-foreground mt-2">
                E mais {upcomingHearings.length - 3} audiência(s)
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, advogado, autor ou réu..."
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
            <option value="active">Ativo</option>
            <option value="suspended">Suspenso</option>
            <option value="archived">Arquivado</option>
            <option value="concluded">Concluído</option>
          </select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Advogado</TableHead>
              <TableHead>Autor x Réu</TableHead>
              <TableHead>Audiência</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum processo encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredCases.map((legalCase) => {
                const caseDocuments = documents?.filter(d => d.legal_case_id === legalCase.id) || [];
                
                return (
                  <TableRow key={legalCase.id}>
                    <TableCell className="font-medium">
                      {legalCase.case_number}
                    </TableCell>
                    <TableCell>
                      {caseTypes.find(t => t.value === legalCase.case_type)?.label || legalCase.case_type}
                    </TableCell>
                    <TableCell>{legalCase.lawyer_name}</TableCell>
                    <TableCell className="text-xs">
                      <div>{legalCase.plaintiff}</div>
                      <div className="text-muted-foreground">vs {legalCase.defendant}</div>
                    </TableCell>
                    <TableCell>
                      {legalCase.hearing_date ? (
                        <div className="flex items-center">
                          {format(new Date(legalCase.hearing_date), "dd/MM/yyyy")}
                          {getHearingAlert(legalCase.hearing_date)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(legalCase.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {caseDocuments.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            title={`${caseDocuments.length} documento(s)`}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(legalCase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(legalCase)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este processo judicial? Esta ação não pode ser
              desfeita e todos os documentos relacionados serão removidos.
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
