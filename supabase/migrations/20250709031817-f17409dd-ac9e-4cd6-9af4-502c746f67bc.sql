-- Adicionar campo template_type na tabela categories
ALTER TABLE public.categories 
ADD COLUMN template_type TEXT DEFAULT 'standard';

-- Criar enum para os tipos de template
CREATE TYPE public.category_template_type AS ENUM ('standard', 'grid', 'list', 'magazine');

-- Atualizar a coluna para usar o enum
ALTER TABLE public.categories 
ALTER COLUMN template_type TYPE category_template_type 
USING template_type::category_template_type;