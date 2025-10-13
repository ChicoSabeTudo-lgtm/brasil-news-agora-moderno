# 🚀 Deploy da API de Notícias

## Pré-requisitos

1. **Supabase CLI** instalado
2. **Docker** rodando (para Supabase CLI)
3. **Acesso** ao projeto no Supabase

## Opção 1: Deploy via Supabase CLI (Recomendado)

### Passo 1: Instalar Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://github.com/supabase/cli/releases/download/v1.0.0/supabase_1.0.0_linux_amd64.tar.gz | tar -xz && sudo mv supabase /usr/local/bin/

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Passo 2: Login no Supabase

```bash
supabase login
```

### Passo 3: Link com o Projeto

```bash
# Substituir PROJECT_REF pelo ID do seu projeto
supabase link --project-ref PROJECT_REF
```

### Passo 4: Deploy da Function

```bash
# Deploy da news-api
supabase functions deploy news-api

# Verificar deploy
supabase functions list
```

### Passo 5: Testar

```bash
# Testar endpoint GET
curl "https://PROJECT_REF.supabase.co/functions/v1/news-api?limit=5"

# Ou usar o script de teste
./test-api.sh
```

## Opção 2: Deploy Manual via Dashboard

### Passo 1: Acessar Supabase Dashboard

1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **Edge Functions** no menu lateral

### Passo 2: Criar Nova Function

1. Clique em **Create a new function**
2. Nome: `news-api`
3. Cole o conteúdo de `supabase/functions/news-api/index.ts`

### Passo 3: Adicionar Arquivos Auxiliares

Infelizmente, o dashboard não suporta múltiplos arquivos. Você precisará:
1. Copiar o conteúdo de `types.ts` e colar no topo de `index.ts`
2. Copiar o conteúdo de `imageHandler.ts` e colar no topo de `index.ts`
3. Fazer os ajustes de imports

**Ou use a Opção 1 (Supabase CLI)** que é mais simples!

## Opção 3: Arquivo Único para Dashboard

Criei um arquivo consolidado: `supabase/functions/news-api/index-standalone.ts`

1. Copie o conteúdo deste arquivo
2. Cole no Dashboard do Supabase
3. Deploy pronto!

## Verificar Logs

```bash
# Via CLI
supabase functions logs news-api --tail

# Via Dashboard
Edge Functions → news-api → Logs
```

## Testar a API

### Teste GET:

```bash
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5"
```

### Teste POST:

```bash
curl -X POST https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste de Notícia via API",
    "content": "<p>Conteúdo de teste com mais de 100 caracteres para passar na validação da API de notícias do portal.</p>",
    "category_id": "uuid-categoria",
    "author_id": "uuid-autor",
    "tags": ["teste"]
  }'
```

## URLs da API

Após o deploy, sua API estará disponível em:

```
GET  https://PROJECT_REF.supabase.co/functions/v1/news-api
POST https://PROJECT_REF.supabase.co/functions/v1/news-api
```

Substitua `PROJECT_REF` pelo ID do seu projeto Supabase.

## Troubleshooting

### Erro: "Function not found"
**Solução:** Verifique se fez o deploy corretamente e se o nome está correto.

### Erro: "CORS error"
**Solução:** Os headers CORS já estão configurados. Certifique-se de que está fazendo requisição do frontend corretamente.

### Erro ao fazer upload de imagem
**Solução:** Verifique se o bucket `news-images` existe e tem as políticas corretas de acesso.

### Como criar o bucket news-images

Se o bucket não existir:

```sql
-- Execute no SQL Editor do Supabase
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

-- Política de acesso público para leitura
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'news-images' );

-- Política de insert para service role
create policy "Service role can upload"
on storage.objects for insert
with check ( bucket_id = 'news-images' );
```

## Próximos Passos

1. ✅ Deploy da function
2. ✅ Testar endpoints GET e POST
3. ✅ Integrar com seu sistema
4. ✅ Monitorar logs e performance

---

**🎉 API de Notícias pronta para uso!**

