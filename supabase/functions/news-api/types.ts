// Types for News API

export interface NewsImage {
  base64: string;
  caption?: string;
  is_cover?: boolean;
}

export interface CreateNewsRequest {
  title: string;
  subtitle?: string;
  content: string;
  meta_description?: string;
  category_id: string;
  author_id: string;
  tags?: string[];
  is_breaking?: boolean;
  images?: NewsImage[];
}

export interface NewsApiResponse {
  data?: any;
  count?: number;
  limit?: number;
  offset?: number;
  error?: string;
  message?: string;
}

export interface GetNewsParams {
  category?: string;
  author_id?: string;
  tags?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCreateNews(body: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Validar título
  if (!body.title || typeof body.title !== 'string') {
    errors.push({ field: 'title', message: 'Título é obrigatório' });
  } else if (body.title.length < 10) {
    errors.push({ field: 'title', message: 'Título deve ter no mínimo 10 caracteres' });
  }

  // Validar conteúdo
  if (!body.content || typeof body.content !== 'string') {
    errors.push({ field: 'content', message: 'Conteúdo é obrigatório' });
  } else if (body.content.length < 100) {
    errors.push({ field: 'content', message: 'Conteúdo deve ter no mínimo 100 caracteres' });
  }

  // Validar category_id
  if (!body.category_id || typeof body.category_id !== 'string') {
    errors.push({ field: 'category_id', message: 'ID da categoria é obrigatório' });
  }

  // Validar author_id
  if (!body.author_id || typeof body.author_id !== 'string') {
    errors.push({ field: 'author_id', message: 'ID do autor é obrigatório' });
  }

  // Validar imagens (opcional)
  if (body.images) {
    if (!Array.isArray(body.images)) {
      errors.push({ field: 'images', message: 'Imagens deve ser um array' });
    } else if (body.images.length > 10) {
      errors.push({ field: 'images', message: 'Máximo de 10 imagens permitidas' });
    } else {
      body.images.forEach((img: any, index: number) => {
        if (!img.base64 || typeof img.base64 !== 'string') {
          errors.push({ field: `images[${index}]`, message: 'Campo base64 é obrigatório' });
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

