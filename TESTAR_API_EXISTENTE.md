# 🧪 Como Testar a API que Já Existe

## ✅ A função já está deployada! Só precisa da chave de API.

### 🔑 **Passo 1: Encontrar a Chave de API**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie a chave **"anon public"**

### 🧪 **Passo 2: Testar com a Chave**

```bash
# Substitua SUA_ANON_KEY pela chave que você copiou
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=politica&limit=10" \
  -H "apikey: SUA_ANON_KEY"
```

### 💻 **Exemplo com JavaScript:**

```javascript
const ANON_KEY = 'SUA_ANON_KEY_AQUI'; // Cole a chave aqui

// Buscar 10 notícias de política
fetch('https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=politica&limit=10', {
  headers: {
    'apikey': ANON_KEY
  }
})
.then(response => response.json())
.then(data => {
  console.log('Notícias encontradas:', data.count);
  console.log('10 mais recentes:', data.data);
});
```

### 🌐 **Teste no Navegador:**

Abra esta URL (substitua SUA_ANON_KEY):
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=politica&limit=10&apikey=SUA_ANON_KEY
```

### 📋 **Exemplos de Uso:**

```bash
# 10 notícias mais recentes de política
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=politica&limit=10" \
  -H "apikey: SUA_ANON_KEY"

# 5 notícias de economia
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=economia&limit=5" \
  -H "apikey: SUA_ANON_KEY"

# Buscar notícias sobre "eleições"
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?search=eleições&limit=10" \
  -H "apikey: SUA_ANON_KEY"

# Últimas 20 notícias (todas as categorias)
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=20" \
  -H "apikey: SUA_ANON_KEY"
```

### 🎯 **Categorias Disponíveis:**

- `politica` - Política
- `economia` - Economia  
- `esportes` - Esportes
- `tecnologia` - Tecnologia
- `internacional` - Internacional
- `nacional` - Nacional
- `saude` - Saúde
- `entretenimento` - Entretenimento

### ⚡ **Teste Rápido:**

1. Copie sua ANON_KEY do Dashboard
2. Cole neste comando:
```bash
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5" -H "apikey: SUA_ANON_KEY"
```

**Se funcionar, você verá um JSON com as notícias!** 🎉

---

## 🔧 **Se Ainda Não Funcionar:**

A função pode estar configurada para usar autenticação JWT. Nesse caso, você precisará:

1. **Dashboard** → **Edge Functions** → **news-api**
2. **Settings** → **Invoke function**
3. Marcar **"Allow public access"** (se disponível)

Ou usar o **Service Role Key** em vez da ANON_KEY:

```bash
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5" \
  -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY"
```

---

**🚀 Com a chave correta, a API funcionará perfeitamente!**
