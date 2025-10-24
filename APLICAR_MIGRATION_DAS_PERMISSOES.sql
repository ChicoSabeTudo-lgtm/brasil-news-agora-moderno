-- 🔧 CORREÇÃO: Aplicar permissões do gestor para das_payments
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- 1. Verificar se a policy atual existe
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'das_payments' AND policyname = 'Admins e redatores podem gerenciar DAS';

-- 2. Remover a policy antiga (se existir)
DROP POLICY IF EXISTS "Admins e redatores podem gerenciar DAS" ON public.das_payments;

-- 3. Criar nova policy que inclui o role 'gestor'
CREATE POLICY "Admins, redatores e gestores podem gerenciar DAS"
ON public.das_payments
FOR ALL
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
WHERE tablename = 'das_payments';

-- 5. Verificar se a tabela existe e tem dados
SELECT COUNT(*) as total_registros FROM public.das_payments;

-- 6. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'das_payments' 
ORDER BY ordinal_position;
