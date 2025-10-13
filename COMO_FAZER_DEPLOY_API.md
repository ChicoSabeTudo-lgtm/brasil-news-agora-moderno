# 🚀 Como Fazer Deploy da API de Notícias - Passo a Passo

## ⚠️ IMPORTANTE: A API precisa ser deployada no Supabase antes de funcionar!

A Edge Function foi criada localmente, mas precisa ser enviada para o Supabase. Siga um dos métodos abaixo:

---

## 📱 MÉTODO 1: Via Supabase Dashboard (Mais Fácil)

### Passo 1: Acessar o Dashboard
1. Acesse https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto: **brasil-news-agora-moderno**

### Passo 2: Criar a Edge Function
1. No menu lateral, clique em **Edge Functions**
2. Clique em **Create a new function**
3. Nome da função: `news-api`

### Passo 3: Copiar o Código
1. Abra o arquivo: `supabase/functions/news-api/index-standalone.ts`
2. **Copie TODO o conteúdo**
3. Cole no editor do Supabase Dashboard
4. Clique em **Deploy function**

### Passo 4: Testar
```bash
# Teste GET
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5"

# Se funcionar, verá as notícias em JSON
```

---

## 💻 MÉTODO 2: Via Supabase CLI (Avançado)

### Passo 1: Instalar Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux:**
```bash
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

### Passo 2: Login

```bash
supabase login
```

Isso abrirá o navegador para você fazer login.

### Passo 3: Link com o Projeto

```bash
# Encontre o Project Ref no Dashboard → Settings → General
supabase link --project-ref spgusjrjrhfychhdwixn
```

### Passo 4: Deploy da Function

```bash
# Deploy
supabase functions deploy news-api

# Verificar
supabase functions list
```

### Passo 5: Testar

```bash
./test-api.sh
```

---

## 🧪 Como Testar se Funcionou

### Teste Rápido no Navegador:

Abra esta URL no navegador:
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5
```

**Se funcionar:** Você verá um JSON com as notícias

**Se não funcionar:** Você verá um erro 401 ou 404

### Teste com exemplo-api.html:

1. Abra o arquivo `exemplo-api.html` no navegador
2. Clique em "Buscar Últimas Notícias"
3. As notícias devem aparecer na tela

---

## 🔍 Troubleshooting

### Erro: "Missing authorization header"
**Causa:** A Edge Function não foi deployada ainda
**Solução:** Faça o deploy usando um dos métodos acima

### Erro: "Function not found"
**Causa:** Nome da função incorreto ou deploy falhou
**Solução:** Verifique o nome no Dashboard ou refaça o deploy

### Erro ao fazer deploy via CLI
**Causa:** Projeto não linkado ou CLI não autenticado
**Solução:** 
```bash
supabase logout
supabase login
supabase link --project-ref spgusjrjrhfychhdwixn
```

---

## ✅ Checklist de Verificação

Após o deploy, verifique:

- [ ] GET retorna notícias em JSON
- [ ] GET com ?category=politica funciona
- [ ] GET com ?limit=5 retorna apenas 5 notícias
- [ ] POST cria notícia (teste com exemplo-api.html)
- [ ] POST com imagem funciona
- [ ] Notícia criada aparece no painel admin como rascunho

---

## 📞 Próximos Passos

1. **Faça o deploy** usando MÉTODO 1 (Dashboard)
2. **Teste** com o navegador ou test-api.sh
3. **Use** a API nos seus projetos!

**Qualquer dúvida, consulte API_DOCUMENTATION.md** 🚀

