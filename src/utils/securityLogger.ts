/**
 * Security Logger - Monitoramento de eventos de segurança
 */

export enum SecurityEventType {
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGOUT = 'LOGOUT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SUSPICIOUS_UPLOAD = 'SUSPICIOUS_UPLOAD',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  USER_ROLE_CHANGE = 'USER_ROLE_CHANGE',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SCRIPT_BLOCKED = 'SCRIPT_BLOCKED'
}

export enum SecurityLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

interface SecurityEvent {
  type: SecurityEventType;
  level: SecurityLevel;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  details?: any;
  metadata?: Record<string, any>;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents: number = 1000;

  /**
   * Registra um evento de segurança
   */
  log(
    type: SecurityEventType,
    details?: any,
    metadata?: Record<string, any>
  ): void {
    const level = this.getSecurityLevel(type);
    
    const event: SecurityEvent = {
      type,
      level,
      timestamp: new Date(),
      ip: this.getClientIp(),
      userAgent: navigator?.userAgent,
      details,
      metadata
    };

    // Adicionar ao array
    this.events.unshift(event);
    
    // Manter apenas os últimos N eventos
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Log no console com cor apropriada
    this.consoleLog(event);

    // Enviar eventos críticos para o servidor
    if (level === SecurityLevel.CRITICAL) {
      this.sendToServer(event);
    }

    // Persistir localmente (opcional)
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('security_last_event', JSON.stringify(event));
      } catch (e) {
        // Ignorar erro de storage
      }
    }
  }

  /**
   * Determina o nível de segurança baseado no tipo
   */
  private getSecurityLevel(type: SecurityEventType): SecurityLevel {
    const criticalEvents = [
      SecurityEventType.SQL_INJECTION_ATTEMPT,
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventType.UNAUTHORIZED_ACCESS
    ];

    const warningEvents = [
      SecurityEventType.LOGIN_FAILED,
      SecurityEventType.PERMISSION_DENIED,
      SecurityEventType.SUSPICIOUS_UPLOAD,
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventType.INVALID_TOKEN,
      SecurityEventType.SCRIPT_BLOCKED
    ];

    if (criticalEvents.includes(type)) return SecurityLevel.CRITICAL;
    if (warningEvents.includes(type)) return SecurityLevel.WARNING;
    return SecurityLevel.INFO;
  }

  /**
   * Log formatado no console
   */
  private consoleLog(event: SecurityEvent): void {
    const emoji = event.level === SecurityLevel.CRITICAL ? '🚨' :
                  event.level === SecurityLevel.WARNING ? '⚠️' : 'ℹ️';
    
    const style = event.level === SecurityLevel.CRITICAL ? 'color: red; font-weight: bold' :
                  event.level === SecurityLevel.WARNING ? 'color: orange' : 'color: blue';

    console.log(
      `%c${emoji} [SECURITY ${event.level}] ${event.type}`,
      style,
      {
        timestamp: event.timestamp.toISOString(),
        details: event.details,
        ip: event.ip,
        userAgent: event.userAgent,
        metadata: event.metadata
      }
    );
  }

  /**
   * Obtém IP do cliente (aproximado)
   */
  private getClientIp(): string {
    // No browser, não podemos obter IP real
    // Isso seria feito no servidor
    return 'client';
  }

  /**
   * Envia evento para servidor (implementação futura)
   */
  private async sendToServer(event: SecurityEvent): Promise<void> {
    // Em produção, enviar para endpoint de logging
    // Por enquanto, apenas log
    if (import.meta.env.PROD) {
      try {
        // await fetch('/api/security-log', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(event)
        // });
      } catch (error) {
        console.error('Erro ao enviar evento de segurança:', error);
      }
    }
  }

  /**
   * Obtém eventos recentes
   */
  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.events.slice(0, limit);
  }

  /**
   * Filtra eventos por tipo
   */
  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter(e => e.type === type);
  }

  /**
   * Filtra eventos por nível
   */
  getEventsByLevel(level: SecurityLevel): SecurityEvent[] {
    return this.events.filter(e => e.level === level);
  }

  /**
   * Obtém estatísticas de eventos
   */
  getStats(): {
    total: number;
    byLevel: Record<SecurityLevel, number>;
    byType: Record<string, number>;
  } {
    const stats = {
      total: this.events.length,
      byLevel: {
        [SecurityLevel.INFO]: 0,
        [SecurityLevel.WARNING]: 0,
        [SecurityLevel.CRITICAL]: 0
      },
      byType: {} as Record<string, number>
    };

    this.events.forEach(event => {
      stats.byLevel[event.level]++;
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Limpa eventos antigos
   */
  clear(): void {
    this.events = [];
  }
}

// Instância singleton
export const securityLogger = new SecurityLogger();

// Funções de conveniência
export const logSecurityEvent = (
  type: SecurityEventType,
  details?: any,
  metadata?: Record<string, any>
) => securityLogger.log(type, details, metadata);

export const getSecurityStats = () => securityLogger.getStats();
export const getRecentSecurityEvents = (limit?: number) => securityLogger.getRecentEvents(limit);

