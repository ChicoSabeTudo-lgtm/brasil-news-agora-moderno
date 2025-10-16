import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinanceAdvertisement } from '@/hooks/useAdvertisements';

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
    doc.text(text, x, y);
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

  // Cabeçalho
  addRect(0, 0, pageWidth, 40, primaryColor, true);
  addText('RELATÓRIO DE PROPAGANDAS', 20, 25, { 
    fontSize: 20, 
    color: [255, 255, 255] 
  });
  
  addText('ChicoSabeTudo - Sistema de Gestão', 20, 35, { 
    fontSize: 12, 
    color: [255, 255, 255] 
  });

  yPosition = 60;

  // Informações do relatório
  addText('DADOS DO RELATÓRIO', 20, yPosition, { fontSize: 16, color: secondaryColor });
  yPosition += 10;

  addText(`Cliente: ${data.clientName}`, 20, yPosition, { fontSize: 12 });
  yPosition += 8;

  addText(`Período: ${format(data.period.from, 'dd/MM/yyyy', { locale: ptBR })} a ${format(data.period.to, 'dd/MM/yyyy', { locale: ptBR })}`, 20, yPosition, { fontSize: 12 });
  yPosition += 8;

  addText(`Gerado em: ${format(data.generatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, yPosition, { fontSize: 12 });
  yPosition += 8;

  addText(`Total de propagandas: ${data.advertisements.length}`, 20, yPosition, { fontSize: 12 });
  yPosition += 15;

  // Estatísticas por tipo
  const typeStats = data.advertisements.reduce((acc, ad) => {
    acc[ad.ad_type] = (acc[ad.ad_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  addText('ESTATÍSTICAS POR TIPO', 20, yPosition, { fontSize: 14, color: secondaryColor });
  yPosition += 10;

  Object.entries(typeStats).forEach(([type, count]) => {
    addText(`${AD_TYPE_LABELS[type as keyof typeof AD_TYPE_LABELS]}: ${count}`, 30, yPosition, { fontSize: 11 });
    yPosition += 6;
  });

  yPosition += 10;

  // Tabela de propagandas
  if (data.advertisements.length > 0) {
    addText('PROPAGANDAS DETALHADAS', 20, yPosition, { fontSize: 14, color: secondaryColor });
    yPosition += 10;

    // Cabeçalho da tabela
    const tableY = yPosition;
    const colWidths = [40, 30, 25, 25, 70];
    const colX = [20, 60, 90, 115, 140];
    
    // Fundo do cabeçalho
    addRect(20, tableY - 5, pageWidth - 40, 15, primaryColor, true);
    
    addText('Cliente', colX[0], tableY + 3, { fontSize: 10, color: [255, 255, 255] });
    addText('Tipo', colX[1], tableY + 3, { fontSize: 10, color: [255, 255, 255] });
    addText('Início', colX[2], tableY + 3, { fontSize: 10, color: [255, 255, 255] });
    addText('Fim', colX[3], tableY + 3, { fontSize: 10, color: [255, 255, 255] });
    addText('Link', colX[4], tableY + 3, { fontSize: 10, color: [255, 255, 255] });

    yPosition += 15;

    // Linhas da tabela
    data.advertisements.forEach((ad, index) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      // Fundo alternado das linhas
      if (index % 2 === 0) {
        addRect(20, yPosition - 5, pageWidth - 40, 10, lightGray, true);
      }

      addText(ad.client_name, colX[0], yPosition + 3, { fontSize: 9 });
      addText(AD_TYPE_LABELS[ad.ad_type], colX[1], yPosition + 3, { fontSize: 9 });
      addText(format(new Date(ad.start_date), 'dd/MM/yyyy'), colX[2], yPosition + 3, { fontSize: 9 });
      addText(format(new Date(ad.end_date), 'dd/MM/yyyy'), colX[3], yPosition + 3, { fontSize: 9 });
      
      // Truncar link se muito longo
      const linkText = ad.link ? (ad.link.length > 30 ? ad.link.substring(0, 30) + '...' : ad.link) : '-';
      addText(linkText, colX[4], yPosition + 3, { fontSize: 9 });

      yPosition += 10;
    });

    // Linha final da tabela
    addLine(20, yPosition - 5, pageWidth - 20, yPosition - 5, secondaryColor);
  } else {
    addText('Nenhuma propaganda encontrada no período selecionado.', 20, yPosition, { fontSize: 12, color: secondaryColor });
  }

  // Rodapé
  const footerY = pageHeight - 20;
  addLine(20, footerY - 10, pageWidth - 20, footerY - 10, lightGray);
  addText('Relatório gerado automaticamente pelo sistema ChicoSabeTudo', 20, footerY - 5, { 
    fontSize: 8, 
    color: secondaryColor 
  });

  return doc;
};

export const downloadAdvertisementsReport = (data: ReportData) => {
  const doc = generateAdvertisementsReport(data);
  const fileName = `relatorio_propagandas_${data.clientName.replace(/\s+/g, '_')}_${format(data.period.from, 'yyyy-MM-dd')}_${format(data.period.to, 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};
