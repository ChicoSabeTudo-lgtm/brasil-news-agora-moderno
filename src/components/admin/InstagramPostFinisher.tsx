import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteConfigurations } from '@/hooks/useSiteConfigurations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Send, Calendar, Download, Instagram } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VisualData {
  title: string;
  backgroundImage: string | null;
  textPosition: { x: number; y: number };
  textZoom: number;
  textSize: 'small' | 'medium' | 'large';
  textAlign: 'left' | 'center' | 'right';
  generatedImageUrl: string;
}

interface InstagramPostFinisherProps {
  visualData: VisualData;
  onBack: () => void;
  onComplete: () => void;
}

export default function InstagramPostFinisher({ visualData, onBack, onComplete }: InstagramPostFinisherProps) {
  const { user } = useAuth();
  const { configuration } = useSiteConfigurations();
  const { toast } = useToast();
  
  const [postData, setPostData] = useState({
    instagramCaption: '',
    scheduleInstagram: false,
    instagramDate: '',
    instagramTime: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const downloadImage = async () => {
    try {
      // Converter blob URL para blob para download
      const response = await fetch(visualData.generatedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `instagram-post-${Date.now()}.jpg`;
      link.href = url;
      link.click();
      
      // Limpar URL após download
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer download da imagem.",
        variant: "destructive",
      });
    }
  };

  const sendInstagramWebhook = async () => {
    if (!configuration?.webhook_url) {
      toast({
        title: "Erro",
        description: "URL do webhook não configurada. Configure nas configurações do site.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const webhookData = {
        type: 'instagram',
        timestamp: new Date().toISOString(),
        user_id: user?.id,
        content: {
          title: visualData.title
        },
        visual: {
          image_url: visualData.generatedImageUrl,
          text_position: visualData.textPosition,
          text_zoom: visualData.textZoom,
          text_size: visualData.textSize,
          text_align: visualData.textAlign
        },
        instagram: {
          caption: postData.instagramCaption,
          schedule: postData.scheduleInstagram ? {
            date: postData.instagramDate,
            time: postData.instagramTime
          } : null
        }
      };

      const response = await fetch(configuration.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: postData.scheduleInstagram 
            ? "Post do Instagram agendado com sucesso!" 
            : "Post do Instagram enviado com sucesso!",
        });
        
        onComplete();
      } else {
        throw new Error('Erro na resposta do webhook');
      }
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar post do Instagram. Verifique a configuração do webhook.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = postData.instagramCaption.trim() !== '';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Continuar Post
            </h1>
            <p className="text-muted-foreground mt-2">
              Segunda etapa: Adicione a legenda e finalize seu post do Instagram
            </p>
          </div>
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Editor
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Finalização */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="w-5 h-5" />
                  Finalização do Post
                </CardTitle>
                <CardDescription>
                  Configure a legenda e opções de publicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="caption">Legenda do Instagram *</Label>
                  <Textarea
                    id="caption"
                    placeholder="Digite a legenda para o Instagram..."
                    value={postData.instagramCaption}
                    onChange={(e) => setPostData(prev => ({ ...prev, instagramCaption: e.target.value }))}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Dica: Use hashtags e mencione outras contas para aumentar o alcance
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="schedule-instagram"
                        checked={postData.scheduleInstagram}
                        onCheckedChange={(checked) => setPostData(prev => ({ ...prev, scheduleInstagram: checked }))}
                      />
                      <Label htmlFor="schedule-instagram" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Agendar Post
                      </Label>
                    </div>
                  </div>

                  {postData.scheduleInstagram && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagram-date">Data</Label>
                        <Input
                          id="instagram-date"
                          type="date"
                          value={postData.instagramDate}
                          onChange={(e) => setPostData(prev => ({ ...prev, instagramDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram-time">Hora</Label>
                        <Input
                          id="instagram-time"
                          type="time"
                          value={postData.instagramTime}
                          onChange={(e) => setPostData(prev => ({ ...prev, instagramTime: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
                <CardDescription>
                  Baixe a imagem ou envie diretamente para o Instagram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={downloadImage}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={sendInstagramWebhook}
                    disabled={!isValid || isSubmitting}
                    className="flex-1"
                    size="default"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting 
                      ? 'Enviando...' 
                      : postData.scheduleInstagram 
                        ? 'Agendar Post' 
                        : 'Enviar Agora'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pré-visualização Final */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização Final</CardTitle>
                <CardDescription>
                  Veja como ficará seu post completo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Imagem */}
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={visualData.generatedImageUrl}
                      alt="Post Final"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Simulação da Interface do Instagram */}
                  <div className="border rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-sm">seu_perfil</p>
                        <p className="text-xs text-muted-foreground">Agora</p>
                      </div>
                    </div>
                    
                    {postData.instagramCaption && (
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-semibold">seu_perfil</span>{' '}
                          {postData.instagramCaption}
                        </p>
                      </div>
                    )}
                    
                    {postData.scheduleInstagram && postData.instagramDate && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        📅 Agendado para: {new Date(postData.instagramDate + 'T' + (postData.instagramTime || '12:00')).toLocaleDateString('pt-BR')} às {postData.instagramTime || '12:00'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}