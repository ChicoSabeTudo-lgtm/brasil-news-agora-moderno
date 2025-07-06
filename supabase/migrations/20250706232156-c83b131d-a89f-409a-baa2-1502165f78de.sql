-- Rename summary column to meta_description in news table
ALTER TABLE public.news RENAME COLUMN summary TO meta_description;