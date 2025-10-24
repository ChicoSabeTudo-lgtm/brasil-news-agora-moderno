# 🔧 Correção: Pauta Facebook (Diária) em Branco

## 🚨 Problema Identificado

A aba "Pauta Facebook (Diária)" está aparecendo em branco porque:

1. ❌ **Tabela não existe** no banco de dados
2. ❌ **Migration não foi aplicada** no Supabase
3. ❌ **Tipos TypeScript** não reconhecem a nova tabela

## ✅ Solução Rápida

### Passo 1: Aplicar Migration no Supabase

1. **Acesse**: https://supabase.com/dashboard
2. **Projeto**: `brasil-news-agora-moderno`
3. **SQL Editor** → **New query**
4. **Copie TODO o conteúdo** do arquivo `APLICAR_MIGRATION_FACEBOOK_SCHEDULE.sql`
5. **Cole no editor SQL**
6. **Clique em "Run"**

### Passo 2: Verificar se Funcionou

Após executar o SQL, você deve ver:

```
✅ Query executed successfully
✅ Tabela facebook_daily_schedule criada
✅ Policies RLS configuradas
✅ Function de limpeza criada
✅ 0 rows (tabela vazia inicialmente)
```

### Passo 3: Testar no Sistema

1. **Aguarde 1-2 minutos** para a Vercel fazer o deploy
2. **Recarregue a página** (Ctrl+F5)
3. **Acesse**: Painel → Notícias → **"Pauta Facebook (Diária)"**
4. **Deve aparecer** a interface completa! ✅

---

## 🔍 O que o SQL faz:

1. **Cria** a tabela `facebook_daily_schedule`
2. **Configura** RLS policies para admin, redator e gestor
3. **Cria** function de limpeza automática
4. **Adiciona** índices para performance
5. **Verifica** se foi criada corretamente

---

## ⚠️ Se ainda der erro:

### Erro: "permission denied"
- **Causa**: Usuário não tem permissão de admin no Supabase
- **Solução**: Use uma conta de admin para executar o SQL

### Erro: "relation already exists"
- **Causa**: A tabela já foi criada anteriormente
- **Solução**: Continue para o passo 3 (testar no sistema)

### Erro: "function does not exist"
- **Causa**: Função de limpeza não foi criada
- **Solução**: Execute apenas a parte da função do SQL

---

## 🎯 Resultado Esperado:

Após aplicar a migration:
- ✅ Interface da Pauta Facebook aparece normalmente
- ✅ Botão "+ Nova Pauta Facebook" funciona
- ✅ Formulário aceita dados e valida
- ✅ Lista mostra registros criados
- ✅ Edição e exclusão funcionam

**Execute o SQL e teste! O problema será resolvido imediatamente!** 🚀
