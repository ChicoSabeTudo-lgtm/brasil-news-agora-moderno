# 👥 Como Gerenciar Novos Autores

## 🎯 **Opções Disponíveis**

### **Opção 1: Automático (Recomendado) ⭐**

Execute o arquivo `SETUP_AUTO_AUTHORS.sql` no Supabase Dashboard.

**Vantagens:**
- ✅ Novos usuários são criados automaticamente
- ✅ Ficam como "pendentes" até aprovação
- ✅ Funções prontas para aprovar/gerenciar

**Como funciona:**
1. Usuário se cadastra → Profile criado automaticamente
2. Admin aprova via função `approve_user()`
3. Usuário pode publicar notícias

---

### **Opção 2: Manual**

Use o arquivo `APROVAR_NOVO_AUTOR.sql` quando precisar.

**Vantagens:**
- ✅ Controle total sobre quem aprova
- ✅ Sem triggers automáticos

**Como funciona:**
1. Usuário se cadastra → Nada acontece
2. Admin executa SQL manualmente
3. Usuário pode publicar notícias

---

## 🚀 **Implementação Recomendada**

### **Passo 1: Configurar Automático**
```sql
-- Execute no Supabase Dashboard > SQL Editor
-- Cole todo o conteúdo de SETUP_AUTO_AUTHORS.sql
```

### **Passo 2: Aprovar Usuários**
```sql
-- Para aprovar um usuário específico:
SELECT public.approve_user('USER_ID_AQUI', 'redator');

-- Para ver usuários pendentes:
SELECT * FROM public.get_pending_users();
```

### **Passo 3: Interface Admin (Opcional)**
Criar uma página no admin para:
- Ver lista de usuários pendentes
- Aprovar/rejeitar com um clique
- Gerenciar roles

---

## 📋 **Fluxo Completo**

```
1. Novo usuário se cadastra
   ↓
2. Profile criado automaticamente (is_approved = false)
   ↓
3. Admin recebe notificação (ou verifica manualmente)
   ↓
4. Admin aprova via SQL ou interface
   ↓
5. Usuário pode publicar notícias via API
```

---

## 🔧 **Para Desenvolvedores**

### **API para Aprovar Usuário:**
```javascript
// No seu código admin
const { data, error } = await supabase.rpc('approve_user', {
  user_uuid: 'USER_ID_AQUI',
  user_role: 'redator'
});
```

### **API para Listar Pendentes:**
```javascript
// No seu código admin
const { data, error } = await supabase.rpc('get_pending_users');
```

---

## ⚡ **Resumo**

**Para começar rapidamente:**
1. Execute `SETUP_AUTO_AUTHORS.sql`
2. Use `SELECT * FROM public.get_pending_users();` para ver pendentes
3. Use `SELECT public.approve_user('ID', 'redator');` para aprovar

**Pronto!** Seu sistema estará configurado para novos autores! 🎉
