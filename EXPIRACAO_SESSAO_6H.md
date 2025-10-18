# 🔒 Sistema de Expiração de Sessão - 6 Horas

## 📋 Resumo Executivo

Implementado sistema de expiração automática de sessão após **6 horas de inatividade** do usuário, garantindo maior segurança e conformidade com boas práticas de autenticação.

## 🎯 Funcionalidades Implementadas

### ✅ **Monitoramento de Atividade**
- **Eventos Rastreados**: `mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`, `click`
- **Frequência**: Verificação a cada 5 minutos
- **Armazenamento**: `localStorage` com timestamp da última atividade

### ✅ **Expiração Automática**
- **Timeout**: 6 horas (21.600.000 ms)
- **Verificação**: A cada 5 minutos via `setInterval`
- **Ação**: Logout automático + notificação ao usuário

### ✅ **Logs de Segurança**
- **Evento**: `SESSION_EXPIRED` no security logger
- **Nível**: WARNING
- **Detalhes**: Motivo da expiração, timeout configurado, ID do usuário

## 🔧 Implementação Técnica

### **Arquivos Modificados**

#### 1. `src/hooks/useAuth.tsx`
```typescript
// Configurações
const SESSION_TIMEOUT = 6 * 60 * 60 * 1000; // 6 horas
const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

// Funções principais
- updateLastActivity() // Registra atividade
- checkSessionExpiry() // Verifica se expirou
- handleSessionExpiry() // Força logout
```

#### 2. `src/utils/securityLogger.ts`
```typescript
// Novo evento de segurança
SESSION_EXPIRED = 'SESSION_EXPIRED'

// Classificado como WARNING
```

### **Event Listeners Configurados**
```typescript
const activityEvents = [
  'mousedown', 'mousemove', 'keypress', 
  'scroll', 'touchstart', 'click'
];
```

## 🚀 Como Funciona

### **1. Login do Usuário**
1. Usuário faz login com sucesso
2. Sistema registra timestamp inicial no `localStorage`
3. Event listeners são ativados para detectar atividade

### **2. Monitoramento Contínuo**
1. A cada 5 minutos, sistema verifica:
   - Última atividade registrada
   - Tempo decorrido desde última atividade
   - Se excedeu 6 horas

### **3. Detecção de Atividade**
1. Qualquer interação do usuário (clique, movimento, teclado, scroll)
2. Sistema atualiza timestamp no `localStorage`
3. Reset do contador de inatividade

### **4. Expiração da Sessão**
1. Após 6 horas sem atividade:
   - Log de segurança é gerado
   - Notificação é exibida ao usuário
   - Logout automático é executado
   - Dados de atividade são limpos

## 📊 Logs e Monitoramento

### **Console Logs**
```javascript
// Atividade registrada
🔄 Atividade do usuário registrada: 18/01/2025 15:30:45

// Verificação de expiração
⏰ Verificando expiração da sessão: {
  lastActivity: "18/01/2025 09:30:45",
  timeSinceLastActivity: 360, // minutos
  sessionTimeout: 360, // minutos
  expired: true
}

// Sessão expirada
⏰ Sessão expirada por inatividade (6 horas)
```

### **Security Logger**
```javascript
// Evento registrado
⚠️ [SECURITY WARNING] SESSION_EXPIRED {
  timestamp: "2025-01-18T15:30:45.123Z",
  details: {
    reason: "inactivity_timeout",
    timeout: "6_hours",
    userId: "uuid-do-usuario"
  }
}
```

## 🛡️ Benefícios de Segurança

### **1. Conformidade**
- ✅ Atende padrões de segurança
- ✅ Reduz janela de vulnerabilidade
- ✅ Protege contra sessões abandonadas

### **2. Experiência do Usuário**
- ✅ Notificação clara sobre expiração
- ✅ Redirecionamento automático para login
- ✅ Transparente durante uso normal

### **3. Auditoria**
- ✅ Logs detalhados de todas as expirações
- ✅ Rastreamento de atividade do usuário
- ✅ Integração com sistema de segurança existente

## ⚙️ Configurações

### **Timeouts Configuráveis**
```typescript
// Em src/hooks/useAuth.tsx
const SESSION_TIMEOUT = 6 * 60 * 60 * 1000; // 6 horas
const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
```

### **Eventos Monitorados**
```typescript
const activityEvents = [
  'mousedown',    // Clique do mouse
  'mousemove',    // Movimento do mouse
  'keypress',     // Teclas pressionadas
  'scroll',       // Scroll da página
  'touchstart',   // Toque em dispositivos móveis
  'click'         // Cliques em elementos
];
```

## 🔍 Testando o Sistema

### **1. Teste Manual**
1. Faça login no sistema
2. Aguarde 6 horas sem interação
3. Verifique se logout automático ocorre

### **2. Teste de Desenvolvimento**
```javascript
// No console do navegador, simular expiração:
localStorage.setItem('lastUserActivity', (Date.now() - 7 * 60 * 60 * 1000).toString());
// Aguardar próximo ciclo de verificação (5 minutos)
```

### **3. Verificar Logs**
- Console do navegador para logs de atividade
- Security logger para eventos de expiração
- Network tab para requisições de logout

## 📈 Métricas e Monitoramento

### **Dados Coletados**
- Timestamp da última atividade
- Frequência de verificações
- Número de expirações por usuário
- Tempo médio de sessão

### **Alertas de Segurança**
- Múltiplas expirações do mesmo usuário
- Padrões anômalos de atividade
- Tentativas de acesso após expiração

## 🎉 Status da Implementação

### ✅ **Concluído**
- [x] Sistema de monitoramento de atividade
- [x] Verificação automática de expiração
- [x] Logout forçado após 6 horas
- [x] Logs de segurança integrados
- [x] Notificações ao usuário
- [x] Limpeza de dados ao logout

### 🔄 **Funcionamento**
- Sistema ativo e monitorando
- Event listeners configurados
- Verificações a cada 5 minutos
- Logs sendo gerados automaticamente

## 🚀 Próximos Passos

### **Melhorias Futuras**
- [ ] Configuração via interface administrativa
- [ ] Diferentes timeouts por tipo de usuário
- [ ] Aviso antes da expiração (ex: 30 min antes)
- [ ] Estatísticas de uso de sessão
- [ ] Integração com analytics

---

**✨ Sistema de expiração de sessão implementado com sucesso!**

**🔒 Segurança aprimorada com logout automático após 6 horas de inatividade**

**📊 Monitoramento completo com logs detalhados**
