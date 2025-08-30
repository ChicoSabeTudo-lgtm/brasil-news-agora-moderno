import { ExternalLink, Instagram, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface InstagramFallbackProps {
  embedUrl: string;
  className?: string;
  reason?: 'timeout' | 'redirect' | 'blocked' | 'privacy';
}

export const InstagramFallback = ({ 
  embedUrl, 
  className = '',
  reason = 'privacy'
}: InstagramFallbackProps) => {
  const messages = {
    timeout: {
      title: 'Conteúdo não carregou',
      description: 'O embed do Instagram não foi carregado a tempo. Isso pode ser devido a configurações de privacidade ou bloqueadores.',
    },
    redirect: {
      title: 'Conteúdo requer redirecionamento',
      description: 'Este conteúdo do Instagram está configurado para abrir diretamente na plataforma.',
    },
    blocked: {
      title: 'Conteúdo bloqueado',
      description: 'O conteúdo pode estar sendo bloqueado por extensões do navegador ou configurações de segurança.',
    },
    privacy: {
      title: 'Configurações de privacidade',
      description: 'Este conteúdo não pode ser reproduzido aqui devido às configurações de privacidade do Instagram.',
    }
  };

  const message = messages[reason];

  return (
    <Card className={`instagram-fallback max-w-md mx-auto ${className}`}>
      <CardContent className="p-8 text-center space-y-6">
        <div className="flex items-center justify-center space-x-3 text-muted-foreground">
          <Instagram className="h-8 w-8 text-pink-500" />
          <AlertCircle className="h-5 w-5" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {message.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message.description}
          </p>
        </div>

        <div className="pt-2">
          <Button 
            asChild 
            variant="default"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
          >
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2"
            >
              <Instagram className="h-4 w-4" />
              <span>Ver no Instagram</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            <strong>Dica:</strong> Para melhor experiência, certifique-se de que cookies de terceiros estão habilitados e extensões de bloqueio estão desativadas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};