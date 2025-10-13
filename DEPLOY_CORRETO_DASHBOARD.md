# 🚀 Deploy Correto no Dashboard do Supabase

## ❌ Erro: "Entrypoint path does not exist"

O erro acontece porque o Supabase Dashboard espera um arquivo `index.ts` específico.

---

## ✅ SOLUÇÃO: Usar o Arquivo Correto

### 1️⃣ Substituir o Conteúdo da Função

1. **Supabase Dashboard** → **Edge Functions** → **news-api-public**
2. **NÃO DELETE** a função
3. **Clique na função** para editá-la
4. **Substitua TODO o código** pelo conteúdo de: `supabase/functions/news-api/index.ts`
5. **Deploy**

### 2️⃣ Ou Criar Nova Função

1. **Supabase Dashboard** → **Edge Functions**
2. **Create new function** → Nome: `news-api`
3. **Cole o código** de: `supabase/functions/news-api/index.ts`
4. **Deploy**

---

## 🧪 TESTE IMEDIATO

### Teste 1: No Navegador
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5
```

### Teste 2: Com cURL
```bash
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5"
```

### Teste 3: Buscar por Categoria
```bash
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=politica&limit=10"
```

### Teste 4: No n8n
**URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api`
**Method:** GET
**Query:** `category=politica&limit=10`

**SEM CABEÇALHOS DE AUTENTICAÇÃO!**

---

## 🔍 LOGS DETALHADOS

Esta versão inclui emojis nos logs para facilitar o debug:

1. **Dashboard** → **Edge Functions** → **news-api**
2. **Logs** → Veja as mensagens:
   - 🚀 "Iniciando API de Notícias"
   - 📋 "Parâmetros: { limit: 5, offset: 0, category: null }"
   - ✅ "Query executada. Erro: null"
   - 📊 "Dados encontrados: 5 de 25"
   - 🎉 "Retornando resposta com 5 notícias"

---

## ✅ RESULTADO ESPERADO

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
      "tags": ["tag1", "tag2"],
      "is_breaking": false,
      "is_featured": true,
      "category_id": "uuid-categoria",
      "author_id": "uuid-autor",
      "category": {
        "id": "uuid-categoria",
        "name": "Política",
        "slug": "politica",
        "color": "#ff0000"
      },
      "images": [
        {
          "news_id": "uuid-da-noticia",
          "image_url": "https://...",
          "caption": "Legenda",
          "is_cover": true
        }
      ]
    }
  ],
  "count": 10,
  "limit": 10,
  "offset": 0,
  "message": "Notícias recuperadas com sucesso",
  "debug": {
    "total_found": 10,
    "returned": 10,
    "supabase_url": "https://spgusjrjrhfychhdwixn.supabase.co",
    "filters_applied": {
      "category": "politica",
      "search": null
    }
  }
}
```

---

## 🎯 FUNCIONALIDADES INCLUÍDAS

- ✅ **Buscar todas as notícias** (`?limit=10`)
- ✅ **Filtrar por categoria** (`?category=politica`)
- ✅ **Buscar por texto** (`?search=eleições`)
- ✅ **Paginação** (`?offset=10&limit=5`)
- ✅ **Dados completos** (categoria, imagens, etc.)
- ✅ **Logs detalhados** para debug
- ✅ **Valores hardcoded** (sem dependência de env vars)

---

## 🔧 SE AINDA DER ERRO

### Verificar Logs:
1. **Dashboard** → **Edge Functions** → **news-api**
2. **Logs** → Veja qual emoji aparece:
   - 🚀 = Iniciou
   - 📋 = Recebeu parâmetros
   - ✅ = Query executada
   - 🎉 = Sucesso
   - ❌ = Erro

### Possíveis Problemas:
1. **Tabela 'news' não existe** → Verificar se existe no banco
2. **Sem notícias publicadas** → Verificar se há `is_published = true`
3. **RLS bloqueando** → Verificar permissões

---

## 🚀 PRÓXIMOS PASSOS

1. **Usar** o arquivo `index.ts` correto
2. **Deploy** da função
3. **Testar** no navegador
4. **Verificar** os logs com emojis
5. **Configurar** no n8n
6. **Success!** 🎉

---

**🔧 Com o arquivo correto, a API vai funcionar perfeitamente!**
