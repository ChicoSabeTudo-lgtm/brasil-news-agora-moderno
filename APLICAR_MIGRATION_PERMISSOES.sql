-- 🔧 CORREÇÃO URGENTE: Aplicar permissões do gestor para finance_contacts
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- 1. Verificar se a policy atual existe
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'finance_contacts' AND policyname = 'finance contacts write';

-- 2. Remover a policy antiga (se existir)
DROP POLICY IF EXISTS "finance contacts write" ON public.finance_contacts;

-- 3. Criar nova policy que inclui o role 'gestor'
CREATE POLICY "finance contacts write" 
ON public.finance_contacts 
FOR ALL 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'redator'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
) 
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'redator'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
);

-- 4. Verificar se foi aplicada corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'finance_contacts';

-- 5. Testar se o gestor consegue acessar (substitua USER_ID pelo ID do gestor)
-- SELECT public.has_role('USER_ID_AQUI'::uuid, 'gestor'::app_role);

-- 6. Verificar quantos clientes existem
SELECT COUNT(*) as total_clientes FROM public.finance_contacts WHERE type = 'cliente';

-- 7. Listar alguns clientes (para confirmar que existem)
SELECT id, name, email, phone, type FROM public.finance_contacts WHERE type = 'cliente' LIMIT 5;
