/**
 * Input Validator - Validações de segurança para inputs do usuário
 */

// Whitelist de domínios permitidos para URLs
const ALLOWED_URL_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'tiktok.com',
  'soundcloud.com',
  'spotify.com',
  'chicosabetudo.sigametech.com.br',
  'spgusjrjrhfychhdwixn.supabase.co'
];

// Lista de domínios de email suspeitos
const SUSPICIOUS_EMAIL_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'mailinator.com'
];

/**
 * Valida se uma URL é segura e de domínio permitido
 */
export function validateUrl(url: string, allowedDomains: string[] = ALLOWED_URL_DOMAINS): {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
} {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL inválida' };
  }

  try {
    const urlObj = new URL(url.trim());

    // Verificar protocolo
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Protocolo não permitido. Use http ou https' };
    }

    // Verificar domínio permitido
    const isDomainAllowed = allowedDomains.some(domain =>
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );

    if (!isDomainAllowed) {
      return { isValid: false, error: 'Domínio não permitido' };
    }

    return { isValid: true, sanitizedUrl: urlObj.toString() };
  } catch (error) {
    return { isValid: false, error: 'Formato de URL inválido' };
  }
}

/**
 * Valida email e verifica domínios suspeitos
 */
export function validateEmail(email: string): {
  isValid: boolean;
  sanitizedEmail?: string;
  warnings?: string[];
} {
  if (!email || typeof email !== 'string') {
    return { isValid: false };
  }

  const trimmed = email.trim().toLowerCase();
  
  // Regex básico para email
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  
  if (!emailRegex.test(trimmed)) {
    return { isValid: false };
  }

  const warnings: string[] = [];
  const domain = trimmed.split('@')[1];

  // Verificar domínios suspeitos
  if (SUSPICIOUS_EMAIL_DOMAINS.some(suspicious => domain.includes(suspicious))) {
    warnings.push('Email de domínio temporário detectado');
  }

  return {
    isValid: true,
    sanitizedEmail: trimmed,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Valida arquivo de upload
 */
export function validateFileUpload(file: File, options: {
  maxSizeMB?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
} = {}): {
  isValid: boolean;
  error?: string;
} {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif']
  } = options;

  // Validar tamanho
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB`
    };
  }

  // Validar tipo MIME
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido: ${file.type}`
    };
  }

  // Validar extensão
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Extensão não permitida: ${extension}`
    };
  }

  return { isValid: true };
}

/**
 * Sanitiza string para prevenir SQL injection e XSS
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return '';

  let sanitized = input
    .trim()
    .substring(0, maxLength)
    // Remover caracteres de controle
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Escapar caracteres perigosos
    .replace(/[<>]/g, '');

  return sanitized;
}

/**
 * Valida slug (apenas letras, números, hífens)
 */
export function validateSlug(slug: string): {
  isValid: boolean;
  sanitizedSlug?: string;
  error?: string;
} {
  if (!slug || typeof slug !== 'string') {
    return { isValid: false, error: 'Slug inválido' };
  }

  const trimmed = slug.trim().toLowerCase();
  
  // Apenas letras minúsculas, números e hífens
  const slugRegex = /^[a-z0-9-]+$/;
  
  if (!slugRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Slug deve conter apenas letras minúsculas, números e hífens'
    };
  }

  // Não pode começar ou terminar com hífen
  if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
    return {
      isValid: false,
      error: 'Slug não pode começar ou terminar com hífen'
    };
  }

  return { isValid: true, sanitizedSlug: trimmed };
}

/**
 * Valida número (previne injection)
 */
export function validateNumber(value: any, options: {
  min?: number;
  max?: number;
  integer?: boolean;
} = {}): {
  isValid: boolean;
  value?: number;
  error?: string;
} {
  const num = Number(value);

  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, error: 'Não é um número válido' };
  }

  if (options.integer && !Number.isInteger(num)) {
    return { isValid: false, error: 'Deve ser um número inteiro' };
  }

  if (options.min !== undefined && num < options.min) {
    return { isValid: false, error: `Valor mínimo: ${options.min}` };
  }

  if (options.max !== undefined && num > options.max) {
    return { isValid: false, error: `Valor máximo: ${options.max}` };
  }

  return { isValid: true, value: num };
}

/**
 * Detecta possíveis tentativas de SQL injection
 */
export function detectSQLInjection(input: string): boolean {
  if (!input) return false;

  const sqlPatterns = [
    /(\bunion\b.*\bselect\b)/i,
    /(\bselect\b.*\bfrom\b)/i,
    /(\binsert\b.*\binto\b)/i,
    /(\bdelete\b.*\bfrom\b)/i,
    /(\bdrop\b.*\btable\b)/i,
    /(\bexec\b.*\()/i,
    /(\bexecute\b.*\()/i,
    /(;.*--)/,
    /(\/\*.*\*\/)/,
    /(\bor\b.*=.*)/i,
    /(\band\b.*=.*)/i
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detecta possíveis tentativas de XSS
 */
export function detectXSS(input: string): boolean {
  if (!input) return false;

  const xssPatterns = [
    /<script\b[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onerror, etc
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Validação completa de input de texto
 */
export function validateTextInput(input: string, options: {
  maxLength?: number;
  minLength?: number;
  allowHtml?: boolean;
  checkSqlInjection?: boolean;
  checkXss?: boolean;
} = {}): {
  isValid: boolean;
  sanitized?: string;
  errors?: string[];
  warnings?: string[];
} {
  const {
    maxLength = 10000,
    minLength = 0,
    allowHtml = false,
    checkSqlInjection = true,
    checkXss = true
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input) {
    if (minLength > 0) {
      errors.push('Campo obrigatório');
    }
    return { isValid: errors.length === 0, errors };
  }

  if (input.length < minLength) {
    errors.push(`Mínimo de ${minLength} caracteres`);
  }

  if (input.length > maxLength) {
    errors.push(`Máximo de ${maxLength} caracteres`);
  }

  // Detecções de segurança
  if (checkSqlInjection && detectSQLInjection(input)) {
    errors.push('Padrão de SQL injection detectado');
    warnings.push('Input bloqueado por segurança');
  }

  if (checkXss && detectXSS(input)) {
    errors.push('Padrão de XSS detectado');
    warnings.push('Input bloqueado por segurança');
  }

  const sanitized = allowHtml ? input : sanitizeString(input, maxLength);

  return {
    isValid: errors.length === 0,
    sanitized,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

