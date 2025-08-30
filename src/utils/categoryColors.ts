import { useEffect } from 'react';

// Cores padrão por categoria
const DEFAULT_CATEGORY_COLORS = {
  'policia': '#dc2626', // vermelho
  'politica': '#7c3aed', // roxo
  'esportes': '#2563eb', // azul
  'economia': '#059669', // verde
  'tecnologia': '#ea580c', // laranja
  'saude': '#db2777', // rosa
  'entretenimento': '#8b5cf6', // violeta
  'internacional': '#0891b2', // ciano
  'nacional': '#dc2626', // vermelho
  'default': '#0066cc' // azul padrão
};

// Função para obter a cor da categoria
export const getCategoryColor = (categorySlug?: string, categoryColor?: string): string => {
  if (categoryColor) return categoryColor;
  
  if (!categorySlug) return DEFAULT_CATEGORY_COLORS.default;
  
  return DEFAULT_CATEGORY_COLORS[categorySlug as keyof typeof DEFAULT_CATEGORY_COLORS] || DEFAULT_CATEGORY_COLORS.default;
};

// Função para aplicar cores dinâmicas via CSS Custom Properties
export const applyCategoryColors = (categorySlug?: string, categoryColor?: string) => {
  // Verificar se estamos no browser
  if (typeof document === 'undefined') return;
  
  const color = getCategoryColor(categorySlug, categoryColor);
  
  // Converter hex para hsl
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const hslColor = hexToHsl(color);
  
  // Aplicar as variáveis CSS
  document.documentElement.style.setProperty('--category-primary', hslColor);
  document.documentElement.style.setProperty('--category-primary-rgb', color);
  
  // Variações da cor
  const h = parseInt(hslColor.split(' ')[0]);
  const s = parseInt(hslColor.split(' ')[1]);
  const l = parseInt(hslColor.split(' ')[2]);
  
  // Cor mais clara para hovers
  document.documentElement.style.setProperty('--category-primary-hover', `${h} ${s}% ${Math.min(l + 10, 95)}%`);
  
  // Cor mais escura para focus
  document.documentElement.style.setProperty('--category-primary-dark', `${h} ${s}% ${Math.max(l - 15, 10)}%`);
  
  // Cor com transparência para fundos
  document.documentElement.style.setProperty('--category-primary-alpha', `${h} ${s}% ${l}% / 0.1`);
  document.documentElement.style.setProperty('--category-primary-alpha-hover', `${h} ${s}% ${l}% / 0.2`);
};

// Hook personalizado para aplicar cores dinâmicas
export const useCategoryColors = (categorySlug?: string, categoryColor?: string) => {
  useEffect(() => {
    // Só aplicar cores se houver dados válidos
    if (categorySlug || categoryColor) {
      applyCategoryColors(categorySlug, categoryColor);
    }
    
    // Cleanup function para remover as variáveis quando o componente desmontar
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.removeProperty('--category-primary');
        document.documentElement.style.removeProperty('--category-primary-rgb');
        document.documentElement.style.removeProperty('--category-primary-hover');
        document.documentElement.style.removeProperty('--category-primary-dark');
        document.documentElement.style.removeProperty('--category-primary-alpha');
        document.documentElement.style.removeProperty('--category-primary-alpha-hover');
      }
    };
  }, [categorySlug, categoryColor]);
};