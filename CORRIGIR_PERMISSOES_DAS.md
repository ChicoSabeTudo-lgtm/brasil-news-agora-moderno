# 🔧 Correção: Permissões do Gestor para Pagamento de DAS

## 🚨 Problema Identificado

O gestor não consegue adicionar registros na parte de **Pagamento de DAS** porque:

- A policy RLS da tabela `das_payments` só permite `admin` e `redator`
- O role `gestor` não tem permissão de acesso

## ✅ Solução Rápida

### Passo 1: Acessar o Supabase Dashboard

1. **Abra**: https://supabase.com/dashboard
2. **Faça login** com sua conta
3. **Selecione o projeto**: `brasil-news-agora-moderno`

### Passo 2: Abrir o SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Executar a Correção

1. **Copie TODO o conteúdo** do arquivo `APLICAR_MIGRATION_DAS_PERMISSOES.sql`
2. **Cole no editor SQL**
3. **Clique em "Run"** (botão verde)

### Passo 4: Verificar se Funcionou

Após executar o SQL, você deve ver:

```
✅ Query executed successfully
✅ Policy updated successfully
✅ 0 rows (tabela vazia inicialmente)
```

### Passo 5: Testar no Sistema

1. **Acesse o site**: https://brasil-news-agora-moderno.vercel.app
2. **Login como gestor**
3. **Painel → Financeiro → Pagamento de DAS**
4. **"+ Registrar Pagamento DAS"**
5. **Formulário deve funcionar normalmente!** ✅

---

## 🔍 O que o SQL faz:

1. **Remove** a policy antiga que só permitia admin/redator
2. **Cria** nova policy que inclui o role "gestor"
3. **Verifica** se a tabela existe e tem dados
4. **Lista** a estrutura da tabela para confirmar

---

## ⚠️ Se der erro:

### Erro: "permission denied"
- **Causa**: Usuário não tem permissão de admin no Supabase
- **Solução**: Use uma conta de admin para executar o SQL

### Erro: "relation does not exist"
- **Causa**: Tabela `das_payments` não existe
- **Solução**: A tabela pode não ter sido criada ainda

### Erro: "policy already exists"
- **Causa**: A policy já foi aplicada
- **Solução**: Continue para o passo 5 (testar no sistema)

---

## 📞 Se ainda não funcionar:

1. **Verifique** se o usuário tem role "gestor" atribuído
2. **Confirme** que a tabela `das_payments` existe
3. **Teste** fazer logout/login no sistema
4. **Limpe** o cache do navegador (Ctrl+F5)

---

## 🎯 Resultado Esperado:

Após aplicar a correção:
- ✅ Gestor pode acessar a seção Pagamento de DAS
- ✅ Formulário de registro funciona normalmente
- ✅ Gestor pode adicionar, editar e excluir registros
- ✅ Sistema funciona igual ao administrador

**Execute o SQL e teste!** 🚀
