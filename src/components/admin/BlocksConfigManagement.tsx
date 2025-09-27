import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBlocksConfig } from '@/hooks/useBlocksConfig';
import { Monitor, Vote } from 'lucide-react';

export const BlocksConfigManagement = () => {
  const { config, isLoading, updateBlocksConfig } = useBlocksConfig();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center text-muted-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  const handleToggleLiveStream = (enabled: boolean) => {
    updateBlocksConfig.mutate({ live_stream_block_enabled: enabled });
  };

  const handleTogglePoll = (enabled: boolean) => {
    updateBlocksConfig.mutate({ poll_block_enabled: enabled });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Configuração de Blocos</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Bloco de Transmissão ao Vivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="live-stream-toggle">
                  Exibir bloco de transmissão
                </Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, o bloco de transmissão ao vivo será exibido no site.
                </p>
              </div>
              <Switch
                id="live-stream-toggle"
                checked={config.live_stream_block_enabled}
                onCheckedChange={handleToggleLiveStream}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="w-5 h-5" />
              Bloco de Enquete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="poll-toggle">
                  Exibir bloco de enquete
                </Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, o bloco de enquete será exibido no site.
                </p>
              </div>
              <Switch
                id="poll-toggle"
                checked={config.poll_block_enabled}
                onCheckedChange={handleTogglePoll}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Prioridade de Exibição:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Se ambos os blocos estiverem ativados, apenas o <strong>bloco de transmissão ao vivo</strong> será exibido</li>
              <li>Se apenas o bloco de enquete estiver ativado, ele será exibido</li>
              <li>Se nenhum bloco estiver ativado, nada será exibido no espaço lateral</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Visibilidade no Código:</h4>
            <p className="text-sm text-muted-foreground">
              Quando um bloco está desativado, ele <strong>não é renderizado no HTML</strong>, 
              ou seja, desaparece completamente do código-fonte da página.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
