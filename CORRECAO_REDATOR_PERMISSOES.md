# Correção de Permissões para Redatores

## Problema Identificado
Os redatores não conseguiam editar notícias de outras pessoas devido a duas restrições:

1. **Política RLS restritiva**: A política `"Redators can update their own news, admins can update all"` permitia apenas que redatores editassem suas próprias notícias (`author_id = auth.uid()`)

2. **Frontend sobrescrevendo author_id**: O NewsEditor estava sempre definindo `author_id: user?.id`, sobrescrevendo o autor original da notícia

## Correções Aplicadas

### 1. Correção no Frontend (NewsEditor.tsx)
- **Arquivo**: `src/components/admin/NewsEditor.tsx`
- **Linha 134**: Alterado de `author_id: user?.id` para `author_id: editingNews?.author_id || user?.id`
- **Resultado**: Agora mantém o autor original ao editar, mas usa o usuário atual para novas notícias

### 2. Correção no Banco de Dados (Políticas RLS)
- **Arquivo**: `fix_redator_permissions.sql`
- **Ação**: Execute este script no SQL Editor do Supabase

```sql
-- Remover a política restritiva atual
DROP POLICY IF EXISTS "Redators can update their own news, admins can update all" ON public.news;

-- Criar nova política que permite redatores editar todas as notícias
CREATE POLICY "Redators and admins can update all news" 
ON public.news 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'redator'::app_role)
);

-- Também permitir que redatores excluam notícias
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;

CREATE POLICY "Redators and admins can delete news" 
ON public.news 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'redator'::app_role)
);
```

## Como Aplicar

1. **Frontend**: A correção já foi aplicada no código
2. **Banco de Dados**: 
   - Acesse o painel do Supabase
   - Vá para SQL Editor
   - Execute o script `fix_redator_permissions.sql`

## Resultado Esperado
Após aplicar ambas as correções, os redatores poderão:
- ✅ Editar notícias de qualquer autor
- ✅ Excluir notícias de qualquer autor
- ✅ Manter o autor original da notícia ao editar
- ✅ Criar novas notícias com eles mesmos como autor

## Verificação
Para verificar se as políticas foram aplicadas corretamente, execute no SQL Editor:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'news' 
ORDER BY policyname;
```

Você deve ver as políticas:
- `"Redators and admins can update all news"`
- `"Redators and admins can delete news"`


