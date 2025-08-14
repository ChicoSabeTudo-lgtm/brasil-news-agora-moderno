import { useNews } from '@/hooks/useNews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const LatestNewsWidget = () => {
  const { news, loading } = useNews();

  const recentNews = news?.slice(0, 5) || [];

  if (loading) {
    return (
      <Card className="admin-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Últimas Notícias Publicadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="admin-slide-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Últimas Notícias Publicadas
        </CardTitle>
        <CardDescription>
          {recentNews.length} artigos recentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentNews.map((article) => (
            <div
              key={article.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(article.published_at || article.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                  {article.views && (
                    <>
                      <span>•</span>
                      <Eye className="w-3 h-3" />
                      {article.views}
                    </>
                  )}
                </div>
              </div>
              <Badge 
                variant={article.is_published ? 'default' : 'secondary'}
                className="text-xs"
              >
                {article.is_published ? 'Publicado' : 'Rascunho'}
              </Badge>
            </div>
          ))}
          {recentNews.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma notícia encontrada
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};