# ✅ Correção: "Usuário Removido" na Lista de Notícias

## 🎯 Problema Identificado
Na lista de notícias, a coluna "Autor" estava mostrando "Usuário Removido" mesmo quando o usuário existe.

## 🔍 Causa do Problema
O problema ocorria porque:
1. A consulta buscava perfis na tabela `profiles`
2. Alguns usuários não tinham perfil criado na tabela `profiles`
3. Quando não encontrava o perfil, mostrava "Desconhecido" (que aparecia como "Usuário Removido")

## 🔧 Correções Aplicadas

### 1. ✅ Frontend (NewsList.tsx)
**Arquivo**: `src/components/admin/NewsList.tsx`
**Linhas 130-139**: Melhorada a lógica de exibição dos autores

**Antes**:
```javascript
profiles: profilesData.find(p => p.user_id === news.author_id) || null
```

**Depois**:
```javascript
profiles: profile || {
  user_id: news.author_id,
  full_name: news.author_id ? `Usuário ${news.author_id.slice(0, 8)}` : 'Desconhecido'
}
```

**Resultado**: Agora mostra um identificador do usuário mesmo quando não há perfil.

### 2. 📋 Banco de Dados (Criar Perfis)
**Arquivo**: `fix_user_profiles.sql`
**Status**: ⏳ **PENDENTE** - Execute no painel do Supabase

**Comando SQL para executar**:
```sql
-- Criar perfis para usuários que não têm
INSERT INTO public.profiles (user_id, full_name, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as full_name,
  u.created_at,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;
```

## 🚀 Como Aplicar a Correção Completa

### Passo 1: Executar SQL no Supabase
1. Acesse o painel do Supabase
2. Vá para **SQL Editor**
3. Execute o conteúdo do arquivo `fix_user_profiles.sql`

### Passo 2: Testar a Funcionalidade
1. Recarregue a página da lista de notícias
2. Verifique se os autores agora aparecem corretamente
3. Confirme que não há mais "Usuário Removido"

## 🎉 Resultado Esperado
Após aplicar as correções:
- ✅ Autores aparecem com nome real (se tiver perfil)
- ✅ Autores aparecem com identificador (se não tiver perfil)
- ✅ Não há mais "Usuário Removido"
- ✅ Lista de notícias funciona corretamente

## 📁 Arquivos Modificados
- `src/components/admin/NewsList.tsx` - Correção do frontend
- `fix_user_profiles.sql` - Script SQL para criar perfis
- `debug_author_issue.sql` - Script para investigar o problema
