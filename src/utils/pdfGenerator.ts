import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinanceAdvertisement } from '@/hooks/useAdvertisements';

// Função para normalizar texto com acentos para compatibilidade com jsPDF
const normalizeText = (text: string): string => {
  if (!text) return '';
  
  try {
    // Usar normalize do JavaScript para remover acentos
    return text
      .normalize('NFD') // Decompõe os caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remove os diacríticos
      .replace(/[^\x00-\x7F]/g, ''); // Remove caracteres não-ASCII restantes
  } catch (error) {
    console.error('Erro ao normalizar texto:', error);
    // Fallback: retornar texto original
    return text;
  }
};

// Função para sanitizar texto para nome de arquivo
const sanitizeText = (text: string): string => {
  if (!text) return '';
  return normalizeText(text).replace(/[^a-zA-Z0-9_-]/g, '_');
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
    console.log('Iniciando geracao de PDF com dados:', {
      clientName: data.clientName,
      adsCount: data.advertisements?.length,
      period: data.period
    });

    // Validações
    if (!data) {
      throw new Error('Dados do relatorio nao fornecidos');
    }
    
    if (!data.advertisements || !Array.isArray(data.advertisements)) {
      throw new Error('Lista de propagandas invalida');
    }

    if (!data.clientName) {
      throw new Error('Nome do cliente nao fornecido');
    }

    if (!data.period || !data.period.from || !data.period.to) {
      throw new Error('Periodo nao fornecido');
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    
    console.log('jsPDF inicializado com sucesso');
  
  // Testar normalização
  const testNormalize = normalizeText('RELATÓRIO DE PROPAGANDAS');
  console.log('🧪 Teste de normalização: "RELATÓRIO" →', testNormalize);
  if (!testNormalize || testNormalize.length === 0) {
    console.error('⚠️ ALERTA: Função de normalização está removendo todo o texto!');
  }

  // Função auxiliar para formatar data com segurança
  const safeFormatDate = (date: any, formatStr: string): string => {
    try {
      if (!date) return 'Data invalida';
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Data invalida';
      return format(dateObj, formatStr);
    } catch (error) {
      console.error('Erro ao formatar data:', error, date);
      return 'Data invalida';
    }
  };

  // Cores do tema
  const primaryColor = [41, 128, 185]; // Azul
  const secondaryColor = [52, 73, 94]; // Cinza escuro
  const lightGray = [236, 240, 241]; // Cinza claro

  // Função para adicionar texto com estilo (normaliza acentos)
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    try {
      // Validar parâmetros
      if (typeof x !== 'number' || isNaN(x) || !isFinite(x)) {
        console.error('Coordenada X inválida:', x);
        return;
      }
      if (typeof y !== 'number' || isNaN(y) || !isFinite(y)) {
        console.error('Coordenada Y inválida:', y);
        return;
      }
      
      const fontSize = options.fontSize || 12;
      if (typeof fontSize !== 'number' || isNaN(fontSize)) {
        console.error('Tamanho de fonte inválido:', fontSize);
        return;
      }
      
      doc.setFontSize(fontSize);
      
      // Configurar cor do texto
      if (options.color && Array.isArray(options.color)) {
        doc.setTextColor(options.color[0], options.color[1], options.color[2]);
      } else {
        doc.setTextColor(0, 0, 0); // Preto padrão
      }
      
      // Garantir que o texto é uma string válida
      const textStr = String(text || '');
      let normalizedText = normalizeText(textStr);
      
      // Se a normalização retornou vazio mas o original não estava, use o original
      if ((!normalizedText || normalizedText.length === 0) && textStr.length > 0) {
        console.warn('⚠️ Normalização removeu todo o texto, usando original:', textStr);
        normalizedText = textStr.replace(/[^\x00-\xFF]/g, '?'); // Substitui não-ASCII por ?
      }
      
      if (normalizedText && normalizedText.length > 0) {
        // Adicionar texto com opções explícitas para garantir renderização
        doc.text(normalizedText, x, y, {
          baseline: 'top',
          align: 'left'
        });
        console.log(`✓ Texto renderizado: "${normalizedText.substring(0, 50)}..." em (${x}, ${y})`);
      } else {
        console.error('❌ Texto completamente vazio:', { original: textStr, normalized: normalizedText });
      }
    } catch (error) {
      console.error('Erro ao adicionar texto:', error, { text, x, y, options });
    }
  };

  // Função para adicionar linha
  const addLine = (x1: number, y1: number, x2: number, y2: number, color: number[] = [0, 0, 0]) => {
    try {
      if ([x1, y1, x2, y2].some(v => typeof v !== 'number' || isNaN(v) || !isFinite(v))) {
        console.error('Coordenadas de linha inválidas:', { x1, y1, x2, y2 });
        return;
      }
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.line(x1, y1, x2, y2);
    } catch (error) {
      console.error('Erro ao adicionar linha:', error);
    }
  };

  // Função para adicionar retângulo
  const addRect = (x: number, y: number, width: number, height: number, color: number[] = [0, 0, 0], fill: boolean = false) => {
    try {
      if ([x, y, width, height].some(v => typeof v !== 'number' || isNaN(v) || !isFinite(v))) {
        console.error('Parâmetros de retângulo inválidos:', { x, y, width, height });
        return;
      }
      doc.setDrawColor(color[0], color[1], color[2]);
      if (fill) {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(x, y, width, height, 'F');
      } else {
        doc.rect(x, y, width, height);
      }
    } catch (error) {
      console.error('Erro ao adicionar retângulo:', error);
    }
  };

  const addRoundedPanel = (
    x: number,
    y: number,
    width: number,
    height: number,
    options: { fill: number[]; border?: number[]; stroke?: boolean }
  ) => {
    try {
      if ([x, y, width, height].some(v => typeof v !== 'number' || isNaN(v) || !isFinite(v))) {
        console.error('Parâmetros de painel inválidos:', { x, y, width, height });
        return;
      }

      const { fill, border, stroke = true } = options;
      if (Array.isArray(fill)) {
        doc.setFillColor(fill[0], fill[1], fill[2]);
      }
      if (Array.isArray(border)) {
        doc.setDrawColor(border[0], border[1], border[2]);
      } else {
        doc.setDrawColor(fill[0], fill[1], fill[2]);
      }

      const style = stroke ? 'DF' : 'F';
      doc.roundedRect(x, y, width, height, 3, 3, style as any);
    } catch (error) {
      console.error('Erro ao adicionar painel arredondado:', error);
    }
  };

  // Hero header
  console.log('Adicionando cabeçalho do relatório...');
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 55, 'F');

  addText('Relatorio de Propagandas', 20, 18, { fontSize: 20, color: [255, 255, 255] });
  addText('Resumo executivo de performance comercial', 20, 32, { fontSize: 11, color: [220, 235, 245] });

  // Badge com período
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 70, 16, 50, 18, 3, 3, 'F');
  addText('PDF', pageWidth - 62, 20, { fontSize: 10, color: primaryColor });
  addText('Relatorio', pageWidth - 62, 28, { fontSize: 8, color: secondaryColor });

  yPosition = 70;
  console.log('Posição Y inicial:', yPosition);

  // Resumo principal
  addText('Resumo Geral', 20, yPosition, { fontSize: 14, color: secondaryColor });
  yPosition += 8;
  addLine(20, yPosition, pageWidth - 20, yPosition, [230, 236, 245]);
  yPosition += 6;

  const summaryCards = [
    {
      label: 'Cliente',
      value: data.clientName,
      icon: '👤'
    },
    {
      label: 'Período',
      value: `${safeFormatDate(data.period.from, 'dd/MM/yyyy')} a ${safeFormatDate(data.period.to, 'dd/MM/yyyy')}`,
      icon: '🗓️'
    },
    {
      label: 'Total de Propagandas',
      value: data.advertisements.length.toString(),
      icon: '📊'
    },
    {
      label: 'Relatório Gerado',
      value: safeFormatDate(data.generatedAt, 'dd/MM/yyyy HH:mm'),
      icon: '⏱️'
    }
  ];

  const cardWidth = (pageWidth - 50) / 2;
  const cardHeight = 26;
  summaryCards.forEach((card, idx) => {
    const isLeftColumn = idx % 2 === 0;
    const cardX = isLeftColumn ? 20 : 30 + cardWidth;
    if (!isLeftColumn) {
      // mesma linha
    } else if (idx !== 0) {
      yPosition += cardHeight + 6;
    }

    addRoundedPanel(cardX, yPosition, cardWidth, cardHeight, {
      fill: [247, 249, 252],
      border: [229, 234, 242],
      stroke: true
    });

    addText(`${card.icon} ${card.label}`, cardX + 8, yPosition + 4, { fontSize: 10, color: secondaryColor });
    addText(card.value, cardX + 8, yPosition + 14, { fontSize: 12, color: [33, 37, 41] });
  });

  yPosition += cardHeight + 18;

  // Estatísticas por tipo com badges
  const typeStats = data.advertisements.reduce((acc, ad) => {
    acc[ad.ad_type] = (acc[ad.ad_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  addText('Performance por Tipo de Mídia', 20, yPosition, { fontSize: 14, color: secondaryColor });
  yPosition += 8;
  addLine(20, yPosition, pageWidth - 20, yPosition, [230, 236, 245]);
  yPosition += 10;

  if (Object.keys(typeStats).length > 0) {
    let badgeX = 20;
    const badgeY = yPosition;
    Object.entries(typeStats).forEach(([type, count]) => {
      const label = `${AD_TYPE_LABELS[type as keyof typeof AD_TYPE_LABELS] || type} · ${count}`;
      const badgeWidth = Math.min(80 + (label.length * 2), pageWidth - 40);

      addRoundedPanel(badgeX, badgeY, badgeWidth, 14, {
        fill: [231, 245, 255],
        border: [206, 231, 255],
        stroke: true
      });
      addText(label, badgeX + 4, badgeY + 3, { fontSize: 9, color: [15, 76, 117] });

      badgeX += badgeWidth + 6;
      if (badgeX + badgeWidth > pageWidth - 20) {
        badgeX = 20;
        yPosition += 18;
      }
    });
    yPosition += 22;
  } else {
    addText('Nenhum tipo de mídia contabilizado no período.', 20, yPosition, { fontSize: 11, color: [110, 118, 129] });
    yPosition += 20;
  }

  // Lista de propagandas em cards
  if (data.advertisements.length > 0) {
    addText('Propagandas Detalhadas', 20, yPosition, { fontSize: 14, color: secondaryColor });
    yPosition += 8;
    addLine(20, yPosition, pageWidth - 20, yPosition, [230, 236, 245]);
    yPosition += 12;

    data.advertisements.forEach((ad, index) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      const cardStartY = yPosition;
      const cardHeight = 34 + (ad.link ? 6 : 0);
      addRoundedPanel(20, yPosition - 4, pageWidth - 40, cardHeight, {
        fill: [255, 255, 255],
        border: [232, 236, 241],
        stroke: true
      });

      addText(`#${index + 1} ${ad.client_name || 'Cliente nao informado'}`, 28, cardStartY, { fontSize: 12, color: [24, 29, 35] });
      
      const statusColor = (() => {
        const now = new Date();
        const start = new Date(ad.start_date);
        const end = new Date(ad.end_date);
        if (start <= now && end >= now) return [46, 204, 113]; // ativo
        if (start > now) return [241, 196, 15]; // pendente
        return [236, 112, 99]; // finalizado
      })();

      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.circle(pageWidth - 40, cardStartY + 2, 1.5, 'F');

      const adTypeLabel = AD_TYPE_LABELS[ad.ad_type as keyof typeof AD_TYPE_LABELS] || ad.ad_type || 'Desconhecido';
      addText(`Tipo: ${adTypeLabel}`, 28, cardStartY + 9, { fontSize: 10, color: secondaryColor });
      addText(`Periodo: ${safeFormatDate(ad.start_date, 'dd/MM/yyyy')} — ${safeFormatDate(ad.end_date, 'dd/MM/yyyy')}`, 28, cardStartY + 16, { fontSize: 10 });

      if (ad.notes) {
        const notesPreview = normalizeText(ad.notes).slice(0, 90);
        addText(`Notas: ${notesPreview}${notesPreview.length === 90 ? '...' : ''}`, 28, cardStartY + 23, { fontSize: 9, color: [100, 110, 120] });
      }

      if (ad.link) {
        const linkText = normalizeText(ad.link.length > 70 ? ad.link.substring(0, 70) + '...' : ad.link);
        addText(`Link: ${linkText}`, 28, cardStartY + 30, { fontSize: 9, color: [25, 118, 210] });
      }
      
      yPosition += cardHeight + 8;
    });
  } else {
    addText('Nenhuma propaganda encontrada no periodo selecionado.', 20, yPosition, { fontSize: 11, color: [120, 127, 136] });
  }

  // Rodapé
  console.log('Adicionando rodapé...');
  const footerY = pageHeight - 20;
  addLine(20, footerY - 10, pageWidth - 20, footerY - 10);
  addText('Relatorio gerado automaticamente pelo sistema ChicoSabeTudo', 20, footerY - 5, { 
    fontSize: 8
  });

  console.log('PDF gerado com sucesso! Total de páginas:', doc.getNumberOfPages());
  console.log('Verifique se há avisos de "texto vazio" acima');
  return doc;
  } catch (error: any) {
    console.error('Erro detalhado ao gerar PDF:', {
      message: error?.message,
      stack: error?.stack,
      error: error
    });
    
    // Lançar erro mais específico
    if (error?.message) {
      throw new Error(`Erro ao gerar PDF: ${error.message}`);
    }
    
    throw new Error('Falha ao gerar o relatorio PDF. Verifique os dados e tente novamente.');
  }
};

export const downloadAdvertisementsReport = (data: ReportData) => {
  try {
    console.log('Iniciando download do relatorio PDF...');
    
    // Validar dados de entrada
    if (!data || !data.advertisements || !Array.isArray(data.advertisements)) {
      throw new Error('Dados invalidos para gerar o relatorio');
    }

    if (!data.clientName || !data.period) {
      throw new Error('Informacoes do cliente ou periodo nao fornecidas');
    }

    if (!data.period.from || !data.period.to) {
      throw new Error('Datas do periodo invalidas');
    }

    console.log('Gerando documento PDF...');
    const doc = generateAdvertisementsReport(data);
    
    if (!doc) {
      throw new Error('Falha ao criar documento PDF');
    }
    
    // Criar nome do arquivo seguro
    const safeClientName = sanitizeText(data.clientName).substring(0, 50);
    
    // Formatar datas com segurança
    let fromDate = 'data_inicio';
    let toDate = 'data_fim';
    try {
      fromDate = format(data.period.from instanceof Date ? data.period.from : new Date(data.period.from), 'yyyy-MM-dd');
      toDate = format(data.period.to instanceof Date ? data.period.to : new Date(data.period.to), 'yyyy-MM-dd');
    } catch (error) {
      console.error('Erro ao formatar datas para nome do arquivo:', error);
    }
    
    const fileName = `relatorio_propagandas_${safeClientName}_${fromDate}_${toDate}.pdf`;
    
    console.log('Salvando PDF com nome:', fileName);
    doc.save(fileName);
    console.log('PDF salvo com sucesso!');
    
  } catch (error: any) {
    console.error('Erro ao baixar relatorio:', {
      message: error?.message,
      stack: error?.stack,
      error: error
    });
    throw error;
  }
};
