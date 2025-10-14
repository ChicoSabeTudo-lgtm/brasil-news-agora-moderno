-- Migration: Add image format tracking columns to news_images table
-- Created: 2025-10-14
-- Purpose: Track image formats (AVIF/WebP/JPEG) for optimized images

-- Add columns for image format tracking
ALTER TABLE public.news_images 
ADD COLUMN IF NOT EXISTS image_format TEXT CHECK (image_format IN ('avif', 'webp', 'jpeg', 'png', 'gif')),
ADD COLUMN IF NOT EXISTS original_format TEXT,
ADD COLUMN IF NOT EXISTS original_size BIGINT,
ADD COLUMN IF NOT EXISTS optimized_size BIGINT;

-- Add comment to columns
COMMENT ON COLUMN public.news_images.image_format IS 'Format of the optimized image stored (avif, webp, jpeg, png, gif)';
COMMENT ON COLUMN public.news_images.original_format IS 'Original format of the uploaded image';
COMMENT ON COLUMN public.news_images.original_size IS 'Original file size in bytes';
COMMENT ON COLUMN public.news_images.optimized_size IS 'Optimized file size in bytes';

-- Create index for faster queries by format
CREATE INDEX IF NOT EXISTS idx_news_images_format ON public.news_images(image_format);

