import { z } from 'zod';

// Common validation schemas
export const userInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  email: z.string().email('E-mail inválido').max(255, 'E-mail muito longo'),
  phone: z.string().optional().refine(
    (phone) => !phone || /^\+?[\d\s\-\(\)]+$/.test(phone),
    'Telefone inválido'
  ),
  message: z.string().min(10, 'Mensagem muito curta').max(5000, 'Mensagem muito longa'),
  subject: z.string().min(5, 'Assunto muito curto').max(200, 'Assunto muito longo')
});

export const newsSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  subtitle: z.string().optional(),
  meta_description: z.string().min(1, 'Meta-descrição é obrigatória').max(160, 'Meta-descrição muito longa'),
  content: z.string().min(50, 'Conteúdo muito curto').max(50000, 'Conteúdo muito longo'),
  category_id: z.string().uuid('ID da categoria inválido'),
  tags: z.array(z.string().max(50, 'Tag muito longa')).optional(),
  embed_code: z.string().optional(),
  is_breaking: z.boolean().optional(),
  is_featured: z.boolean().optional()
});

export const userRoleSchema = z.object({
  user_id: z.string().uuid('ID do usuário inválido'),
  role: z.enum(['admin', 'redator'])
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  slug: z.string().min(1, 'Slug é obrigatório').max(100, 'Slug muito longo').regex(
    /^[a-z0-9-]+$/,
    'Slug deve conter apenas letras minúsculas, números e hífens'
  ),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida').optional(),
  icon: z.string().optional(),
  sort_order: z.number().int().optional()
});

export const advertisementSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  position: z.string().min(1, 'Posição é obrigatória'),
  ad_code: z.string().optional().refine(
    (code) => !code || code.length <= 10000,
    'Código do anúncio muito longo'
  ),
  image_url: z.string().url('URL da imagem inválida').optional(),
  link_url: z.string().url('URL do link inválida').optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  is_active: z.boolean().optional()
});

// Function to validate and sanitize data
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
) => {
  try {
    const result = schema.parse(data);
    return { success: true as const, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false as const, 
        errors: error.issues.map(e => e.message) 
      };
    }
    return { 
      success: false as const, 
      errors: ['Erro de validação desconhecido'] 
    };
  }
};

// Utility functions for input sanitization
export const sanitizeString = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  return email
    .trim()
    .toLowerCase()
    .substring(0, 255);
};

export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
};