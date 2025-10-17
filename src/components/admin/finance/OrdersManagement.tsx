import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useInsertionOrders } from '@/hooks/useInsertionOrders';
import NewInsertionOrderModal from './NewInsertionOrderModal';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function OrdersManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const { orders, loading, deleteOrder } = useInsertionOrders();

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta PI?')) return;
    try {
      await deleteOrder(id);
      toast.success('PI excluída com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir PI');
    }
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão de PIs</h2>
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Nova PI
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos de Inserção (PIs)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhuma PI cadastrada ainda</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº PI</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.pi_number}</TableCell>
                    <TableCell>{order.contact?.name || 'N/A'}</TableCell>
                    <TableCell>{order.vehicle}</TableCell>
                    <TableCell>R$ {Number(order.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      {format(new Date(order.start_date + 'T00:00:00'), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(order.end_date + 'T00:00:00'), 'dd/MM/yy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.payment_status === 'Pago' ? 'default' : 'secondary'}>
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.email_sent ? 'default' : 'outline'}>
                        {order.email_sent ? 'Enviado' : 'Não enviado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(order)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NewInsertionOrderModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        editingOrder={editingOrder}
      />
    </div>
  );
}
