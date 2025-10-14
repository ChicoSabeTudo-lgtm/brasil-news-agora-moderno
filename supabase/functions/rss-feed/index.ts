import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch últimas 50 notícias publicadas
    const { data: news, error } = await supabaseClient
      .from('news')
      .select(`
        id,
        slug,
        title,
        meta_description,
        content,
        published_at,
        updated_at,
        author_id,
        categories (
          name,
          slug
        ),
        news_images (
          image_url,
          is_cover
        )
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching news:', error)
      throw error
    }

    const baseUrl = 'https://chicosabetudo.sigametech.com.br'
    const buildDate = new Date().toUTCString()

    // Gerar RSS 2.0
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ChicoSabeTudo - Portal de Notícias da Bahia</title>
    <link>${baseUrl}</link>
    <description>Portal de notícias da Bahia com cobertura completa de política, economia, esportes e entretenimento. Informação confiável e atualizada 24h.</description>
    <language>pt-BR</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/functions/v1/rss-feed" rel="self" type="application/rss+xml" />
    <generator>ChicoSabeTudo RSS Generator</generator>
    <image>
      <url>${baseUrl}/lovable-uploads/aac6981c-a63e-4b99-a9d1-5be26ea5ad4a.png</url>
      <title>ChicoSabeTudo</title>
      <link>${baseUrl}</link>
    </image>
`

    // Adicionar itens
    if (news && news.length > 0) {
      for (const article of news) {
        const categorySlug = article.categories?.slug || 'nacional'
        const categoryName = article.categories?.name || 'Nacional'
        const author = 'Redação ChicoSabeTudo' // Simplified - can be enhanced later
        const coverImage = article.news_images?.find(img => img.is_cover)
        const imageUrl = coverImage?.image_url || ''
        
        // URL do artigo
        const articleUrl = article.slug 
          ? `${baseUrl}/${categorySlug}/${article.slug}/${article.id}`
          : `${baseUrl}/noticia/${article.id}`

        // Limpar HTML do conteúdo para descrição
        const description = article.meta_description || 
          article.content?.replace(/<[^>]*>/g, '').substring(0, 300) + '...' ||
          article.title

        const pubDate = new Date(article.published_at).toUTCString()

        rss += `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(author)}</dc:creator>
      <category>${escapeXml(categoryName)}</category>`

        if (imageUrl) {
          rss += `
      <enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" />`
        }

        rss += `
    </item>`
      }
    }

    rss += `
  </channel>
</rss>`

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache de 1 hora
      },
    })

  } catch (error) {
    console.error('Error generating RSS feed:', error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    const errorStack = error instanceof Error ? error.stack : ''
    return new Response(`Error generating RSS feed: ${errorMessage}\n\nStack: ${errorStack}\n\nFull error: ${JSON.stringify(error, null, 2)}`, {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
      },
    })
  }
})
