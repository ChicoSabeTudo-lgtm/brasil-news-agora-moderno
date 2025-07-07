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

    // Limpar o conteúdo HTML para análise
    const textContent = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()

    // Encontrar matches potenciais
    const potentialMatches: BacklinkMatch[] = []

    for (const news of allNews) {
      const newsTitle = news.title.toLowerCase()
      const newsWords = newsTitle.split(/\s+/).filter(word => word.length > 3)
      
      // Verificar se o título da notícia aparece no conteúdo
      if (textContent.includes(newsTitle)) {
        potentialMatches.push({
          keyword: news.title,
          newsId: news.id,
          title: news.title,
          slug: news.slug,
          categorySlug: news.categories.slug,
          relevanceScore: 10 // Alta relevância para título completo
        })
      }

      // Verificar palavras-chave individuais do título
      for (const word of newsWords) {
        if (textContent.includes(word)) {
          const regex = new RegExp(`\\b${word}\\b`, 'gi')
          const matches = textContent.match(regex)
          if (matches && matches.length > 0) {
            potentialMatches.push({
              keyword: word,
              newsId: news.id,
              title: news.title,
              slug: news.slug,
              categorySlug: news.categories.slug,
              relevanceScore: matches.length * 2
            })
          }
        }
      }

      // Verificar tags
      if (news.tags) {
        for (const tag of news.tags) {
          if (textContent.includes(tag.toLowerCase())) {
            potentialMatches.push({
              keyword: tag,
              newsId: news.id,
              title: news.title,
              slug: news.slug,
              categorySlug: news.categories.slug,
              relevanceScore: 5
            })
          }
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
      .filter(match => match.relevanceScore >= 3) // Score mínimo
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5) // Máximo 5 backlinks por artigo

    console.log(`Found ${finalMatches.length} potential backlinks`)

    // Processar o conteúdo adicionando backlinks
    let processedContent = content

    for (const match of finalMatches) {
      const linkUrl = `/${match.categorySlug}/${match.slug}`
      const linkHTML = `<a href="${linkUrl}" class="internal-backlink" title="${match.title}">${match.keyword}</a>`
      
      // Criar regex para encontrar a primeira ocorrência da keyword que não está dentro de uma tag
      const regex = new RegExp(`(?![^<]*>)\\b${match.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      
      // Substituir apenas a primeira ocorrência
      if (regex.test(processedContent)) {
        processedContent = processedContent.replace(regex, linkHTML)
        console.log(`Added backlink for: ${match.keyword} -> ${match.title}`)
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