import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export function FinanceDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Visão Financeira</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-2xl font-semibold">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              0,00
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Faturas em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

