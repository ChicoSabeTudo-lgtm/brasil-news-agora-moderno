# 🚨 AÇÃO NECESSÁRIA: Executar Setup dos Autores

## ❌ **Problema Atual:**
- Não há profiles de usuários no banco de dados
- Sistema de OTP não funciona sem usuários configurados
- Webhook não pode ser testado

## ✅ **Solução:**

### **1. Execute o SQL no Supabase Dashboard:**

1. **Acesse:** https://supabase.com/dashboard
2. **Vá em:** SQL Editor
3. **Cole e execute:** O conteúdo do arquivo `SETUP_AUTHORS_FINAL.sql`

### **2. SQL para Executar:**

```sql
-- ============================================================================
-- SCRIPT FINAL PARA CONFIGURAR AUTORES COM NOMES REAIS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. FRANCISCO ALVES (chicop7@gmail.com) - 55+ notícias
-- ============================================================================

-- Criar profile
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'Francisco Alves', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false;

-- Criar role
INSERT INTO public.user_roles (user_id, role)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 2. YASMIM RODRIGUES DOS SANTOS (yasmimrodriguesdsa@gmail.com) - 13+ notícias
-- ============================================================================

-- Criar profile
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('bfbf7dbe-3f41-4667-ae86-8978d0fed605', 'Yasmim Rodrigues dos Santos', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false;

-- Criar role
INSERT INTO public.user_roles (user_id, role)
VALUES ('bfbf7dbe-3f41-4667-ae86-8978d0fed605', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 3. PORTAL CHICOSABETUDO (faleconosco@chicosabetudo.com.br) - 5+ notícias
-- ============================================================================

-- Criar profile
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('705fd72e-c3cd-4009-b8cd-ef7b2645bc12', 'Portal ChicoSabeTudo', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false;

-- Criar role
INSERT INTO public.user_roles (user_id, role)
VALUES ('705fd72e-c3cd-4009-b8cd-ef7b2645bc12', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- CONFIGURAR WHATSAPP PARA OS AUTORES
-- ============================================================================

-- Francisco Alves
UPDATE public.profiles 
SET whatsapp_phone = '+5511999999999'
WHERE user_id = '610e7321-e707-45c8-b48d-7c86f31f1750';

-- Yasmim Rodrigues
UPDATE public.profiles 
SET whatsapp_phone = '+5511999999998'
WHERE user_id = 'bfbf7dbe-3f41-4667-ae86-8978d0fed605';

-- Portal ChicoSabeTudo
UPDATE public.profiles 
SET whatsapp_phone = '+5511999999997'
WHERE user_id = '705fd72e-c3cd-4009-b8cd-ef7b2645bc12';

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

SELECT 
  p.user_id,
  p.full_name as nome,
  p.whatsapp_phone,
  p.is_approved,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.user_id IN (
  '610e7321-e707-45c8-b48d-7c86f31f1750',
  'bfbf7dbe-3f41-4667-ae86-8978d0fed605',
  '705fd72e-c3cd-4009-b8cd-ef7b2645bc12'
)
ORDER BY p.full_name;
```

### **3. Após Executar:**

1. **Teste o login** com as credenciais do Francisco
2. **Código OTP** será enviado via webhook para WhatsApp
3. **Sistema funcionará** perfeitamente

---

## 🎯 **Resultado Esperado:**

Após executar o SQL, você terá:
- ✅ 3 autores configurados com profiles
- ✅ Roles de redator atribuídos
- ✅ Números de WhatsApp configurados
- ✅ Sistema OTP funcionando via webhook
- ✅ Login seguro sem mostrar código na tela

**Execute o SQL e teste o login!** 🚀
