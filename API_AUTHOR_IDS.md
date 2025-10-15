# 🆔 IDs de Autores para API de Notícias

## 📊 Autores Disponíveis

> **Importante:** Para ver os nomes reais dos autores, execute primeiro a query do arquivo `SETUP_AUTHORS.sql`

### 1️⃣ Autor 1 (RECOMENDADO) ⭐
```
ID: 610e7321-e707-45c8-b48d-7c86f31f1750
```
- **Total de notícias:** 55+
- **Status:** Mais ativo
- **Use este ID por padrão na sua API**
- **Nome:** Será obtido de `auth.users` ao executar setup

---

### 2️⃣ Autor 2
```
ID: bfbf7dbe-3f41-4667-ae86-8978d0fed605
```
- **Total de notícias:** 13+
- **Status:** Ativo
- **Nome:** Será obtido de `auth.users` ao executar setup

---

### 3️⃣ Autor 3
```
ID: 705fd72e-c3cd-4009-b8cd-ef7b2645bc12
```
- **Total de notícias:** 5+
- **Status:** Ativo
- **Nome:** Será obtido de `auth.users` ao executar setup

---

## 🚀 Como Usar na API

### Exemplo de Payload para Criar Notícia:

```json
{
  "title": "Título da sua notícia",
  "subtitle": "Subtítulo opcional",
  "summary": "Resumo da notícia",
  "content": "Conteúdo completo da notícia em HTML...",
  "meta_description": "Descrição para SEO (máx 160 caracteres)",
  "category_id": "uuid-da-categoria",
  "author_id": "610e7321-e707-45c8-b48d-7c86f31f1750",
  "is_published": false,
  "is_breaking": false,
  "tags": ["tag1", "tag2", "tag3"]
}
```

### Campo `author_id`:
- **Tipo:** UUID (string)
- **Obrigatório:** Não (pode ser `null`)
- **Recomendado:** Sempre usar um ID válido para rastreamento

---

## ⚙️ Setup Necessário (Execute uma vez)

### Passo 1: Acesse o Supabase Dashboard
1. Vá em: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**

### Passo 2: Execute o arquivo `SETUP_AUTHORS.sql`
- Copie e cole o conteúdo do arquivo
- Clique em **Run**
- Isso criará profiles e roles para os autores

---

## 📝 Validação Após Setup

Execute esta query para verificar:

```sql
SELECT 
  p.user_id,
  p.full_name,
  p.is_approved,
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
GROUP BY p.user_id, p.full_name, p.is_approved, ur.role
ORDER BY total_noticias DESC;
```

---

## 🎯 Resposta Rápida

**Para sua API, use este ID:**
```
610e7321-e707-45c8-b48d-7c86f31f1750
```

**Copie e cole direto no seu código!** ✅

