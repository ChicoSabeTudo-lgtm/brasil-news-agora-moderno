import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateCreateNews, type CreateNewsRequest, type GetNewsParams, type NewsApiResponse } from './types.ts';
import { saveNewsImages } from './imageHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
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
        limit: parseInt(url.searchParams.get('limit') || '20'),
        offset: parseInt(url.searchParams.get('offset') || '0'),
        search: url.searchParams.get('search') || undefined,
      };

      // Validar limite
      if (params.limit && params.limit > 100) {
        params.limit = 100;
      }

      // Construir query
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

      // Aplicar paginação e ordenação
      query = query
        .order('published_at', { ascending: false })
        .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const response: NewsApiResponse = {
        data: data || [],
        count: count || 0,
        limit: params.limit || 20,
        offset: params.offset || 0,
      };

      return new Response(JSON.stringify(response), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // POST - Criar notícia
    if (req.method === 'POST') {
      const body: CreateNewsRequest = await req.json();

      // Validar dados
      const validation = validateCreateNews(body);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({
            error: 'Dados inválidos',
            errors: validation.errors,
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Verificar se categoria existe
      const { data: category, error: categoryError } = await supabaseClient
        .from('categories')
        .select('id')
        .eq('id', body.category_id)
        .single();

      if (categoryError || !category) {
        return new Response(
          JSON.stringify({
            error: 'Categoria não encontrada',
          }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Verificar se autor existe
      const { data: author, error: authorError } = await supabaseClient
        .from('profiles')
        .select('user_id')
        .eq('user_id', body.author_id)
        .single();

      if (authorError || !author) {
        return new Response(
          JSON.stringify({
            error: 'Autor não encontrado',
          }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Gerar slug a partir do título
      const slug = body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Criar notícia
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
          is_published: false, // Criar como rascunho
          published_at: new Date().toISOString(),
          views: 0,
        })
        .select()
        .single();

      if (newsError) {
        console.error('Error creating news:', newsError);
        return new Response(
          JSON.stringify({
            error: 'Erro ao criar notícia',
            message: newsError.message,
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Processar imagens se fornecidas
      if (body.images && body.images.length > 0) {
        const imageResult = await saveNewsImages(newsData.id, body.images, supabaseClient);
        
        if (!imageResult.success) {
          // Notícia foi criada, mas falhou ao salvar imagens
          return new Response(
            JSON.stringify({
              data: newsData,
              warning: 'Notícia criada, mas houve erro ao salvar imagens',
              error: imageResult.error,
            }),
            {
              status: 201,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }
      }

      return new Response(
        JSON.stringify({
          data: newsData,
          message: 'Notícia criada com sucesso como rascunho',
        }),
        {
          status: 201,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Método não suportado
    return new Response(
      JSON.stringify({
        error: 'Método não suportado',
        message: 'Use GET para buscar ou POST para criar notícias',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

