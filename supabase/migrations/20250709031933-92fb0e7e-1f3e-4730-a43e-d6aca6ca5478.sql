-- Criar enum para os tipos de template primeiro
CREATE TYPE public.category_template_type AS ENUM ('standard', 'grid', 'list', 'magazine');

-- Adicionar campo template_type na tabela categories com o enum
ALTER TABLE public.categories 
ADD COLUMN template_type category_template_type DEFAULT 'standard';