import { ReactNode } from 'react';

export function insertInContentAds(content: string, newsId: string): string {
  // Dividir o conteúdo em parágrafos
  const paragraphs = content.split(/(<p[^>]*>.*?<\/p>)/gi).filter(p => p.trim());
  
  let result = '';
  let paragraphCount = 0;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    
    // Se é um parágrafo válido, incrementar contador
    if (paragraph.match(/<p[^>]*>.*?<\/p>/gi)) {
      paragraphCount++;
      
      // Inserir placeholder para anúncio antes deste parágrafo se necessário
      result += `<div data-in-content-ad="${newsId}" data-paragraph="${paragraphCount}"></div>`;
    }
    
    result += paragraph;
  }
  
  return result;
}

export function countParagraphs(content: string): number {
  const paragraphs = content.match(/<p[^>]*>.*?<\/p>/gi);
  return paragraphs ? paragraphs.length : 0;
}