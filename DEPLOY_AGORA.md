# 🚀 DEPLOY AGORA - Guia Visual Passo a Passo

## ❌ Erro 404: "Requested function was not found"

A função `news-api-public` **ainda não foi deployada** no Supabase. Vamos fazer agora!

---

## 📱 DEPLOY EM 3 MINUTOS

### 1️⃣ Abrir Supabase Dashboard

1. **Acesse:** https://supabase.com/dashboard
2. **Login** na sua conta
3. **Selecione** o projeto: **brasil-news-agora-moderno**

### 2️⃣ Ir para Edge Functions

1. No menu lateral esquerdo, clique em **"Edge Functions"**
2. Você verá uma lista de funções (pode estar vazia)

### 3️⃣ Criar Nova Função

1. Clique no botão **"Create a new function"** (verde)
2. **Nome da função:** `news-api-public`
3. Clique em **"Create function"**

### 4️⃣ Copiar o Código

1. **Abra** o arquivo: `supabase/functions/news-api/index-no-auth.ts`
2. **Selecione TUDO** (Ctrl+A ou Cmd+A)
3. **Copie** (Ctrl+C ou Cmd+C)

### 5️⃣ Colar no Supabase

1. Volte ao **Supabase Dashboard**
2. **Cole** o código no editor
3. Clique em **"Deploy function"**

### 6️⃣ Aguardar Deploy

- Aguarde alguns segundos
- Você verá: **"Function deployed successfully"** ✅

---

## 🧪 TESTE IMEDIATO

### Teste 1: No Navegador
Abra esta URL:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?limit=5
```

### Teste 2: Com cURL
```bash
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?category=politica&limit=10"
```

### Teste 3: No n8n
**URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public`
**Method:** GET
**Query:** `category=politica&limit=10`

---

## 🎯 CONFIGURAÇÃO NO N8N

### Node HTTP Request:

**Configuração:**
- **Method:** `GET`
- **URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public`
- **Query Parameters:**
  - `category`: `politica`
  - `limit`: `10`
- **Headers:**
  - `Authorization`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE`

---

## ✅ RESULTADO ESPERADO

No n8n, você deve receber:

```json
{
  "data": [
    {
      "id": "uuid-da-noticia",
      "title": "Título da Notícia",
      "subtitle": "Subtítulo",
      "published_at": "2024-01-01T10:00:00Z",
      "categories": {
        "name": "Política",
        "slug": "politica"
      },
      "news_images": [...]
    }
  ],
  "count": 10,
  "limit": 10,
  "offset": 0,
  "message": "Notícias recuperadas com sucesso"
}
```

---

## 🔧 SE AINDA NÃO FUNCIONAR

### Verificar se a função foi criada:

1. **Dashboard** → **Edge Functions**
2. Deve aparecer `news-api-public` na lista
3. Status deve ser **"Active"**

### Verificar logs:

1. **Dashboard** → **Edge Functions** → **news-api-public**
2. **Logs** → Verificar se há erros

### Testar com autorização:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE" \
"https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?limit=5"
```

---

## 📋 CHECKLIST FINAL

- [ ] Acessei o Supabase Dashboard
- [ ] Criei a função `news-api-public`
- [ ] Copiei o código de `index-no-auth.ts`
- [ ] Fiz o deploy
- [ ] Testei no navegador
- [ ] Configurei no n8n com autorização
- [ ] Funcionou! 🎉

---

**⚡ Em 3 minutos a API estará funcionando no n8n!**
