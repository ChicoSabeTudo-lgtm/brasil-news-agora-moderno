-- Add embed_code field to news table for embedding external content like YouTube videos, Instagram posts, etc.
ALTER TABLE public.news ADD COLUMN embed_code TEXT;