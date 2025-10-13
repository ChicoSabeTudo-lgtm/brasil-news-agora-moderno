// ============================================
// NEWS API - Versão Standalone para Supabase Dashboard
// ============================================
// Este arquivo consolida todos os tipos e funções auxiliares
// para facilitar o deploy via Dashboard do Supabase
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================
// TYPES
// ============================================

interface NewsImage {
  base64: string;
  caption?: string;
  is_cover?: boolean;
}

interface CreateNewsRequest {
  title: string;
  subtitle?: string;
  content: string;
  meta_description?: string;
  category_id: string;
  author_id: string;
  tags?: string[];
  is_breaking?: boolean;
  images?: NewsImage[];
}

interface NewsApiResponse {
  data?: any;
  count?: number;
  limit?: number;
  offset?: number;
  error?: string;
  message?: string;
}

interface GetNewsParams {
  category?: string;
  author_id?: string;
  tags?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

function validateCreateNews(body: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!body.title || typeof body.title !== 'string') {
    errors.push({ field: 'title', message: 'Título é obrigatório' });
  } else if (body.title.length < 10) {
    errors.push({ field: 'title', message: 'Título deve ter no mínimo 10 caracteres' });
  }

  if (!body.content || typeof body.content !== 'string') {
    errors.push({ field: 'content', message: 'Conteúdo é obrigatório' });
  } else if (body.content.length < 100) {
    errors.push({ field: 'content', message: 'Conteúdo deve ter no mínimo 100 caracteres' });
  }

  if (!body.category_id || typeof body.category_id !== 'string') {
    errors.push({ field: 'category_id', message: 'ID da categoria é obrigatório' });
  }

  if (!body.author_id || typeof body.author_id !== 'string') {
    errors.push({ field: 'author_id', message: 'ID do autor é obrigatório' });
  }

  if (body.images) {
    if (!Array.isArray(body.images)) {
      errors.push({ field: 'images', message: 'Imagens deve ser um array' });
    } else if (body.images.length > 10) {
      errors.push({ field: 'images', message: 'Máximo de 10 imagens permitidas' });
    } else {
      body.images.forEach((img: any, index: number) => {
        if (!img.base64 || typeof img.base64 !== 'string') {
          errors.push({ field: `images[${index}]`, message: 'Campo base64 é obrigatório' });
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// IMAGE HANDLER
// ============================================

interface ImageUploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
}

async function uploadImageFromBase64(
  base64Data: string,
  supabaseClient: any
): Promise<ImageUploadResult> {
  try {
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    
    const sizeInBytes = (base64Clean.length * 3) / 4;
    const maxSize = 5 * 1024 * 1024;
    
    if (sizeInBytes > maxSize) {
      return {
        success: false,
        error: 'Imagem muito grande. Máximo 5MB permitido.'
      };
    }

    const imageBuffer = Uint8Array.from(atob(base64Clean), c => c.charCodeAt(0));
    
    const contentType = base64Data.startsWith('data:image/png') ? 'image/png' :
                       base64Data.startsWith('data:image/gif') ? 'image/gif' :
                       base64Data.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
    const extension = contentType.split('/')[1] || 'jpg';
    
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('news-images')
      .upload(fileName, imageBuffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message
      };
    }

    const { data: { publicUrl } } = supabaseClient.storage
      .from('news-images')
      .getPublicUrl(fileName);

    return {
      success: true,
      path: uploadData.path,
      publicUrl: publicUrl
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao fazer upload da imagem'
    };
  }
}

async function saveNewsImages(
  newsId: string,
  images: Array<{ base64: string; caption?: string; is_cover?: boolean }>,
  supabaseClient: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const imageRecords = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      const uploadResult = await uploadImageFromBase64(image.base64, supabaseClient);
      
      if (!uploadResult.success) {
        return {
          success: false,
          error: `Erro ao fazer upload da imagem ${i + 1}: ${uploadResult.error}`
        };
      }
      
      imageRecords.push({
        news_id: newsId,
        image_url: uploadResult.publicUrl,
        path: uploadResult.path,
        public_url: uploadResult.publicUrl,
        caption: image.caption || '',
        is_cover: image.is_cover || (i === 0),
        sort_order: i
      });
    }
    
    if (imageRecords.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('news_images')
        .insert(imageRecords);
      
      if (insertError) {
        return {
          success: false,
          error: insertError.message
        };
      }
    }
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao salvar imagens'
    };
  }
}

// ============================================
// MAIN HANDLER
// ============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // GET - Buscar notícias
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const params: GetNewsParams = {
        category: url.searchParams.get('category') || undefined,
        author_id: url.searchParams.get('author_id') || undefined,
        tags: url.searchParams.get('tags') || undefined,
        from_date: url.searchParams.get('from_date') || undefined,
        to_date: url.searchParams.get('to_date') || undefined,
        limit: Math.min(parseInt(url.searchParams.get('limit') || '20'), 100),
        offset: parseInt(url.searchParams.get('offset') || '0'),
        search: url.searchParams.get('search') || undefined,
      };

