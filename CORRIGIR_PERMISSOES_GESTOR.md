# 🔧 Correção Urgente: Permissões do Gestor

## 🚨 Problema Identificado

Os clientes estão cadastrados no banco, mas o **role "gestor" não tem permissão** para acessar a tabela `finance_contacts`, por isso o campo fica vazio no formulário de propaganda.

## ✅ Solução Rápida

### Passo 1: Acessar o Supabase Dashboard

1. **Abra**: https://supabase.com/dashboard
2. **Faça login** com sua conta
3. **Selecione o projeto**: `brasil-news-agora-moderno`

### Passo 2: Abrir o SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Executar a Correção

1. **Copie TODO o conteúdo** do arquivo `APLICAR_MIGRATION_PERMISSOES.sql`
2. **Cole no editor SQL**
3. **Clique em "Run"** (botão verde)

### Passo 4: Verificar se Funcionou

Após executar o SQL, você deve ver:

```
✅ Query executed successfully
✅ 1 row affected (policy updated)
✅ 5 rows (clientes listados)
```

### Passo 5: Testar no Sistema

1. **Acesse o site**: https://brasil-news-agora-moderno.vercel.app
2. **Login como gestor**
3. **Painel → Financeiro → Propagandas**
4. **"+ Nova Propaganda"**
5. **Campo "Cliente"** deve mostrar a lista! ✅

---

## 🔍 O que o SQL faz:

1. **Remove** a policy antiga que só permitia admin/redator
2. **Cria** nova policy que inclui o role "gestor"
3. **Verifica** se existem clientes no banco
4. **Lista** alguns clientes para confirmar

---

## ⚠️ Se der erro:

### Erro: "permission denied"
- **Causa**: Usuário não tem permissão de admin no Supabase
- **Solução**: Use uma conta de admin para executar o SQL

### Erro: "policy already exists"
- **Causa**: A policy já foi aplicada
- **Solução**: Continue para o passo 5 (testar no sistema)

### Erro: "relation does not exist"
- **Causa**: Tabela não existe
- **Solução**: Verifique se está no projeto correto

---

## 📞 Se ainda não funcionar:

1. **Verifique** se o usuário tem role "gestor" atribuído
2. **Confirme** que existem clientes cadastrados
3. **Teste** fazer logout/login no sistema
4. **Limpe** o cache do navegador (Ctrl+F5)

---

## 🎯 Resultado Esperado:

Após aplicar a correção:
- ✅ Campo "Cliente" mostra lista de clientes
- ✅ Gestor pode criar propagandas normalmente
- ✅ Sistema funciona como esperado

**Execute o SQL e teste!** 🚀
