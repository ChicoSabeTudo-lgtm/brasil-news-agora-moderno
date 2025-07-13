import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch latest published news
    const { data: news, error } = await supabaseClient
      .from('news')
      .select(`
        id,
        slug,
        title,
        subtitle,
        content,
        meta_description,
        published_at,
        categories (name, slug),
        profiles (full_name),
        news_images (image_url, is_featured)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    const baseUrl = 'https://spgusjrjrhfychhdwixn.supabase.co'
    const currentDate = new Date().toISOString()

    // Helper function to escape XML characters
    const escapeXml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    }

    // Helper function to strip HTML and truncate
    const cleanContent = (html: string, maxLength = 300) => {
      const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Portal de Notícias</title>
    <link>${baseUrl}</link>
    <description>As principais notícias do Brasil e do mundo</description>
    <language>pt-BR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${baseUrl}/functions/v1/rss-feed" rel="self" type="application/rss+xml" />
    <image>
      <title>Portal de Notícias</title>
      <url>${baseUrl}/logo.png</url>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>`

    if (news) {
      for (const article of news) {
        const categorySlug = article.categories?.slug || 'nacional'
        const categoryName = article.categories?.name || 'Nacional'
        const authorName = article.profiles?.full_name || 'Redação'
        const featuredImage = article.news_images?.find(img => img.is_featured)?.image_url
        const description = cleanContent(article.content)
        
        rss += `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${baseUrl}/${categorySlug}/${article.slug}/${article.id}</link>
      <description>${escapeXml(article.meta_description || description)}</description>
      <content:encoded><![CDATA[${article.content}]]></content:encoded>
      <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/${categorySlug}/${article.slug}/${article.id}</guid>
      <category>${escapeXml(categoryName)}</category>
      <author>${escapeXml(authorName)}</author>`

        if (featuredImage) {
          rss += `
      <enclosure url="${featuredImage}" type="image/jpeg" />`
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
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=3600'
      },
    })

  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', {
      status: 500,
      headers: corsHeaders,
    })
  }
})