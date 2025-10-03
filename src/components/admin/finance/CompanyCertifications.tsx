import { useState } from 'react';
import { useCompanyCertifications } from '@/hooks/useCompanyCertifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, Trash2, FileText, AlertCircle, CheckCircle2, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const certificationTypes = [
  { value: 'municipal', label: 'Certidão Municipal' },
  { value: 'fgts', label: 'Certidão FGTS' },
  { value: 'estadual', label: 'Certidão Estadual' },
  { value: 'trabalhista', label: 'Certidão Trabalhista' },
  { value: 'federal', label: 'Certidão Federal' },
];

export function CompanyCertifications() {
  const { 
    certifications, 
    isLoading, 
    uploadCertification, 
    isUploading,
    deleteCertification,
    isDeleting,
    downloadCertification 
  } = useCompanyCertifications();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [certificationType, setCertificationType] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !certificationType || !issueDate || !expiryDate) {
      return;
    }

    uploadCertification(
      {
        file: selectedFile,
        certificationType: certificationType as any,
        issueDate,
        expiryDate,
        notes,
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setCertificationType('');
          setIssueDate('');
          setExpiryDate('');
          setNotes('');
          const fileInput = document.getElementById('certification-file') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
      }
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'expiring_soon':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Válida';
      case 'expiring_soon':
        return 'Vence em breve';
      case 'expired':
        return 'Vencida';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200';
      case 'expiring_soon':
        return 'bg-yellow-50 border-yellow-200';
      case 'expired':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const expiringCertifications = certifications?.filter(c => c.status === 'expiring_soon' || c.status === 'expired') || [];

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Certidões da Empresa</h2>
        <p className="text-muted-foreground">
          Gerencie as certidões da empresa e acompanhe as datas de validade
        </p>
      </div>

      {expiringCertifications.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção!</strong> Você tem {expiringCertifications.length} certidão(ões) vencida(s) ou próxima(s) do vencimento.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Enviar Nova Certidão</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certification-type">Tipo de Certidão *</Label>
                <Select value={certificationType} onValueChange={setCertificationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certification-file">Arquivo *</Label>
                <Input
                  id="certification-file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue-date">Data de Emissão *</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry-date">Data de Validade *</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações adicionais (opcional)"
                  rows={3}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isUploading || !selectedFile || !certificationType || !issueDate || !expiryDate}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Enviando...' : 'Enviar Certidão'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Certidões Cadastradas</h3>
        
        {certificationTypes.map((type) => {
          const typeCertifications = certifications?.filter(c => c.certification_type === type.value) || [];
          
          if (typeCertifications.length === 0) return null;

          return (
            <Card key={type.value}>
              <CardHeader>
                <CardTitle className="text-base">{type.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {typeCertifications.map((cert) => (
                    <div
                      key={cert.id}
                      className={`p-4 rounded-lg border ${getStatusColor(cert.status)}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(cert.status)}
                              <span className="font-medium">{getStatusText(cert.status)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mb-1">
                              {cert.file_name}
                            </p>
                            <div className="text-sm space-y-1">
                              <p>
                                <strong>Emissão:</strong>{' '}
                                {format(new Date(cert.issue_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                              <p>
                                <strong>Validade:</strong>{' '}
                                {format(new Date(cert.expiry_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                              {cert.notes && (
                                <p className="text-muted-foreground italic">{cert.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(cert.file_url, '_blank')}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadCertification(cert)}
                            title="Baixar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCertification(cert)}
                            disabled={isDeleting}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {certifications?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma certidão cadastrada ainda.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
