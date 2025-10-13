# 🔍 Verificar Função Existente no Supabase

## ✅ A função news-api-public JÁ EXISTE no Supabase!

Se a função já existe, vamos verificar o que pode estar causando o erro 404.

---

## 🧪 TESTE RÁPIDO

### Teste 1: Verificar se a função responde
```bash
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?limit=5"
```

### Teste 2: Com autorização
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE" \
"https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public?limit=5"
```

---

## 🔧 POSSÍVEIS CAUSAS DO ERRO 404

### 1️⃣ Nome da Função Incorreto
Verifique se o nome está exatamente: `news-api-public`

### 2️⃣ Função Não Está Ativa
1. **Supabase Dashboard** → **Edge Functions**
2. Verifique se `news-api-public` está **"Active"**
3. Se estiver **"Inactive"**, clique para ativar

### 3️⃣ URL Incorreta
Certifique-se de usar:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public
```

### 4️⃣ Função com Erro
1. **Dashboard** → **Edge Functions** → **news-api-public**
2. **Logs** → Verifique se há erros

---

## 🎯 CONFIGURAÇÃO CORRETA NO N8N

### Node HTTP Request:

**URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api-public`

**Query Parameters:**
- `category`: `politica`
- `limit`: `10`

**Headers:**
- `Authorization`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE`

---

## 🔍 VERIFICAÇÕES NO SUPABASE DASHBOARD

### 1. Verificar Lista de Funções
1. **Dashboard** → **Edge Functions**
2. Deve aparecer `news-api-public` na lista
3. Status deve ser **"Active"**

### 2. Verificar Logs
1. **Dashboard** → **Edge Functions** → **news-api-public**
2. **Logs** → Verificar se há erros recentes

### 3. Verificar Configurações
1. **Dashboard** → **Edge Functions** → **news-api-public**
2. **Settings** → Verificar configurações

---

## 🧪 TESTE ALTERNATIVO

Se ainda não funcionar, teste com a função original:

### URL Alternativa:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api
```

**Com autorização:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE" \
"https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5"
```

---

## ✅ RESULTADO ESPERADO

Se funcionar, você deve ver:

```json
{
  "data": [
    {
      "id": "uuid-da-noticia",
      "title": "Título da Notícia",
      "categories": {
        "name": "Política",
        "slug": "politica"
      }
    }
  ],
  "count": 5,
  "limit": 5,
  "offset": 0
}
```

---

## 🆘 SE AINDA NÃO FUNCIONAR

### Opção 1: Usar função original
Teste com `news-api` em vez de `news-api-public`

### Opção 2: Verificar logs
Veja se há erros específicos nos logs da função

### Opção 3: Recriar função
Delete e recrie a função `news-api-public`

---

**🔍 Vamos descobrir o que está causando o erro 404!**
