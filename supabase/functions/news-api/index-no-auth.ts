// ============================================
// NEWS API - SEM AUTENTICAÇÃO (Para n8n, Zapier, etc.)
// ============================================
// Esta versão NÃO exige nenhuma autenticação
// Ideal para integrações públicas
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
    // Usar anon key - SEM AUTENTICAÇÃO
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // GET - Buscar notícias (SEM AUTENTICAÇÃO)
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

      // Query base
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

      // Aplicar filtros
      if (category) {
        query = query.eq('categories.slug', category);
      }

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

      // Resposta
      const response = {
        data: data || [],
        count: count || 0,
        limit: limit,
        offset: offset,
        message: 'Notícias recuperadas com sucesso'
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Criar notícia (DESABILITADO para esta versão pública)
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
