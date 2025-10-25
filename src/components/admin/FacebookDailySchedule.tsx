import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FacebookScheduleModal } from './FacebookScheduleModal';
import { useFacebookSchedule, FacebookSchedule } from '@/hooks/useFacebookSchedule';
import { Plus, Edit, Trash2, ExternalLink, Copy, Clock, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper function to safely format date
const formatDateSafely = (dateString: string) => {
  try {
    // If date includes time, use parseISO
    if (dateString.includes('T') || dateString.includes(' ')) {
      const parsed = parseISO(dateString);
      return format(parsed, 'dd/MM/yyyy', { locale: ptBR });
    }
    // If date is YYYY-MM-DD, add T00:00:00
    const parsed = parseISO(dateString + 'T00:00:00');
    return format(parsed, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return dateString;
  }
};

export const FacebookDailySchedule = () => {
  const { 
    schedules, 
    isLoading, 
    error: queryError,
    currentDate, 
    todayCount, 
    deleteSchedule, 
    formatTime,
    getSchedulesByPeriod 
  } = useFacebookSchedule();

  // Debug logs
  console.log('🔍 FacebookDailySchedule Debug:', {
    schedules,
    isLoading,
    currentDate,
    todayCount,
    schedulesLength: schedules?.length || 0
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<FacebookSchedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<FacebookSchedule | null>(null);

  const handleEdit = (schedule: FacebookSchedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = (schedule: FacebookSchedule) => {
    setDeletingSchedule(schedule);
  };

  const confirmDelete = () => {
    if (deletingSchedule) {
      deleteSchedule(deletingSchedule.id);
      setDeletingSchedule(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  // Get schedules by time periods
  const morningSchedules = getSchedulesByPeriod('morning');
  const afternoonSchedules = getSchedulesByPeriod('afternoon');
  const eveningSchedules = getSchedulesByPeriod('evening');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pauta do Facebook...</p>
        </div>
      </div>
    );
  }

  // Error state - show if there's an error
  if (queryError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-medium">Erro ao carregar pauta do Facebook</div>
          <p className="text-muted-foreground">
            Verifique se a tabela foi criada corretamente no Supabase.
          </p>
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <strong>Erro:</strong> {queryError.message || 'Erro desconhecido'}
          </div>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pauta Facebook (Diária)</h2>
          <p className="text-muted-foreground">
            Gerenciamento de postagens agendadas para hoje - {currentDate ? formatDateSafely(currentDate) : 'Carregando...'}
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSchedule(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Pauta Facebook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Editar Pauta Facebook' : 'Nova Pauta Facebook'}
              </DialogTitle>
            </DialogHeader>
            <FacebookScheduleModal 
              schedule={editingSchedule}
              onClose={handleCloseModal}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-muted-foreground">postagens agendadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Manhã
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{morningSchedules.length}</div>
            <p className="text-xs text-muted-foreground">06:00 - 12:00</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tarde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{afternoonSchedules.length}</div>
            <p className="text-xs text-muted-foreground">12:00 - 18:00</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Noite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eveningSchedules.length}</div>
            <p className="text-xs text-muted-foreground">18:00 - 06:00</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Postagens</CardTitle>
          <CardDescription>
            Lista de todas as postagens programadas para hoje, ordenadas por horário
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma pauta agendada</h3>
              <p className="text-muted-foreground mb-4">
                Não há postagens agendadas para hoje. Clique em "Nova Pauta Facebook" para começar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Título da Notícia</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => {
                  const hour = parseInt(schedule.scheduled_time.split(':')[0]);
                  const period = hour >= 6 && hour < 12 ? 'Manhã' : 
                                hour >= 12 && hour < 18 ? 'Tarde' : 'Noite';
                  
                  return (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {formatTime(schedule.scheduled_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate" title={schedule.news_title}>
                            {schedule.news_title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(schedule.news_url)}
                            title="Copiar URL"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUrl(schedule.news_url)}
                            title="Abrir URL"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          period === 'Manhã' ? 'default' : 
                          period === 'Tarde' ? 'secondary' : 'outline'
                        }>
                          {period}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {schedule.created_by_name || 'Usuário desconhecido'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(schedule)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSchedule} onOpenChange={() => setDeletingSchedule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pauta do Facebook?
              <br />
              <strong>"{deletingSchedule?.news_title}"</strong>
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
