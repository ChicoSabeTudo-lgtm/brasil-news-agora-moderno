// Utility functions para lidar com datas e evitar problemas de timezone
// Usa o timezone America/Fortaleza (Brasília)

/**
 * Converte uma data do formato YYYY-MM-DD para Date object no timezone de Fortaleza
 * Evita problemas de mudança de dia ao converter UTC
 */
export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  // Se já tem hora, usar parseISO normal
  if (dateString.includes('T') || dateString.includes(' ')) {
    return new Date(dateString);
  }
  
  // Para formato YYYY-MM-DD, adicionar hora meio-dia para evitar problemas de timezone
  return new Date(dateString + 'T12:00:00');
};

/**
 * Formata uma data para o formato YYYY-MM-DD (para salvar no banco)
 * Usa timezone de Fortaleza
 */
export const formatDateForDB = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Usar toLocaleString com timezone de Fortaleza
  const fortalezaString = d.toLocaleString("sv-SE", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  
  // sv-SE retorna YYYY-MM-DD HH:mm:ss, extrair apenas a data
  return fortalezaString.split(' ')[0];
};

/**
 * Converte input type="date" (YYYY-MM-DD) para formato seguro
 * Garante que a data não mude ao salvar
 */
export const dateInputToISO = (dateInput: string): string => {
  if (!dateInput) return '';
  
  // Adicionar hora meio-dia para evitar problemas de timezone
  return dateInput + 'T12:00:00.000Z';
};

/**
 * Converte data do banco (DATE ou TIMESTAMP) para input type="date"
 */
export const dateFromDB = (dbDate: string): string => {
  if (!dbDate) return '';
  
  // Extrair apenas a parte YYYY-MM-DD
  return dbDate.split('T')[0];
};

/**
 * Obtém a data atual no timezone de Fortaleza no formato YYYY-MM-DD
 */
export const getTodayFortaleza = (): string => {
  const now = new Date();
  return formatDateForDB(now);
};

/**
 * Formata data para exibição (dd/MM/yyyy)
 */
export const formatDateDisplay = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};
