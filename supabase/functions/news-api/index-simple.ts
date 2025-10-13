// ============================================
// NEWS API - VERSÃO ULTRA SIMPLES (Teste de Conectividade)
// ============================================
// Esta versão testa primeiro se as tabelas existem
// e retorna dados básicos sem JOINs complexos
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

    // GET - Buscar notícias (VERSÃO ULTRA SIMPLES)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      
      // Parâmetros da query
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const search = url.searchParams.get('search') || undefined;

      console.log('Iniciando busca de notícias...');

      // Teste 1: Verificar se a tabela news existe
      try {
        const { data: newsData, error: newsError, count } = await supabaseClient
          .from('news')
          .select(`
            id,
            title,
            subtitle,
            content,
            published_at,
            views,
            tags,
            is_breaking,
            is_featured,
            category_id,
            author_id
          `, { count: 'exact' })
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (newsError) {
          console.error('Erro na query de notícias:', newsError);
          return new Response(
            JSON.stringify({ 
              error: 'Erro ao buscar notícias', 
              message: newsError.message,
              details: newsError.toString()
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Encontradas ${count || 0} notícias`);

        // Se não há notícias, retornar array vazio
        if (!newsData || newsData.length === 0) {
          return new Response(
            JSON.stringify({
              data: [],
              count: 0,
              limit: limit,
              offset: offset,
              message: 'Nenhuma notícia encontrada'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Buscar informações de categoria (opcional)
        let categoriesMap = {};
        try {
          const categoryIds = [...new Set(newsData.map(item => item.category_id).filter(Boolean))];
          if (categoryIds.length > 0) {
            const { data: categoriesData } = await supabaseClient
              .from('categories')
              .select('id, name, slug, color')
              .in('id', categoryIds);
            
            if (categoriesData) {
              categoriesMap = categoriesData.reduce((acc, cat) => {
                acc[cat.id] = cat;
                return acc;
              }, {});
            }
          }
        } catch (catError) {
          console.warn('Erro ao buscar categorias:', catError);
          // Continuar sem categorias
        }

        // Buscar imagens (opcional)
        let imagesMap = {};
        try {
          const newsIds = newsData.map(item => item.id);
          const { data: imagesData } = await supabaseClient
            .from('news_images')
            .select('news_id, image_url, caption, is_cover, sort_order')
            .in('news_id', newsIds)
            .order('sort_order');
          
          if (imagesData) {
            imagesMap = imagesData.reduce((acc, img) => {
              if (!acc[img.news_id]) acc[img.news_id] = [];
              acc[img.news_id].push(img);
              return acc;
            }, {});
          }
        } catch (imgError) {
          console.warn('Erro ao buscar imagens:', imgError);
          // Continuar sem imagens
        }

        // Enriquecer dados
        const enrichedData = newsData.map(news => ({
          id: news.id,
          title: news.title,
          subtitle: news.subtitle || '',
          content: news.content,
          published_at: news.published_at,
          views: news.views || 0,
          tags: news.tags || [],
          is_breaking: news.is_breaking || false,
          is_featured: news.is_featured || false,
          category_id: news.category_id,
          author_id: news.author_id,
          category: categoriesMap[news.category_id] || null,
          images: imagesMap[news.id] || []
        }));

        // Resposta de sucesso
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

      } catch (error) {
        console.error('Erro geral:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Erro interno do servidor', 
            message: error.message,
            stack: error.stack
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // POST - Desabilitado
    if (req.method === 'POST') {
      return new Response(
        JSON.stringify({
          error: 'Operação não permitida',
          message: 'Esta versão da API é somente leitura'
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
    console.error('Erro fatal:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro fatal do servidor', 
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
