import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Calendar } from "lucide-react";

export const HRCalculator = () => {
  // Configuração da Jornada
  const [horasPorDia, setHorasPorDia] = useState<number>(8);
  const [diasPorSemana, setDiasPorSemana] = useState<number>(5);
  const horasMensais = horasPorDia * diasPorSemana * 5;

  // Salário + Horas Extras
  const [salarioBase, setSalarioBase] = useState<string>("");
  const [horas50, setHoras50] = useState<string>("");
  const [horas100, setHoras100] = useState<string>("");
  const [totalMensal, setTotalMensal] = useState<number | null>(null);

  // Calculadora de Férias
  const [salarioFerias, setSalarioFerias] = useState<string>("");
  const [diasFerias, setDiasFerias] = useState<number>(30);
  const [valorFerias, setValorFerias] = useState<number | null>(null);

  const calcularMensal = () => {
    const salario = parseFloat(salarioBase.replace(",", ".")) || 0;
    const extras50 = parseFloat(horas50) || 0;
    const extras100 = parseFloat(horas100) || 0;

    if (salario === 0) return;

    const valorHora = salario / horasMensais;
    const valorExtras50 = extras50 * valorHora * 1.5;
    const valorExtras100 = extras100 * valorHora * 2;
    const total = salario + valorExtras50 + valorExtras100;

    setTotalMensal(total);
  };

  const calcularFerias = () => {
    const salario = parseFloat(salarioFerias.replace(",", ".")) || 0;
    
    if (salario === 0) return;

    // Férias = salário + 1/3 constitucional, proporcional aos dias
    const feriasProporcionais = (salario / 30) * diasFerias;
    const tercosConstitucionais = feriasProporcionais / 3;
    const total = feriasProporcionais + tercosConstitucionais;

    setValorFerias(total);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calculadoras de RH</h1>
        <p className="text-muted-foreground">Ferramentas para cálculos relacionados a recursos humanos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Configuração da Jornada */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Configuração da Jornada</CardTitle>
            </div>
            <CardDescription>Defina sua jornada de trabalho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="horas-dia">Horas por Dia</Label>
              <Input
                id="horas-dia"
                type="number"
                value={horasPorDia}
                onChange={(e) => setHorasPorDia(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias-semana">Dias por Semana</Label>
              <Input
                id="dias-semana"
                type="number"
                value={diasPorSemana}
                onChange={(e) => setDiasPorSemana(parseFloat(e.target.value) || 0)}
                min="0"
                max="7"
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Horas Mensais Calculadas:</p>
              <p className="text-2xl font-bold text-primary">{horasMensais} horas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Fórmula: horas/dia × dias/semana × 5 (semanas/mês)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Salário + Horas Extras */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <CardTitle>Salário + Horas Extras</CardTitle>
            </div>
            <CardDescription>Calcule salário com extras</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salario-base">Salário Base (R$)</Label>
              <Input
                id="salario-base"
                placeholder="0,00"
                value={salarioBase}
                onChange={(e) => setSalarioBase(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas-50">Horas Extras (50%)</Label>
              <Input
                id="horas-50"
                type="number"
                placeholder="0"
                value={horas50}
                onChange={(e) => setHoras50(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas-100">Horas Extras (100%)</Label>
              <Input
                id="horas-100"
                type="number"
                placeholder="0"
                value={horas100}
                onChange={(e) => setHoras100(e.target.value)}
                min="0"
              />
            </div>

            <Button onClick={calcularMensal} className="w-full">
              Calcular Mensal
            </Button>

            {totalMensal !== null && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Total a Receber:</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalMensal)}</p>
              </div>
            )}

            {!totalMensal && (
              <p className="text-sm text-muted-foreground text-center">
                Preencha os valores e clique em calcular
              </p>
            )}
          </CardContent>
        </Card>

        {/* Calculadora de Férias */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Calculadora de Férias</CardTitle>
            </div>
            <CardDescription>Calcule valores de férias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salario-ferias">Salário Base (R$)</Label>
              <Input
                id="salario-ferias"
                placeholder="0,00"
                value={salarioFerias}
                onChange={(e) => setSalarioFerias(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias-ferias">Dias de Férias</Label>
              <Input
                id="dias-ferias"
                type="number"
                value={diasFerias}
                onChange={(e) => setDiasFerias(parseFloat(e.target.value) || 0)}
                min="0"
                max="30"
              />
            </div>

            <Button onClick={calcularFerias} className="w-full">
              Calcular Férias
            </Button>

            {valorFerias !== null && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Valor das Férias:</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(valorFerias)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Inclui 1/3 constitucional
                </p>
              </div>
            )}

            {!valorFerias && (
              <p className="text-sm text-muted-foreground text-center">
                Preencha os valores e clique em calcular
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
