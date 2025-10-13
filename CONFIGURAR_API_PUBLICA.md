# 🔓 Configurar API Pública para n8n

## 🎯 Problema Identificado

A API atual exige autenticação obrigatória. Para usar no **n8n**, **Zapier** ou outras ferramentas, precisamos de uma versão pública.

## ✅ Solução: Versão Pública da API

Criei uma nova versão: `index-public.ts` que permite:
- ✅ **GET** (buscar notícias) - **SEM AUTENTICAÇÃO**
- 🔒 **POST** (criar notícias) - **COM AUTENTICAÇÃO**

---

## 🚀 Como Fazer o Deploy da Versão Pública

### Opção 1: Substituir a Função Existente

1. **Supabase Dashboard** → **Edge Functions** → **news-api**
2. **Delete** a função atual
3. **Create new function** → Nome: `news-api`
4. Copie o conteúdo de: `supabase/functions/news-api/index-public.ts`
5. Cole e **Deploy**

### Opção 2: Criar Nova Função (Recomendado)

1. **Supabase Dashboard** → **Edge Functions**
2. **Create new function** → Nome: `news-api-public`
3. Copie o conteúdo de: `supabase/functions/news-api/index-public.ts`
4. Cole e **Deploy**

---

## 🧪 Testar no n8n

### URL para n8n:
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

**SEM CABEÇALHOS DE AUTENTICAÇÃO!** 🎉

---

## 📋 Exemplos de Uso

### n8n - Buscar 10 Notícias de Política

**URL:**
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?category=politica&limit=10
```

**Configuração n8n:**
- Method: `GET`
- URL: `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public`
- Query Parameters:
  - `category`: `politica`
  - `limit`: `10`

### Zapier - Buscar Notícias de Economia

**URL:**
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?category=economia&limit=5
```

### cURL - Teste Rápido

```bash
# 10 notícias de política (SEM AUTENTICAÇÃO!)
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?category=politica&limit=10"

# 5 notícias de economia
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?category=economia&limit=5"

# Buscar por texto
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?search=eleições&limit=10"

# Últimas 20 notícias
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?limit=20"
```

---

## 🎯 Categorias Disponíveis

- `politica` - Política
- `economia` - Economia
- `esportes` - Esportes
- `tecnologia` - Tecnologia
- `internacional` - Internacional
- `nacional` - Nacional
- `saude` - Saúde
- `entretenimento` - Entretenimento

---

## 🔧 Troubleshooting

### Se ainda der erro de autorização:

1. **Verifique o nome da função** no URL
2. **Confirme que fez o deploy** da versão pública
3. **Teste primeiro no navegador** antes do n8n

### Teste no Navegador:

Abra esta URL:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?limit=5
```

**Se funcionar:** Você verá JSON com notícias
**Se não funcionar:** A função ainda não foi deployada

---

## ⚡ Resultado Esperado no n8n

```json
{
  "data": [
    {
      "id": "uuid-1",
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
  "offset": 0
}
```

---

**🚀 Com a versão pública, o n8n funcionará perfeitamente!**
