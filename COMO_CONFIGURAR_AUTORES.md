# 📝 Como Configurar Autores com Nomes Reais

## 🎯 Objetivo

Configurar profiles e roles para os autores existentes no sistema, usando seus **nomes reais** cadastrados no Supabase Auth.

---

## 🚀 Processo (Passo a Passo)

### **Passo 1: Acessar o Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**

---

### **Passo 2: Consultar Emails e Nomes dos Autores**

Cole e execute esta query:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as nome_cadastrado,
  raw_user_meta_data->>'name' as nome_alternativo,
  created_at
FROM auth.users
WHERE id IN (
  '610e7321-e707-45c8-b48d-7c86f31f1750',
  'bfbf7dbe-3f41-4667-ae86-8978d0fed605',
  '705fd72e-c3cd-4009-b8cd-ef7b2645bc12'
)
ORDER BY created_at;
```

**Anote os resultados:**
- ID do usuário
- Email
- Nome (se disponível)

---

### **Passo 3: Criar Profiles e Roles com Nomes Reais**

Com os nomes obtidos no Passo 2, execute os INSERTs substituindo os nomes:

```sql
-- ============================================================================
-- AUTOR 1 (Substitua 'Nome Real do Autor 1' pelo nome obtido)
-- ============================================================================

INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'Nome Real do Autor 1', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name, is_approved = true, access_revoked = false;

INSERT INTO public.user_roles (user_id, role)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- AUTOR 2 (Substitua 'Nome Real do Autor 2' pelo nome obtido)
-- ============================================================================

INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('bfbf7dbe-3f41-4667-ae86-8978d0fed605', 'Nome Real do Autor 2', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name, is_approved = true, access_revoked = false;

INSERT INTO public.user_roles (user_id, role)
VALUES ('bfbf7dbe-3f41-4667-ae86-8978d0fed605', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- AUTOR 3 (Substitua 'Nome Real do Autor 3' pelo nome obtido)
-- ============================================================================

INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('705fd72e-c3cd-4009-b8cd-ef7b2645bc12', 'Nome Real do Autor 3', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name, is_approved = true, access_revoked = false;

INSERT INTO public.user_roles (user_id, role)
VALUES ('705fd72e-c3cd-4009-b8cd-ef7b2645bc12', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

### **Passo 4: Verificar se Funcionou**

Execute esta query para confirmar:

```sql
SELECT 
  p.user_id,
  p.full_name as nome,
  p.is_approved,
  p.access_revoked,
  ur.role,
  COUNT(n.id) as total_noticias
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
LEFT JOIN public.news n ON p.user_id = n.author_id
WHERE p.user_id IN (
  '610e7321-e707-45c8-b48d-7c86f31f1750',
  'bfbf7dbe-3f41-4667-ae86-8978d0fed605',
  '705fd72e-c3cd-4009-b8cd-ef7b2645bc12'
)
GROUP BY p.user_id, p.full_name, p.is_approved, p.access_revoked, ur.role
ORDER BY total_noticias DESC;
```

**Resultado esperado:**
```
user_id                              | nome              | is_approved | role    | total_noticias
-------------------------------------|-------------------|-------------|---------|---------------
610e7321-e707-45c8-b48d-7c86f31f1750 | Nome Real Autor 1 | true        | redator | 55+
bfbf7dbe-3f41-4667-ae86-8978d0fed605 | Nome Real Autor 2 | true        | redator | 13+
705fd72e-c3cd-4009-b8cd-ef7b2645bc12 | Nome Real Autor 3 | true        | redator | 5+
```

---

## 🎯 Depois de Configurado

### Para sua API, use:

```json
{
  "author_id": "610e7321-e707-45c8-b48d-7c86f31f1750"
}
```

Os nomes dos autores aparecerão automaticamente nas notícias! ✅

---

## ⚡ Atalho (Se não tiver nomes no sistema)

Se a query do Passo 2 não retornar nomes, você pode usar os emails ou criar nomes genéricos:

```sql
-- Exemplo: Usar o email como nome
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'email-do-autor@dominio.com', true, false)
ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name;
```

Ou criar nomes descritivos:
- "Equipe Editorial"
- "Redação ChicoSabeTudo"
- "Redator Oficial"

