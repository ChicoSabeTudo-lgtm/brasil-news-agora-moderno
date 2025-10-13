// ============================================
// NEWS API - VERSÃO CORRIGIDA (Sem JOINs problemáticos)
// ============================================
// Esta versão remove os JOINs que estão causando erro
// e retorna apenas os dados básicos das notícias
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Usar anon key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // GET - Buscar notícias (VERSÃO SIMPLIFICADA)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      
      // Parâmetros da query
      const category = url.searchParams.get('category') || undefined;
      const author_id = url.searchParams.get('author_id') || undefined;
      const tags = url.searchParams.get('tags') || undefined;
      const from_date = url.searchParams.get('from_date') || undefined;
      const to_date = url.searchParams.get('to_date') || undefined;
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const search = url.searchParams.get('search') || undefined;

      // Query SIMPLIFICADA - apenas dados básicos das notícias
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
          category_id,
          author_id
        `, { count: 'exact' })
        .eq('is_published', true);

      // Aplicar filtros
      if (author_id) {
        query = query.eq('author_id', author_id);
      }

      if (tags) {
        const tagsArray = tags.split(',');
        query = query.contains('tags', tagsArray);
      }

      if (from_date) {
        query = query.gte('published_at', from_date);
      }

      if (to_date) {
        query = query.lte('published_at', to_date);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      // Ordenar e paginar
      query = query
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Executar query
      const { data, error, count } = await query;

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      // Buscar categorias separadamente (se necessário)
      let categoriesData = [];
      if (data && data.length > 0) {
        const categoryIds = [...new Set(data.map(item => item.category_id))];
        const { data: categories } = await supabaseClient
          .from('categories')
          .select('id, name, slug, color')
          .in('id', categoryIds);
        
        categoriesData = categories || [];
      }

      // Buscar imagens separadamente (se necessário)
      let imagesData = [];
      if (data && data.length > 0) {
        const newsIds = data.map(item => item.id);
        const { data: images } = await supabaseClient
          .from('news_images')
          .select('news_id, image_url, public_url, path, caption, is_cover, sort_order')
          .in('news_id', newsIds)
          .order('sort_order');
        
        imagesData = images || [];
      }

      // Combinar dados
      const enrichedData = data ? data.map(news => {
        const category = categoriesData.find(cat => cat.id === news.category_id);
        const newsImages = imagesData.filter(img => img.news_id === news.id);
        
        return {
          ...news,
          category: category || null,
          images: newsImages
        };
      }) : [];

      // Resposta
      const response = {
        data: enrichedData,
        count: count || 0,
        limit: limit,
        offset: offset,
        message: 'Notícias recuperadas com sucesso'
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Criar notícia (DESABILITADO para esta versão)
    if (req.method === 'POST') {
      return new Response(
        JSON.stringify({
          error: 'Operação não permitida',
          message: 'Esta versão da API é somente leitura. Use a versão autenticada para criar notícias.'
        }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Método não suportado
    return new Response(
      JSON.stringify({
        error: 'Método não suportado',
        message: 'Use GET para buscar notícias'
      }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        message: error.message,
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
