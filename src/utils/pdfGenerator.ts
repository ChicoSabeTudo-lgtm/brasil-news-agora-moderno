import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinanceAdvertisement } from '@/hooks/useAdvertisements';

// Configurar jsPDF para suportar caracteres especiais
const setupJsPDF = () => {
  const doc = new jsPDF();
  
  // Configurar fonte padrão
  doc.setFont('helvetica');
  
  return doc;
};

// Função para sanitizar texto
const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text.toString().replace(/[^\x00-\x7F]/g, ''); // Remove caracteres especiais
};

interface ReportData {
  advertisements: FinanceAdvertisement[];
  clientName: string;
  period: {
    from: Date;
    to: Date;
  };
  generatedAt: Date;
}

const AD_TYPE_LABELS = {
  banner: 'Banner',
  reportagem: 'Reportagem',
  rede_social: 'Rede Social',
};

export const generateAdvertisementsReport = (data: ReportData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

  // Cores do tema
  const primaryColor = [41, 128, 185]; // Azul
  const secondaryColor = [52, 73, 94]; // Cinza escuro
  const lightGray = [236, 240, 241]; // Cinza claro

  // Função para adicionar texto com estilo
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    doc.setFontSize(options.fontSize || 12);
    doc.setTextColor(options.color || [0, 0, 0]);
    doc.text(text || '', x, y);
  };

  // Função para adicionar linha
  const addLine = (x1: number, y1: number, x2: number, y2: number, color: number[] = [0, 0, 0]) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(x1, y1, x2, y2);
  };

  // Função para adicionar retângulo
  const addRect = (x: number, y: number, width: number, height: number, color: number[] = [0, 0, 0], fill: boolean = false) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    if (fill) {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y, width, height, 'F');
    } else {
      doc.rect(x, y, width, height);
    }
  };

  // Cabeçalho simples
  addText('RELATORIO DE PROPAGANDAS', 20, 30, { fontSize: 18 });
  addText('ChicoSabeTudo - Sistema de Gestao', 20, 40, { fontSize: 12 });
  
  yPosition = 60;

  // Informações do relatório
  addText('DADOS DO RELATORIO', 20, yPosition, { fontSize: 14 });
  yPosition += 15;

  addText(`Cliente: ${data.clientName}`, 20, yPosition, { fontSize: 12 });
  yPosition += 10;

  addText(`Periodo: ${format(data.period.from, 'dd/MM/yyyy')} a ${format(data.period.to, 'dd/MM/yyyy')}`, 20, yPosition, { fontSize: 12 });
  yPosition += 10;

  addText(`Gerado em: ${format(data.generatedAt, 'dd/MM/yyyy HH:mm')}`, 20, yPosition, { fontSize: 12 });
  yPosition += 10;

  addText(`Total de propagandas: ${data.advertisements.length}`, 20, yPosition, { fontSize: 12 });
  yPosition += 20;

  // Estatísticas por tipo
  const typeStats = data.advertisements.reduce((acc, ad) => {
    acc[ad.ad_type] = (acc[ad.ad_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  addText('ESTATISTICAS POR TIPO', 20, yPosition, { fontSize: 14 });
  yPosition += 15;

  Object.entries(typeStats).forEach(([type, count]) => {
    addText(`${AD_TYPE_LABELS[type as keyof typeof AD_TYPE_LABELS]}: ${count}`, 30, yPosition, { fontSize: 11 });
    yPosition += 8;
  });

  yPosition += 15;

  // Lista de propagandas
  if (data.advertisements.length > 0) {
    addText('PROPAGANDAS DETALHADAS', 20, yPosition, { fontSize: 14 });
    yPosition += 15;

    data.advertisements.forEach((ad, index) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      addText(`${index + 1}. ${ad.client_name}`, 20, yPosition, { fontSize: 12 });
      yPosition += 8;
      
      addText(`   Tipo: ${AD_TYPE_LABELS[ad.ad_type]}`, 25, yPosition, { fontSize: 10 });
      yPosition += 6;
      
      addText(`   Inicio: ${format(new Date(ad.start_date), 'dd/MM/yyyy')}`, 25, yPosition, { fontSize: 10 });
      yPosition += 6;
      
      addText(`   Fim: ${format(new Date(ad.end_date), 'dd/MM/yyyy')}`, 25, yPosition, { fontSize: 10 });
      yPosition += 6;
      
      if (ad.link) {
        const linkText = ad.link.length > 50 ? ad.link.substring(0, 50) + '...' : ad.link;
        addText(`   Link: ${linkText}`, 25, yPosition, { fontSize: 10 });
        yPosition += 6;
      }
      
      yPosition += 10;
    });
  } else {
    addText('Nenhuma propaganda encontrada no periodo selecionado.', 20, yPosition, { fontSize: 12 });
  }

  // Rodapé
  const footerY = pageHeight - 20;
  addLine(20, footerY - 10, pageWidth - 20, footerY - 10);
  addText('Relatorio gerado automaticamente pelo sistema ChicoSabeTudo', 20, footerY - 5, { 
    fontSize: 8
  });

  return doc;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar o relatório PDF. Verifique os dados e tente novamente.');
  }
};

export const downloadAdvertisementsReport = (data: ReportData) => {
  try {
    // Validar dados de entrada
    if (!data || !data.advertisements || !Array.isArray(data.advertisements)) {
      throw new Error('Dados inválidos para gerar o relatório');
    }

    if (!data.clientName || !data.period) {
      throw new Error('Informações do cliente ou período não fornecidas');
    }

    const doc = generateAdvertisementsReport(data);
    
    // Criar nome do arquivo seguro
    const safeClientName = sanitizeText(data.clientName).replace(/\s+/g, '_').substring(0, 50);
    const fromDate = format(data.period.from, 'yyyy-MM-dd');
    const toDate = format(data.period.to, 'yyyy-MM-dd');
    const fileName = `relatorio_propagandas_${safeClientName}_${fromDate}_${toDate}.pdf`;
    
    doc.save(fileName);
  } catch (error) {
    console.error('Erro ao baixar relatório:', error);
    throw error;
  }
};