      let query = supabaseClient
        .from('news')
        .select(`
          id,
          slug,
          title,
          subtitle,
          content,
          meta_description,
          published_at,
          updated_at,
          views,
          tags,
          is_breaking,
          is_featured,
          categories!inner (
            id,
            name,
            slug,
            color
          ),
          profiles (
            user_id,
            full_name
          ),
          news_images (
            id,
            image_url,
            public_url,
            path,
            caption,
            is_cover,
            sort_order
          )
        `, { count: 'exact' })
        .eq('is_published', true);

      if (params.category) {
        query = query.eq('categories.slug', params.category);
      }

      if (params.author_id) {
        query = query.eq('author_id', params.author_id);
      }

      if (params.tags) {
        const tagsArray = params.tags.split(',');
        query = query.contains('tags', tagsArray);
      }

      if (params.from_date) {
        query = query.gte('published_at', params.from_date);
      }

      if (params.to_date) {
        query = query.lte('published_at', params.to_date);
      }

      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`);
      }

      query = query
        .order('published_at', { ascending: false })
        .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const response: NewsApiResponse = {
        data: data || [],
        count: count || 0,
        limit: params.limit || 20,
        offset: params.offset || 0,
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Criar notícia
    if (req.method === 'POST') {
      const body: CreateNewsRequest = await req.json();

      const validation = validateCreateNews(body);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ error: 'Dados inválidos', errors: validation.errors }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: category } = await supabaseClient
        .from('categories')
        .select('id')
        .eq('id', body.category_id)
        .single();

      if (!category) {
        return new Response(
          JSON.stringify({ error: 'Categoria não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: author } = await supabaseClient
        .from('profiles')
        .select('user_id')
        .eq('user_id', body.author_id)
        .single();

      if (!author) {
        return new Response(
          JSON.stringify({ error: 'Autor não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const slug = body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data: newsData, error: newsError } = await supabaseClient
        .from('news')
        .insert({
          title: body.title,
          subtitle: body.subtitle || '',
          content: body.content,
          meta_description: body.meta_description || body.subtitle || body.title,
          category_id: body.category_id,
          author_id: body.author_id,
          slug: slug,
          tags: body.tags || [],
          is_breaking: body.is_breaking || false,
          is_featured: false,
          is_published: false,
          published_at: new Date().toISOString(),
          views: 0,
        })
        .select()
        .single();

      if (newsError) {
        return new Response(
          JSON.stringify({ error: 'Erro ao criar notícia', message: newsError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (body.images && body.images.length > 0) {
        const imageResult = await saveNewsImages(newsData.id, body.images, supabaseClient);
        
        if (!imageResult.success) {
          return new Response(
            JSON.stringify({
              data: newsData,
              warning: 'Notícia criada, mas houve erro ao salvar imagens',
              error: imageResult.error,
            }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({
          data: newsData,
          message: 'Notícia criada com sucesso como rascunho',
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Método não suportado',
        message: 'Use GET para buscar ou POST para criar notícias',
      }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

