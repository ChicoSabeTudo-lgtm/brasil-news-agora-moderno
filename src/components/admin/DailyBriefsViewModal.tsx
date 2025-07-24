
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Tag } from 'lucide-react';
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
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'finalizada': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baixa': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Pauta</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Título e badges */}
          <div>
            <h2 className="text-2xl font-bold mb-3">{brief.title}</h2>
            <div className="flex gap-2 flex-wrap">
              <Badge className={getStatusColor(brief.status)}>
                {getStatusText(brief.status)}
              </Badge>
              <Badge className={getPriorityColor(brief.priority)}>
                {getPriorityText(brief.priority)}
              </Badge>
            </div>
          </div>

          {/* Imagem */}
          {brief.image_url && (
            <div>
              <img 
                src={brief.image_url} 
                alt={brief.title}
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Data: {format(new Date(brief.brief_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Hora: {brief.brief_time}</span>
            </div>
            {brief.categories && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>Categoria: {brief.categories.name}</span>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: brief.categories.color }}
                />
              </div>
            )}
          </div>

          {/* Descrição */}
          {brief.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{brief.description}</p>
              </div>
            </div>
          )}

          {/* Metadados */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Criado em:</span> {format(new Date(brief.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </div>
              <div>
                <span className="font-medium">Atualizado em:</span> {format(new Date(brief.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
