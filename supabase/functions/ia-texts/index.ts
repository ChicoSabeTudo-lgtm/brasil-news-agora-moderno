import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const ALLOWED_ORIGINS = [
  'https://chicosabetudo.sigametech.com.br',
  'http://localhost:5173',
  'http://localhost:8080',
];

const corsHeaders = (origin: string | null) => {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

const MIN_WORDS = 200;

const buildPrompt = (baseText: string) => `Analise o texto de notícia fornecido abaixo e, com base nele, crie um conteúdo completo para redes sociais, seguindo estritamente a estrutura e as diretrizes:

PARTE 1: SUGESTÕES DE TÍTULOS
Crie 3 seções de títulos, cada uma com 5 sugestões. Os títulos devem ser criativos, otimizados para cliques e refletir o conteúdo da notícia.
- Seção 1: Títulos Diretos e Informativos
- Seção 2: Títulos em Formato de Pergunta (Curiosidade)
- Seção 3: Títulos de Impacto (Para Redes Sociais)

PARTE 2: SUGESTÕES DE POSTS PARA O FACEBOOK
Crie 3 opções de posts, cada uma com tom diferente (informativo, analítico, impacto). Todos os posts devem:
- estar em português do Brasil
- utilizar linguagem humanizada em formato de narrativa
- incluir 1 ou 2 emojis relevantes (exemplos: 🚔 🤝 🏥 ✊)
- terminar com a CTA: "👉 Acesse chicosabetudo.com.br 📲" (pode adaptar texto antes da seta)
- conter hashtags, incluindo #chicosabetudo
- ter no mínimo ${MIN_WORDS} palavras

Respeite os tempos verbais de acordo com o ocorrido no texto original. Estruture a resposta em JSON válido com o formato:
{
  "titles_direct": string[];
  "titles_questions": string[];
  "titles_impact": string[];
  "posts": [
    { "tone": "informativo" | "analitico" | "impacto", "content": string }
  ]
}

TEXTO BASE:
"""
${baseText}
"""`;

async function callOpenAi(prompt: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada nas variáveis de ambiente.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Você é um especialista em social media que gera conteúdos estruturados para redes sociais brasileiras.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  const completion = json.choices?.[0]?.message?.content as string | undefined;

  if (!completion) {
    throw new Error('OpenAI retornou resposta vazia.');
  }

  return completion;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt, text } = await req.json();
    const baseText = typeof text === 'string' && text.trim().length > 0 ? text : prompt;

    if (!baseText || typeof baseText !== 'string' || baseText.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Texto base inválido.' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (baseText.split(/\s+/).length < 50) {
      return new Response(JSON.stringify({ error: 'Forneça um texto mais completo para a análise.' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const completion = await callOpenAi(buildPrompt(baseText));

    return new Response(JSON.stringify({ completion }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função ia-texts:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno.' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});

