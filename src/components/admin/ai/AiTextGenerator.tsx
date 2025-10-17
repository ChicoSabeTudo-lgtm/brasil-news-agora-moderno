import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Copy, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type GenerationStatus = 'idle' | 'loading' | 'error' | 'success';

type AiSection = 'facebook' | 'instagram' | 'news';

interface GeneratedContent {
  titlesDirect: string[];
  titlesQuestions: string[];
  titlesImpact: string[];
  posts: {
    tone: 'informativo' | 'analitico' | 'impacto';
    content: string;
  }[];
}

const TONE_LABELS: Record<GeneratedContent['posts'][number]['tone'], string> = {
  informativo: 'Tom Informativo',
  analitico: 'Tom Analítico',
  impacto: 'Tom de Impacto',
};

const MIN_WORDS = 200;

const buildPrompt = (baseText: string) => `A partir do conteúdo abaixo, gere resumos e títulos seguindo as diretrizes específicas:

PARTE 1: SUGESTÕES DE TÍTULOS
Crie 3 seções de títulos, cada uma com 5 sugestões. Os títulos devem ser criativos, otimizados para cliques e refletir o conteúdo da notícia.
- Seção 1: Títulos Diretos e Informativos
- Seção 2: Títulos em Formato de Pergunta (Curiosidade)
- Seção 3: Títulos de Impacto (Para Redes Sociais)

PARTE 2: GERAR 3 RESUMOS DIFERENTES DO MESMO FATO

Regras gerais (aplicar às 3 opções):
- Formato: narrativa contínua (sem bullet points)
- Mínimo de 200 palavras cada
- Tom humano: fluido, natural, sem jargões de IA; evitar clichês e "robôzices"
- Emojis: usar 2 a 5 emojis relevantes (🚔 🤝 🏥 ✊ 🎉 🔥 ⚡ 💪 👏 📢) coerentes com o contexto, dentro do corpo do texto
- CTA final (linha própria): "👉 Leia mais em chicosabetudo.com.br 📲"
- Hashtags (linha final): entre 6 e 12 hashtags relevantes ao tema (sem espaços), incluindo #chicosabetudo por último
- Estilo Facebook-ready: texto direto para feed; sem cabeçalhos técnicos, sem rótulos desnecessários, sem instruções internas
- Atenção ao tempo verbal: se evento encerrado → usar passado (ex.: "autoridades confirmaram", "equipe venceu")

Tons exigidos (gerar 3 opções):

Opção 1 — Foco na Notícia (Informativo e Direto)
Objetivo: apresentar o fato com clareza e agilidade; destaque o que aconteceu, onde, quem, quando e qual o estado atual.
Evite adjetivação excessiva; priorize dados e confirmações oficiais.

Opção 2 — Foco na Análise e Bastidores (Analítico/Reflexivo)
Objetivo: explorar contexto, causas, implicações e próximos passos; mencione histórico e cenários possíveis.
Traga interpretação responsável (sem teorias infundadas), conectando pontos do texto base.

Opção 3 — Foco no Drama e Repercussão (Impacto/Entretenimento)
Objetivo: linguagem mais emocional e envolvente, mantendo fidedignidade; valorize efeito humano e reação do público.
Sem sensacionalismo barato; use ritmo narrativo para prender atenção.

Estruture a resposta em JSON válido com o formato:
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

const parseCompletion = (raw: string): GeneratedContent => {
  const sanitized = raw
    .replace(/```json/g, '```')
    .replace(/```/g, '')
    .trim();

  const parsed = JSON.parse(sanitized);

  if (!parsed.titles_direct || !parsed.titles_questions || !parsed.titles_impact || !parsed.posts) {
    throw new Error('Resposta inesperada da IA.');
  }

  return {
    titlesDirect: parsed.titles_direct,
    titlesQuestions: parsed.titles_questions,
    titlesImpact: parsed.titles_impact,
    posts: parsed.posts,
  };
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://spgusjrjrhfychhdwixn.supabase.co';
const PROJECT_REF = SUPABASE_URL.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? '';
const FUNCTIONS_URL = PROJECT_REF ? `https://${PROJECT_REF}.functions.supabase.co` : '';

const callIaFunction = async (prompt: string) => {
  if (!FUNCTIONS_URL) {
    throw new Error('URL das funções do Supabase não configurada.');
  }

  // Obter token de autenticação do localStorage
  const authData = localStorage.getItem('sb-spgusjrjrhfychhdwixn-auth-token');
  let accessToken = '';
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      accessToken = parsed?.access_token || '';
    } catch (e) {
      console.error('Erro ao parsear token:', e);
    }
  }

  const response = await fetch(`${FUNCTIONS_URL}/ia-texts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.error ?? 'Falha ao gerar conteúdo.';
    throw new Error(errorMessage);
  }

  if (!data?.completion) {
    throw new Error('Resposta inesperada da função de IA.');
  }

  return data.completion as string;
};

const CopyButton = ({ text }: { text: string }) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Conteúdo copiado', description: 'O texto foi copiado para a área de transferência.' });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="ml-auto flex items-center gap-2">
      <Copy className="h-4 w-4" />
      Copiar
    </Button>
  );
};

const TitleCopyButton = ({ text }: { text: string }) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Título copiado', description: 'O título foi copiado para a área de transferência.' });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="ml-auto h-8 w-8 p-0">
      <Copy className="h-3 w-3" />
    </Button>
  );
};

const renderTitles = (title: string, data: string[]) => {
  if (!data?.length) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <CopyButton text={data.join('\n')} />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {data.map((item, index) => (
            <li key={index} className="rounded-md border border-muted bg-muted/40 p-3 leading-relaxed flex items-center justify-between gap-2">
              <span className="flex-1">{item}</span>
              <TitleCopyButton text={item} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const GeneratedSection = ({ content }: { content: GeneratedContent | null }) => {
  if (!content) {
    return (
      <div className="rounded-lg border border-dashed border-muted p-6 text-center text-muted-foreground">
        Os resultados gerados serão exibidos aqui.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {renderTitles('Títulos Diretos e Informativos', content.titlesDirect)}
        {renderTitles('Títulos em Formato de Pergunta', content.titlesQuestions)}
        {renderTitles('Títulos de Impacto', content.titlesImpact)}
      </div>

      <Card>
        <CardHeader>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg">Resumos Gerados para Facebook</CardTitle>
            <CardDescription>
              3 resumos narrativos com 200+ palavras, tons variados, emojis, CTA e hashtags prontos para postar.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {content.posts.map((post, index) => (
              <div key={index} className="rounded-lg border border-muted bg-background p-4 shadow-sm">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AiTextGenerator = () => {
  const [activeSection, setActiveSection] = useState<AiSection>('facebook');
  const [newsText, setNewsText] = useState('');
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const { toast } = useToast();

  const canGenerate = newsText.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({
        title: 'Informe o texto base',
        description: 'Cole um texto de notícia para gerar as sugestões.',
        variant: 'destructive',
      });
      return;
    }

    if (!FUNCTIONS_URL) {
      setErrorMessage('URL das funções do Supabase não configurada.');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');

      const prompt = buildPrompt(newsText);
      const completion = await callIaFunction(prompt);
      const parsed = parseCompletion(completion);
      setResult(parsed);
      setStatus('success');
    } catch (error: any) {
      console.error('Erro ao gerar textos de IA:', error);
      setStatus('error');
      setErrorMessage(error?.message || 'Erro inesperado ao gerar conteúdo.');
    }
  };

  const renderSectionContent = () => {
    if (activeSection !== 'facebook') {
      return (
        <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-muted text-muted-foreground">
          <div className="space-y-2 text-center">
            <Badge variant="outline">Em breve</Badge>
            <p className="text-sm">Esta aba será disponibilizada em uma próxima atualização.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Gerar resumo do texto</CardTitle>
            <CardDescription>
              Cole abaixo o texto da notícia que servirá como base. O sistema retornará títulos e resumos humanizados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!FUNCTIONS_URL && (
              <div className="flex items-start gap-3 rounded-md border border-amber-300/70 bg-amber-50 p-4 text-amber-900">
                <AlertCircle className="mt-1 h-4 w-4" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Funções do Supabase não configuradas</p>
                  <p>Configure a URL das funções do Supabase nas configurações do site para habilitar a geração automática.</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="news-text">Texto base da notícia</Label>
              <Textarea
                id="news-text"
                value={newsText}
                onChange={(e) => setNewsText(e.target.value)}
                placeholder="Cole aqui o texto completo da notícia..."
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Dica: forneça o texto completo ou um resumo detalhado para obter resultados mais precisos.
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || status === 'loading'}
              className="flex items-center gap-2"
            >
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {status === 'loading' ? 'Gerando conteúdo...' : 'Gerar conteúdo'}
            </Button>

            {status === 'error' && (
              <div className="rounded-md border border-destructive/60 bg-destructive/10 p-4 text-sm text-destructive">
                {errorMessage}
              </div>
            )}
          </CardContent>
        </Card>

        <ScrollArea className="h-[600px] rounded-lg border">
          <div className="p-6">
            <GeneratedSection content={result} />
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Textos de IA</h2>
        <p className="text-sm text-muted-foreground">
          Gere sugestões de títulos e resumos a partir de uma matéria, utilizando o motor de IA configurado nas configurações do site.
        </p>
      </div>

      <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as AiSection)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="news">Notícias</TabsTrigger>
        </TabsList>

        <TabsContent value="facebook" className="mt-6">
          {renderSectionContent()}
        </TabsContent>

        <TabsContent value="instagram" className="mt-6">
          {renderSectionContent()}
        </TabsContent>

        <TabsContent value="news" className="mt-6">
          {renderSectionContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiTextGenerator;

