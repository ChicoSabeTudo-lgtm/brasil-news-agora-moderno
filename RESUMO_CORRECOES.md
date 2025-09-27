# ✅ Correções Aplicadas - Permissões de Redatores

## 🎯 Problema Resolvido
Os redatores não conseguiam editar notícias de outras pessoas devido a restrições de permissão.

## 🔧 Correções Implementadas

### 1. ✅ Frontend (NewsEditor.tsx)
**Arquivo**: `src/components/admin/NewsEditor.tsx`
**Linha 134**: Alterado de:
```javascript
author_id: user?.id,
```
Para:
```javascript
author_id: editingNews?.author_id || user?.id,
```

**Resultado**: Agora mantém o autor original ao editar notícias de outras pessoas.

### 2. 📋 Banco de Dados (Políticas RLS)
**Arquivo**: `APLICAR_CORRECOES.sql`
**Status**: ⏳ **PENDENTE** - Execute no painel do Supabase

**Comandos SQL para executar**:
```sql
-- Remover política restritiva
DROP POLICY IF EXISTS "Redators can update their own news, admins can update all" ON public.news;

-- Criar nova política permissiva
CREATE POLICY "Redators and admins can update all news" 
ON public.news 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'redator'::app_role)
);

-- Permitir redatores excluírem notícias
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

## 🚀 Como Aplicar a Correção Completa

### Passo 1: Executar SQL no Supabase
1. Acesse o painel do Supabase
2. Vá para **SQL Editor**
3. Cole e execute o conteúdo do arquivo `APLICAR_CORRECOES.sql`

### Passo 2: Testar a Funcionalidade
1. Faça login como redator
2. Tente editar uma notícia de outro autor
3. Verifique se:
   - ✅ A edição é permitida
   - ✅ O autor original é mantido
   - ✅ A notícia é salva corretamente

## 🎉 Resultado Final
Após aplicar ambas as correções:
- ✅ Redatores podem editar notícias de qualquer autor
- ✅ Redatores podem excluir notícias de qualquer autor  
- ✅ O autor original é preservado ao editar
- ✅ Novas notícias são criadas com o redator como autor

## 📁 Arquivos Modificados
- `src/components/admin/NewsEditor.tsx` - Correção do frontend
- `APLICAR_CORRECOES.sql` - Script SQL para o banco
- `CORRECAO_REDATOR_PERMISSOES.md` - Documentação detalhada


