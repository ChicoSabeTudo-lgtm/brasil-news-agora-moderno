# ⭐ Publicar Notícia Diretamente via API

## 🎯 Como Publicar Diretamente (sem rascunho):

Adicione o campo `"publish_immediately": true` no body da requisição.

---

## 📝 Exemplo Completo:

```bash
curl -X POST \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste de publicação direta via API",
    "subtitle": "Esta notícia será publicada imediatamente sem passar pelo rascunho",
    "content": "<p>Este é um teste de publicação direta usando o parâmetro publish_immediately. A notícia aparecerá imediatamente no site após a criação.</p><p>Não é necessário aprovar no painel admin.</p><p>Conteúdo adicional para atingir o mínimo de 100 caracteres necessários para validação da API.</p>",
    "category_id": "74a31ab2-3612-4d99-86c3-a443f0d8e5ba",
    "author_id": "bfbf7dbe-3f41-4667-ae86-8978d0fed605",
    "tags": ["teste", "api"],
    "is_breaking": false,
    "publish_immediately": true
  }' \
  "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api"
```

---

## ✅ Resposta Esperada:

```json
{
  "data": {
    "id": "uuid-gerado",
    "title": "Teste de publicação direta via API",
    "subtitle": "Esta notícia será publicada imediatamente sem passar pelo rascunho",
    "content": "<p>Este é um teste...</p>",
    "category_id": "74a31ab2-3612-4d99-86c3-a443f0d8e5ba",
    "author_id": "bfbf7dbe-3f41-4667-ae86-8978d0fed605",
    "slug": "teste-de-publicacao-direta-via-api",
    "tags": ["teste", "api"],
    "is_breaking": false,
    "is_featured": false,
    "is_published": true,  ← PUBLICADA!
    "published_at": "2025-10-13T23:45:00.000Z",
    "views": 0
  },
  "message": "Notícia criada e publicada com sucesso",
  "note": "A notícia está publicada e visível no site"
}
```

---

## 🔄 Diferença entre Rascunho e Publicação Direta:

| Característica | Rascunho (padrão) | Publicação Direta |
|----------------|-------------------|-------------------|
| **Campo no JSON** | Não incluir ou `"publish_immediately": false` | `"publish_immediately": true` |
| **`is_published`** | `false` | `true` |
| **Visível no site?** | ❌ Não | ✅ Sim |
| **Precisa aprovar?** | ✅ Sim, no painel admin | ❌ Não |
| **Mensagem** | "Notícia criada como rascunho" | "Notícia criada e publicada" |

---

## 🛠️ Uso no n8n:

### **Node HTTP Request - Publicar Direto:**

```json
{
  "title": "{{ $json.titulo }}",
  "subtitle": "{{ $json.subtitulo }}",
  "content": "{{ $json.conteudo }}",
  "category_id": "{{ $json.categoria_id }}",
  "author_id": "{{ $json.autor_id }}",
  "tags": {{ $json.tags }},
  "is_breaking": {{ $json.urgente }},
  "publish_immediately": true
}
```

---

## 💡 Quando Usar Cada Modo:

### **Rascunho (padrão):**
- ✅ Quando precisa de **revisão editorial**
- ✅ Para **verificar formatação** antes de publicar
- ✅ Em **ambientes de teste**

### **Publicação Direta:**
- ✅ Para **notícias automáticas** via integração
- ✅ Quando tem **confiança no conteúdo**
- ✅ Para **feeds de notícias** externos confiáveis
- ✅ Em **fluxos automatizados** testados

---

## 🎯 Exemplo Prático n8n:

### **Fluxo: RSS → API → Site**

1. **RSS Feed (Trigger)** → Busca novas notícias
2. **Function Node** → Formata dados
3. **HTTP Request** → POST com `publish_immediately: true`
4. **✅ Notícia publicada automaticamente!**

---

## ⚠️ Importante:

- **Sem moderação:** Publicação direta pula qualquer moderação
- **Responsabilidade:** Certifique-se de que o conteúdo está correto
- **Teste primeiro:** Use rascunho para testar a integração
- **Depois automatize:** Quando estiver funcionando, use publicação direta

---

**Agora você pode escolher publicar diretamente ou como rascunho!** 🚀


