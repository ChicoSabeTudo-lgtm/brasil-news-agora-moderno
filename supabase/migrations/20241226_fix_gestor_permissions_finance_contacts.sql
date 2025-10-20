-- Corrigir permissões do role 'gestor' para acessar finance_contacts
-- O gestor precisa ter acesso de leitura e escrita aos contatos para poder criar propagandas

-- Remover a policy antiga que só permitia admin e redator
DROP POLICY IF EXISTS "finance contacts write" ON public.finance_contacts;

-- Criar nova policy que inclui o role 'gestor'
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

-- Comentário para documentar a mudança
COMMENT ON POLICY "finance contacts write" ON public.finance_contacts 
IS 'Permite que admins, redators e gestores gerenciem contatos financeiros';
