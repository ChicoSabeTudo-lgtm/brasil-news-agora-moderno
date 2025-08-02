
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Tag, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DailyBriefsViewModalProps {
  open: boolean;
  onClose: () => void;
  brief: any;
}

export const DailyBriefsViewModal = ({ open, onClose, brief }: DailyBriefsViewModalProps) => {
  if (!brief) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-muted/50 text-muted-foreground border-muted';
      case 'em_andamento': return 'bg-primary/10 text-primary border-primary/20';
      case 'finalizada': return 'bg-green-500/10 text-green-700 border-green-500/20';
      default: return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baixa': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'media': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'alta': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rascunho': return <FileText className="h-3 w-3" />;
      case 'em_andamento': return <Clock className="h-3 w-3" />;
      case 'finalizada': return <AlertCircle className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'rascunho': return 'Rascunho';
      case 'em_andamento': return 'Em Andamento';
      case 'finalizada': return 'Finalizada';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'baixa': return 'Baixa';
      case 'media': return 'Média';
      case 'alta': return 'Alta';
      default: return priority;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Detalhes da Pauta</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Visualização completa dos dados da pauta
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Título e badges */}
          <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-foreground leading-tight">
                  {brief.title}
                </h1>
                <div className="flex gap-3 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(brief.status)} flex items-center gap-2 px-3 py-1.5 text-sm font-medium`}
                  >
                    {getStatusIcon(brief.status)}
                    {getStatusText(brief.status)}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`${getPriorityColor(brief.priority)} flex items-center gap-2 px-3 py-1.5 text-sm font-medium`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      brief.priority === 'baixa' ? 'bg-green-500' :
                      brief.priority === 'media' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    {getPriorityText(brief.priority)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imagem */}
          {brief.image_url && (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative group">
                  <img 
                    src={brief.image_url} 
                    alt={brief.title}
                    className="w-full max-h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações básicas */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data</p>
                    <p className="text-base font-semibold">
                      {format(new Date(brief.brief_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Horário</p>
                    <p className="text-base font-semibold">{brief.brief_time}</p>
                  </div>
                </div>

                {brief.categories && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold">{brief.categories.name}</p>
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: brief.categories.color }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Descrição */}
          {brief.description && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Descrição
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                        {brief.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadados */}
          <Card className="bg-muted/20">
            <CardContent className="p-6">
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground">Criado em:</span>
                  <span className="text-foreground">
                    {format(new Date(brief.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground">Atualizado em:</span>
                  <span className="text-foreground">
                    {format(new Date(brief.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
