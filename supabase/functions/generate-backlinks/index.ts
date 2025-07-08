import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BacklinkMatch {
  keyword: string
  newsId: string
  title: string
  slug: string
  categorySlug: string
  relevanceScore: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { content, currentNewsId, categorySlug } = await req.json()
    
    if (!content) {
      throw new Error('Content is required')
    }

    console.log('Processing backlinks for content length:', content.length)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar todas as notícias publicadas (exceto a atual)
    const { data: allNews, error } = await supabase
      .from('news')
      .select(`
        id,
        title,
        slug,
        tags,
        categories!inner (
          slug
        )
      `)
      .eq('is_published', true)
      .neq('id', currentNewsId || 'none')
      .limit(100)

    if (error) {
      console.error('Error fetching news:', error)
      throw error
    }

    if (!allNews || allNews.length === 0) {
      console.log('No news found for backlinking')
      return new Response(
        JSON.stringify({ processedContent: content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${allNews.length} news articles for potential backlinks`)

    // Obter tags da notícia atual
    let currentTags: string[] = []
    
    if (currentNewsId) {
      const { data: currentNews } = await supabase
        .from('news')
        .select('tags')
        .eq('id', currentNewsId)
        .single()
      
      currentTags = currentNews?.tags || []
    }

    console.log('Current news tags:', currentTags)

    // Encontrar matches potenciais apenas por tags em comum
    const potentialMatches: BacklinkMatch[] = []

    for (const news of allNews) {
      // Verificar apenas tags em comum
      if (news.tags && currentTags.length > 0) {
        const commonTags = news.tags.filter(tag => 
          currentTags.some(currentTag => 
            currentTag.toLowerCase() === tag.toLowerCase()
          )
        )
        
        if (commonTags.length > 0) {
          // Usar a primeira tag em comum como keyword
          const firstCommonTag = commonTags[0]
          
          potentialMatches.push({
            keyword: firstCommonTag,
            newsId: news.id,
            title: news.title,
            slug: news.slug,
            categorySlug: news.categories.slug,
            relevanceScore: commonTags.length * 5 // 5 pontos por tag em comum
          })
          
          console.log(`Found common tags between current and "${news.title}":`, commonTags)
        }
      }
    }

    // Agrupar por notícia e somar scores
    const newsScores = new Map<string, BacklinkMatch>()
    
    for (const match of potentialMatches) {
      const existing = newsScores.get(match.newsId)
      if (existing) {
        existing.relevanceScore += match.relevanceScore
        // Usar a keyword mais longa/específica
        if (match.keyword.length > existing.keyword.length) {
          existing.keyword = match.keyword
        }
      } else {
        newsScores.set(match.newsId, match)
      }
    }

    // Filtrar e ordenar por relevância
    const finalMatches = Array.from(newsScores.values())
      .filter(match => match.relevanceScore >= 5) // Score mínimo aumentado para tags
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5) // Máximo 5 backlinks por artigo

    console.log(`Found ${finalMatches.length} potential backlinks based on common tags`)

    // Processar o conteúdo adicionando backlinks apenas se a tag aparecer no conteúdo
    let processedContent = content
    const contentLower = content.toLowerCase()

    for (const match of finalMatches) {
      // Verificar se a tag (keyword) aparece no conteúdo
      if (contentLower.includes(match.keyword.toLowerCase())) {
        const linkUrl = `/${match.categorySlug}/${match.slug}`
        const linkHTML = `<a href="${linkUrl}" class="internal-backlink" title="${match.title}">${match.keyword}</a>`
        
        // Criar regex para encontrar a primeira ocorrência da keyword que não está dentro de uma tag
        const regex = new RegExp(`(?![^<]*>)\\b${match.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        
        // Substituir apenas a primeira ocorrência
        if (regex.test(processedContent)) {
          processedContent = processedContent.replace(regex, linkHTML)
          console.log(`Added backlink for tag: ${match.keyword} -> ${match.title}`)
        }
      }
    }

    // Adicionar CSS para backlinks se não existir
    if (finalMatches.length > 0 && !processedContent.includes('internal-backlink')) {
      const style = `
        <style>
          .internal-backlink {
            color: #0066cc;
            text-decoration: underline;
            font-weight: 500;
          }
          .internal-backlink:hover {
            color: #004499;
            text-decoration: none;
          }
        </style>
      `
      processedContent = style + processedContent
    }

    console.log('Backlink processing completed successfully')

    return new Response(
      JSON.stringify({ 
        processedContent,
        backlinksAdded: finalMatches.length,
        backlinks: finalMatches.map(m => ({
          keyword: m.keyword,
          title: m.title,
          url: `/${m.categorySlug}/${m.slug}`,
          score: m.relevanceScore
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in backlinks function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        processedContent: req.body ? JSON.parse(await req.text()).content : ''
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})