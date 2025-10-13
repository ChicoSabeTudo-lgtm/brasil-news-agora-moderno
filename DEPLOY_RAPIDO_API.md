# ⚡ Deploy Rápido da API - 5 Minutos

## 🎯 A API está pedindo autorização porque ainda não foi deployada!

Siga estes passos EXATOS:

---

## 📱 PASSO A PASSO (5 minutos)

### 1️⃣ Abrir o Supabase Dashboard
```
https://supabase.com/dashboard
```
- Faça login
- Selecione seu projeto

### 2️⃣ Criar a Edge Function
- No menu lateral esquerdo, clique em **Edge Functions**
- Clique no botão verde **Create a new function**
- Nome: `news-api`
- Clique em **Create function**

### 3️⃣ Copiar o Código
- Abra o arquivo: `supabase/functions/news-api/index-standalone.ts`
- **Selecione TUDO** (Ctrl+A ou Cmd+A)
- **Copie** (Ctrl+C ou Cmd+C)
- Volte ao Supabase Dashboard
- **Cole** no editor de código
- Clique em **Deploy function**

### 4️⃣ Aguardar Deploy
- Aguarde alguns segundos
- Você verá "Function deployed successfully"

### 5️⃣ Testar
Abra esta URL no navegador:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5
```

**Se funcionar:** Você verá um JSON com notícias! 🎉

---

## ❌ SE NÃO FUNCIONAR

### Problema: Ainda pede autorização

**Solução 1:** Adicionar apikey na URL
```bash
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=politica&limit=10" \
  -H "apikey: SUA_ANON_KEY_AQUI"
```

**Onde encontrar a ANON_KEY:**
1. Dashboard → Settings → API
2. Copie "anon public"

**Solução 2:** Configurar função como pública

No Dashboard, após criar a function:
1. Edge Functions → news-api
2. Settings → Invoke function
3. Marque "Allow public access" (se disponível)

---

## 🧪 TESTE RÁPIDO

Depois do deploy, teste com:

```bash
# Teste 1: Últimas 5 notícias
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5"

# Teste 2: 10 notícias de política
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=politica&limit=10"

# Teste 3: Com apikey (se necessário)
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5" \
  -H "apikey: SUA_ANON_KEY"
```

---

## 📋 CHECKLIST

- [ ] Acessei o Supabase Dashboard
- [ ] Criei a Edge Function "news-api"
- [ ] Copiei e colei o código de index-standalone.ts
- [ ] Fiz o deploy
- [ ] Testei a URL no navegador
- [ ] Funcionou! 🎉

---

## 🆘 PRECISA DE AJUDA?

**Se continuar pedindo autorização:**

A API pode estar configurada para exigir autenticação. Nesse caso, adicione a apikey:

```javascript
fetch('https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=politica&limit=10', {
  headers: {
    'apikey': 'SUA_ANON_KEY_AQUI'
  }
})
```

Encontre a ANON_KEY em: **Dashboard → Settings → API → anon public**

---

**⚡ Em 5 minutos sua API estará funcionando!**

