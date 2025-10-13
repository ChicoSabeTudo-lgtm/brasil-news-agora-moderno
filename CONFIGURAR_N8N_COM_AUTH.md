# 🔑 Configurar n8n com Autenticação

## ✅ Encontrou a Chave de Autorização!

Agora sabemos que a função **requer** autenticação. Vou te mostrar como configurar no n8n.

---

## 🧪 TESTE RÁPIDO COM CURL

```bash
# Teste GET com autorização
curl -L -X GET 'https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?category=politica&limit=10' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE'
```

---

## 🎯 CONFIGURAÇÃO NO N8N

### Node: HTTP Request

**Configuração:**
- **Method:** `GET`
- **URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public`
- **Query Parameters:**
  - `category`: `politica`
  - `limit`: `10`

**Headers (IMPORTANTE!):**
- **Name:** `Authorization`
- **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE`

---

## 📋 EXEMPLOS PRONTOS PARA N8N

### 1. Buscar 10 Notícias de Política

**URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public`
**Method:** `GET`
**Query Parameters:**
- `category`: `politica`
- `limit`: `10`
**Headers:**
- `Authorization`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE`

### 2. Buscar 5 Notícias de Economia

**URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public`
**Method:** `GET`
**Query Parameters:**
- `category`: `economia`
- `limit`: `5`
**Headers:**
- `Authorization`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE`

### 3. Buscar Notícias por Palavra-chave

**URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public`
**Method:** `GET`
**Query Parameters:**
- `search`: `eleições`
- `limit`: `10`
**Headers:**
- `Authorization`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE`

---

## 🔧 CONFIGURAÇÃO DETALHADA NO N8N

### Passo a Passo:

1. **Criar Node HTTP Request**
2. **Configurar Method:** `GET`
3. **Configurar URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public`
4. **Adicionar Query Parameters:**
   - Clique em "Add Parameter"
   - Name: `category`, Value: `politica`
   - Clique em "Add Parameter" 
   - Name: `limit`, Value: `10`
5. **Adicionar Header de Autorização:**
   - Clique em "Add Header"
   - Name: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE`

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
      "content": "Conteúdo da notícia...",
      "published_at": "2024-01-01T10:00:00Z",
      "views": 123,
      "categories": {
        "name": "Política",
        "slug": "politica"
      },
      "profiles": {
        "full_name": "Nome do Autor"
      },
      "news_images": [...]
    }
  ],
  "count": 10,
  "limit": 10,
  "offset": 0
}
```

---

## 🎯 CATEGORIAS DISPONÍVEIS

- `politica` - Política
- `economia` - Economia
- `esportes` - Esportes
- `tecnologia` - Tecnologia
- `internacional` - Internacional
- `nacional` - Nacional
- `saude` - Saúde
- `entretenimento` - Entretenimento

---

## 🚀 TESTE AGORA!

1. **Configure** o n8n com a autorização
2. **Execute** o workflow
3. **Verifique** se retorna as notícias

**Com a autorização correta, funcionará perfeitamente!** 🎉
