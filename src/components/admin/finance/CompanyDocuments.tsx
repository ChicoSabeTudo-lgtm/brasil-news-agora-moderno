import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCompanyDocuments } from '@/hooks/useCompanyDocuments';
import { Upload, FileText, Download, Trash2, File } from 'lucide-react';
import InlineSpinner from '@/components/InlineSpinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const DOCUMENT_TYPES = [
  { value: 'contrato_social', label: 'Contrato Social' },
  { value: 'certidao', label: 'Certidão' },
  { value: 'certidao_conjunta_tcu', label: 'Certidão Conjunta do Tribunal de Contas da União' },
  { value: 'alvara', label: 'Alvará' },
  { value: 'inscricao', label: 'Inscrição Municipal/Estadual' },
  { value: 'cnpj', label: 'Cartão CNPJ' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'outros', label: 'Outros' },
];

const formatDateBR = (dateInput: string | Date | null | undefined) => {
  if (!dateInput) return '';

  const isoString = dateInput instanceof Date ? dateInput.toISOString() : dateInput;
  const [datePart] = isoString.split('T');
  if (!datePart) return '';

  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return '';

  return `${day}/${month}/${year}`;
};

export const CompanyDocuments = () => {
  const { documents, isLoading, uploadDocument, isUploading, deleteDocument, isDeleting, downloadDocument } = useCompanyDocuments();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !documentType) {
      return;
    }

    uploadDocument(
      { 
        file: selectedFile, 
        documentType, 
        description, 
        expiresAt: expiresAt ? expiresAt.toISOString().split('T')[0] : null 
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setDocumentType('');
          setDescription('');
          setExpiresAt(undefined);
          setIsUploadDialogOpen(false);
          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
      }
    );
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <InlineSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos da Empresa</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os documentos importantes da sua empresa
          </p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Novo Documento
        </Button>
      </div>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Novo Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Arquivo</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
            <div>
              <Label htmlFor="document-type">Tipo de Documento</Label>
              <Select value={documentType} onValueChange={setDocumentType} disabled={isUploading}>
                <SelectTrigger id="document-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Validade (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !expiresAt && 'text-muted-foreground'
                    )}
                    disabled={isUploading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? formatDateBR(expiresAt.toISOString()) : 'Selecione uma data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={setExpiresAt}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione uma descrição para o documento"
                disabled={isUploading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !documentType || isUploading}
            >
              {isUploading ? <InlineSpinner /> : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>Documentos Armazenados</CardTitle>
          </div>
          <CardDescription>
            {documents?.length || 0} documento(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!documents || documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.file_name}</p>
                      <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                        <span>{getDocumentTypeLabel(doc.document_type)}</span>
                        {doc.created_at && (
                          <>
                            <span>•</span>
                            <span>Enviado em {formatDateBR(doc.created_at)}</span>
                          </>
                        )}
                        {doc.expires_at && (
                          <>
                            <span>•</span>
                            <span>Válido até {formatDateBR(doc.expires_at)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(doc)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDocumentToDelete(doc)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o documento "{documentToDelete?.file_name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (documentToDelete) {
                  deleteDocument(documentToDelete);
                  setDocumentToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
