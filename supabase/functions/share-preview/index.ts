import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS restrito
const ALLOWED_ORIGINS = [
  'https://chicosabetudo.sigametech.com.br',
  'http://localhost:8080',
  'http://localhost:5173'
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

// Rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count < RATE_LIMIT_MAX) {
    entry.count++;
    return true;
  }

  return false;
}

function escapeHtml(text: string) {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function stripHtml(html: string, maxLength = 180) {
  const text = (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate limiting
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: { ...corsHeaders, 'Retry-After': '60' }
    });
  }

  try {
    const { searchParams, pathname, href: selfUrl } = new URL(req.url);

    // Accept either ?url=fullArticleUrl or path /functions/v1/share-preview/<anything>
    const articleUrl = searchParams.get("url") || "";

    // Try to extract id from provided URL (expects last segment to be id)
    let idFromUrl = "";
    try {
      const u = new URL(articleUrl);
      const segments = u.pathname.split("/").filter(Boolean);
      idFromUrl = segments[segments.length - 1] || "";
    } catch (_) {
      // ignore
    }

    // Optional: allow passing id directly via ?id=
    const id = searchParams.get("id") || idFromUrl;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let article: any = null;

    if (id) {
      const { data, error } = await supabase
        .from("news")
        .select(
          `id, slug, title, subtitle, content, meta_description, published_at, updated_at,
           categories(name, slug),
           profiles(full_name),
           news_images(image_url, is_featured)`
        )
        .eq("id", id)
        .eq("is_published", true)
        .single();
      if (error) {
        console.error("share-preview: fetch by id error", error);
      } else {
        article = data;
      }
    }

    // Fallback: try by slug from path if no id found
    if (!article && pathname) {
      const parts = pathname.split("/").filter(Boolean);
      // pathname is like /functions/v1/share-preview/<maybe-category>/<maybe-slug>/<maybe-id>
      // We'll try the last two parts as slug if they look non-uuid
      const maybeSlug = parts[parts.length - 1];
      if (maybeSlug && maybeSlug.length > 0 && maybeSlug.length < 80) {
        const { data, error } = await supabase
          .from("news")
          .select(
            `id, slug, title, subtitle, content, meta_description, published_at, updated_at,
             categories(name, slug),
             profiles(full_name),
             news_images(image_url, is_featured)`
          )
          .eq("slug", maybeSlug)
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) article = data;
      }
    }

    const siteName = "ChicoSabeTudo";
    const originalUrl = articleUrl || "";

    // Build fields
    const title = article?.title ? `${article.title} | ${siteName}` : `${siteName}`;
    const description = article?.meta_description || stripHtml(article?.content || article?.subtitle || "");
    const author = article?.profiles?.full_name || "Redação";
    const category = article?.categories?.name || "Notícias";
    const publishedTime = article?.published_at ? new Date(article.published_at).toISOString() : new Date().toISOString();
    const updatedTime = article?.updated_at ? new Date(article.updated_at).toISOString() : publishedTime;

    let ogImage = "";
    if (article?.news_images?.length) {
      const featured = article.news_images.find((i: any) => i.is_featured) || article.news_images[0];
      ogImage = featured?.image_url || "";
    }
    // Ensure absolute public URL for Open Graph
    if (ogImage && !/^https?:\/\//.test(ogImage)) {
      const base = Deno.env.get("SUPABASE_URL") ?? "";
      ogImage = base ? `${base}/storage/v1/object/public/${ogImage}` : ogImage;
    }
    // Fallback image if still missing
    if (!ogImage) {
      ogImage = 'https://lovable.dev/opengraph-image-p98pqg.png';
    }

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${originalUrl}" />
  <meta name="robots" content="index, follow" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${escapeHtml(siteName)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <!-- Importante: usar a própria URL da função em og:url para evitar colisão com cache do Facebook na URL canônica -->
  <meta property="og:url" content="${selfUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />

  <!-- Article meta -->
  <meta property="article:author" content="${escapeHtml(author)}" />
  <meta property="article:section" content="${escapeHtml(category)}" />
  <meta property="article:published_time" content="${publishedTime}" />
  <meta property="article:modified_time" content="${updatedTime}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta name="twitter:url" content="${selfUrl}" />

  <!-- JSON-LD -->
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article?.title || siteName,
    description,
    datePublished: publishedTime,
    dateModified: updatedTime,
    image: ogImage ? [ogImage] : undefined,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Organization', name: siteName },
    mainEntityOfPage: originalUrl,
  })}</script>

  <!-- Redirect for users -->
  <meta http-equiv="refresh" content="0; url=${originalUrl}">
</head>
<body>
  <p>Redirecionando para <a href="${originalUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, max-age=60",
      },
    });
  } catch (e) {
    console.error("share-preview error", e);
    return new Response("Erro ao gerar preview", { status: 500, headers: corsHeaders });
  }
});
