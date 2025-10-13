# 🚀 Deploy da Função Pública - Passo a Passo Visual

## ❌ Erro: "Requested function was not found"

Isso significa que a função `news-api-public` **ainda não foi deployada** no Supabase.

---

## 📱 DEPLOY PASSO A PASSO (3 minutos)

### 1️⃣ Acessar Supabase Dashboard

1. Abra: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto: **brasil-news-agora-moderno**

### 2️⃣ Criar Nova Edge Function

1. No menu lateral esquerdo, clique em **Edge Functions**
2. Clique no botão verde **"Create a new function"**
3. **Nome da função:** `news-api-public`
4. Clique em **"Create function"**

### 3️⃣ Copiar e Colar o Código

1. Abra o arquivo: `supabase/functions/news-api/index-public.ts`
2. **Selecione TODO o conteúdo** (Ctrl+A ou Cmd+A)
3. **Copie** (Ctrl+C ou Cmd+C)
4. Volte ao Supabase Dashboard
5. **Cole** no editor de código
6. Clique em **"Deploy function"**

### 4️⃣ Aguardar Deploy

- Aguarde alguns segundos
- Você verá: **"Function deployed successfully"**

### 5️⃣ Testar

Abra esta URL no navegador:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?limit=5
```

**Se funcionar:** Você verá um JSON com notícias! 🎉

---

## 🧪 CONFIGURAR NO N8N

### URL Correta para n8n:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public
```

### Configuração no n8n:

1. **Node Type:** HTTP Request
2. **Method:** GET
3. **URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public`
4. **Query Parameters:**
   - `category`: `politica`
   - `limit`: `10`

### Exemplo Completo no n8n:

**URL Final:**
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?category=politica&limit=10
```

---

## 🔍 VERIFICAR SE FUNCIONOU

### Teste 1: No Navegador
Abra: `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?limit=5`

### Teste 2: Com cURL
```bash
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?category=politica&limit=10"
```

### Teste 3: No n8n
Execute o workflow e verifique se retorna JSON com notícias.

---

## 📋 EXEMPLOS DE USO

### Buscar 10 Notícias de Política:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?category=politica&limit=10
```

### Buscar 5 Notícias de Economia:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?category=economia&limit=5
```

### Buscar Notícias por Palavra-chave:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?search=eleições&limit=10
```

### Últimas 20 Notícias (todas categorias):
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?limit=20
```

---

## 🆘 SE AINDA NÃO FUNCIONAR

### Problema 1: Erro 404
**Causa:** Função não foi deployada
**Solução:** Verifique se o nome está correto: `news-api-public`

### Problema 2: Erro 500
**Causa:** Erro no código
**Solução:** Verifique os logs no Dashboard → Edge Functions → news-api-public → Logs

### Problema 3: Erro de CORS
**Causa:** Headers CORS não configurados
**Solução:** O código já tem CORS configurado

---

## ✅ CHECKLIST FINAL

- [ ] Acessei o Supabase Dashboard
- [ ] Criei a função `news-api-public`
- [ ] Copiei o código de `index-public.ts`
- [ ] Fiz o deploy
- [ ] Testei no navegador
- [ ] Configurei no n8n
- [ ] Funcionou! 🎉

---

## 🎯 RESULTADO ESPERADO

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
      }
    }
  ],
  "count": 10,
  "limit": 10,
  "offset": 0
}
```

---

**⚡ Em 3 minutos sua API estará funcionando no n8n!**
