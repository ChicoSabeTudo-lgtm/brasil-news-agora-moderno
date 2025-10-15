// ============================================
// NEWS API - VERSÃO PARA SUPABASE DASHBOARD
// ============================================
// Esta versão funciona diretamente no Dashboard do Supabase
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
    // VALORES HARDCODED para funcionar no Dashboard
    const SUPABASE_URL = 'https://spgusjrjrhfychhdwixn.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE';
    // SERVICE_ROLE_KEY - Necessário apenas para POST (criar notícias)
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || SUPABASE_ANON_KEY;

    console.log('🚀 Iniciando API de Notícias');
    console.log('URL:', SUPABASE_URL);
    console.log('Key (primeiros 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');

    // Cliente para leitura (anon key)
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // Cliente para escrita (service key) - usado apenas no POST
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // GET - Buscar notícias
    if (req.method === 'GET') {
      const url = new URL(req.url);
      
      // Parâmetros da query
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const category = url.searchParams.get('category') || undefined;
      const search = url.searchParams.get('search') || undefined;

      console.log('📋 Parâmetros:', { limit, offset, category, search });

      // Query básica para testar
      try {
        let query = supabaseClient
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
          .eq('is_published', true);

        // Aplicar filtros se fornecidos
        if (category) {
          // Buscar categoria por slug
          const { data: categoryData } = await supabaseClient
            .from('categories')
            .select('id')
            .eq('slug', category)
            .single();
          
          if (categoryData) {
            query = query.eq('category_id', categoryData.id);
          }
        }

        if (search) {
          query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        query = query
          .order('published_at', { ascending: false })
          .range(offset, offset + limit - 1);

        const { data: newsData, error: newsError, count } = await query;

        console.log('✅ Query executada. Erro:', newsError);
        console.log('📊 Dados encontrados:', newsData?.length || 0, 'de', count || 0);

        if (newsError) {
          console.error('❌ Erro na query de notícias:', newsError);
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

        // Buscar categorias para enriquecer dados
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
          console.warn('⚠️ Erro ao buscar categorias:', catError);
        }

        // Buscar imagens para enriquecer dados
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
          console.warn('⚠️ Erro ao buscar imagens:', imgError);
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
          message: 'Notícias recuperadas com sucesso',
          debug: {
            total_found: count || 0,
            returned: enrichedData.length,
            supabase_url: SUPABASE_URL,
            filters_applied: {
              category: category || null,
              search: search || null
            }
          }
        };

        console.log('🎉 Retornando resposta com', enrichedData.length, 'notícias');

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('❌ Erro geral na query:', error);
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

    // POST - Criar notícia
    if (req.method === 'POST') {
      console.log('📝 POST - Criando nova notícia');

      // Verificar autorização para POST
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({
            error: 'Autorização necessária',
            message: 'Para criar notícias, inclua o header Authorization'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const body = await req.json();
        console.log('📋 Dados recebidos:', { title: body.title, category_id: body.category_id });

        // Validações básicas
        const errors = [];
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

        if (errors.length > 0) {
          return new Response(
            JSON.stringify({ error: 'Dados inválidos', errors }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verificar se categoria existe
        const { data: category } = await supabaseAdmin
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

        // Criar slug
        const slug = body.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Determinar se deve publicar diretamente
        const publishImmediately = body.publish_immediately === true;

        // Inserir notícia
        const { data: newsData, error: newsError } = await supabaseAdmin
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
            is_published: publishImmediately, // Publica direto se solicitado
            published_at: new Date().toISOString(),
            views: 0,
          })
          .select()
          .single();

        if (newsError) {
          console.error('❌ Erro ao criar notícia:', newsError);
          return new Response(
            JSON.stringify({ 
              error: 'Erro ao criar notícia', 
              message: newsError.message 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ Notícia criada com ID:', newsData.id);

        // Processar imagens se fornecidas
        if (body.images && body.images.length > 0) {
          console.log('🖼️ Processando', body.images.length, 'imagens');
          
          for (let i = 0; i < body.images.length; i++) {
            const image = body.images[i];
            
            try {
              const base64Clean = image.base64.replace(/^data:image\/\w+;base64,/, '');
              const imageBuffer = Uint8Array.from(atob(base64Clean), c => c.charCodeAt(0));
              
              const contentType = image.base64.startsWith('data:image/png') ? 'image/png' :
                                 image.base64.startsWith('data:image/gif') ? 'image/gif' :
                                 image.base64.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
              
              const fileName = `${newsData.id}-${Date.now()}-${i}.${contentType.split('/')[1] || 'jpg'}`;
              
              const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from('news-images')
                .upload(fileName, imageBuffer, {
                  contentType: contentType,
                  cacheControl: '3600',
                  upsert: false
                });

              if (uploadError) {
                console.error('❌ Erro ao fazer upload da imagem', i + 1, ':', uploadError);
                continue;
              }

              const { data: { publicUrl } } = supabaseAdmin.storage
                .from('news-images')
                .getPublicUrl(fileName);

              // Salvar referência da imagem
              await supabaseAdmin
                .from('news_images')
                .insert({
                  news_id: newsData.id,
                  image_url: publicUrl,
                  path: uploadData.path,
                  public_url: publicUrl,
                  caption: image.caption || '',
                  is_cover: image.is_cover || (i === 0),
                  sort_order: i
                });

              console.log('✅ Imagem', i + 1, 'processada');
              
            } catch (imageError) {
              console.error('❌ Erro ao processar imagem', i + 1, ':', imageError);
            }
          }
        }

        const response = {
          data: newsData,
          message: publishImmediately 
            ? 'Notícia criada e publicada com sucesso' 
            : 'Notícia criada com sucesso como rascunho',
          note: publishImmediately 
            ? 'A notícia está publicada e visível no site' 
            : 'A notícia foi criada como rascunho e precisa ser aprovada no painel admin para ser publicada'
        };

        console.log('🎉 POST - Notícia criada com sucesso', publishImmediately ? '(PUBLICADA)' : '(RASCUNHO)');

        return new Response(JSON.stringify(response), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('❌ Erro geral POST:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Erro interno do servidor', 
            message: error.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Método não suportado
    return new Response(
      JSON.stringify({
        error: 'Método não suportado',
        message: 'Use GET para buscar notícias ou POST para criar',
        available_methods: ['GET', 'POST']
      }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Erro fatal:', error);
    
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