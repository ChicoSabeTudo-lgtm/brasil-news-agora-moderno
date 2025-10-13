// ============================================
// NEWS API - VERSÃO COM VALORES HARDCODED (Para Teste)
// ============================================
// Esta versão usa valores hardcoded para testar
// se o problema são as variáveis de ambiente
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
    // VALORES HARDCODED para teste
    const SUPABASE_URL = 'https://spgusjrjrhfychhdwixn.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE';

    console.log('URL:', SUPABASE_URL);
    console.log('Key (primeiros 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');

    // Criar cliente Supabase
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // GET - Buscar notícias
    if (req.method === 'GET') {
      const url = new URL(req.url);
      
      // Parâmetros da query
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
      const offset = parseInt(url.searchParams.get('offset') || '0');

      console.log('Iniciando busca de notícias...');
      console.log('Limit:', limit, 'Offset:', offset);

      // Query básica para testar
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

        console.log('Query executada. Erro:', newsError);
        console.log('Dados encontrados:', newsData?.length || 0);

        if (newsError) {
          console.error('Erro na query de notícias:', newsError);
          return new Response(
            JSON.stringify({ 
              error: 'Erro ao buscar notícias', 
              message: newsError.message,
              details: newsError.toString(),
              code: newsError.code,
              hint: newsError.hint
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Se não há notícias
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

        // Enriquecer dados básicos
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
          author_id: news.author_id
        }));

        // Resposta de sucesso
        const response = {
          data: enrichedData,
          count: count || 0,
          limit: limit,
          offset: offset,
          message: 'Notícias recuperadas com sucesso',
          debug: {
            total_found: count || 0,
            returned: enrichedData.length,
            supabase_url: SUPABASE_URL
          }
        };

        console.log('Retornando resposta com', enrichedData.length, 'notícias');

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Erro geral na query:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Erro interno do servidor', 
            message: error.message,
            stack: error.stack,
            supabase_url: SUPABASE_URL
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
