/**
 * Rate Limiter para proteger contra abuso de APIs
 * Usa Map em memória - para produção considere Redis ou similar
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Limpar entradas antigas periodicamente
    setInterval(() => this.cleanup(), windowMs);
  }

  /**
   * Verifica se uma requisição deve ser permitida
   * @param identifier - Identificador único (IP, user ID, etc)
   * @returns true se permitido, false se rate limit excedido
   */
  check(identifier: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // Se não existe ou expirou, criar nova entrada
    if (!entry || now > entry.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    // Se ainda está dentro do limite
    if (entry.count < this.maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limit excedido
    console.warn(`[RATE LIMIT] Bloqueado: ${identifier} (${entry.count}/${this.maxRequests})`);
    return false;
  }

  /**
   * Retorna informações sobre o rate limit atual
   */
  getInfo(identifier: string): { remaining: number; resetTime: number } | null {
    const entry = this.requests.get(identifier);
    
    if (!entry || Date.now() > entry.resetTime) {
      return { remaining: this.maxRequests, resetTime: Date.now() + this.windowMs };
    }

    return {
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  /**
   * Limpa entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Reseta o contador para um identificador específico
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Instâncias pré-configuradas para diferentes casos de uso
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 req/min
export const authRateLimiter = new RateLimiter(5, 60000); // 5 req/min para auth
export const uploadRateLimiter = new RateLimiter(10, 60000); // 10 uploads/min
export const strictRateLimiter = new RateLimiter(30, 60000); // 30 req/min

export default RateLimiter;

