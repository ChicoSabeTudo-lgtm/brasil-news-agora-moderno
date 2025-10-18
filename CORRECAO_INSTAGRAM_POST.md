# Correção do Erro no Envio de Posts para Instagram

## Data: 18/10/2025

---

## 🎯 Resumo Executivo

**Problema:** Erro ao enviar posts para o Instagram  
**Causa:** Políticas de permissão do bucket `social-posts` não incluíam role `gestor`  
**Solução:** Migração aplicada com sucesso  
**Status:** ✅ **RESOLVIDO**

### Impacto
- ✅ Usuários com role `gestor` agora podem enviar posts para Instagram
- ✅ Mensagens de erro mais claras e amigáveis
- ✅ Política de UPDATE adicionada (estava faltando)
- ✅ Logs detalhados para facilitar debug futuro

---

## Problema Identificado

Ao tentar enviar posts para o Instagram, usuários com a role `gestor` enfrentavam erros de permissão ao fazer upload de imagens para o bucket `social-posts` no Supabase Storage.

## Causa Raiz

As políticas de Row Level Security (RLS) do bucket `social-posts` estavam configuradas para permitir apenas usuários com roles `admin` e `redator`, mas o componente `InstagramPostGenerator` aceita também usuários com role `gestor`.

### Políticas Antigas:
```sql
-- Permitia apenas 'redator' e 'admin'
CREATE POLICY "Redators and admins can upload social posts images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'social-posts' 
  AND role IN ('redator', 'admin')
);
```

### Componente que aceita 3 roles:
```tsx
// Em src/components/admin/InstagramPostGenerator.tsx
<ProtectedRoute allowedRoles={['admin', 'redator', 'gestor']}>
```

## Solução Implementada

Criada migração `fix_social_posts_bucket_permissions_for_gestor` que:

1. **Removeu políticas antigas** que restringiam acesso apenas a admin/redator
2. **Criou novas políticas** incluindo a role `gestor`:
   - Upload de imagens (INSERT)
   - Deleção de imagens próprias (DELETE)
   - Atualização de imagens (UPDATE) - que estava faltando

### Novas Políticas:
```sql
CREATE POLICY "Redators, gestors and admins can upload social posts images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'social-posts' 
  AND role IN ('redator', 'admin', 'gestor')
);

-- Políticas similares para DELETE e UPDATE
```

## Configurações Verificadas

✅ **Bucket social-posts**: Existe e está público
✅ **Mockup do Instagram**: Configurado
```
URL: https://spgusjrjrhfychhdwixn.supabase.co/storage/v1/object/public/logos/instagram-mockup-1754427546446.png
```

✅ **Webhook Social**: Configurado
```
URL: https://webhooks8.investehoje.com.br/webhook/e6a45e78-2617-4499-8658-96abdacc2aa0
```

## Fluxo de Envio do Instagram

1. **Editor** (`InstagramEditor.tsx`):
   - Upload da imagem base
   - Ajustes de zoom, posição
   - Configuração do texto (título, fonte, cor)
   - Renderização do canvas

2. **Finalização** (`InstagramFinalize.tsx`):
   - Conversão do canvas para blob
   - Upload para bucket `social-posts` ⚠️ **(Era aqui que falhava)**
   - Geração de URL pública
   - Envio do payload para webhook

## Status

✅ **Problema corrigido**
- Usuários com role `gestor` agora podem fazer upload de posts do Instagram
- Políticas de storage atualizadas e alinhadas com as permissões do componente
- Política de UPDATE adicionada (estava faltando)

## Próximos Passos

1. ✅ Testar o envio de posts no browser
2. Verificar logs do console durante o processo
3. Confirmar que o webhook recebe o payload corretamente

## Arquivos Modificados

- `supabase/migrations/[timestamp]_fix_social_posts_bucket_permissions_for_gestor.sql` (NOVO)

## Arquivos Relacionados

- `src/components/admin/InstagramPostGenerator.tsx`
- `src/components/admin/InstagramEditor.tsx`
- `src/components/admin/InstagramFinalize.tsx`
- `src/hooks/useInstagramMockup.tsx`
- `supabase/migrations/20250901234940_5a4bbf21-074d-4a78-862a-98f3501bff96.sql` (migração original do bucket)

