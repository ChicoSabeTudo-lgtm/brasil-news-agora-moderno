import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Send, ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PostData } from './InstagramPostGenerator';
import { useAuth } from '@/hooks/useAuth';
import { useSiteConfigurations } from '@/hooks/useSiteConfigurations';
import { supabase } from '@/integrations/supabase/client';

interface InstagramFinalizeProps {
  postData: PostData;
  onBack: () => void;
  onComplete: () => void;
}

export default function InstagramFinalize({ postData, onBack, onComplete }: InstagramFinalizeProps) {
  const { user } = useAuth();
  const { configuration: siteConfig } = useSiteConfigurations();
  
  const [caption, setCaption] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const downloadImage = () => {
    if (!postData.canvasDataUrl) {
      toast.error('Erro ao baixar imagem');
      return;
    }

    const link = document.createElement('a');
    link.download = `instagram-post-${Date.now()}.jpg`;
    link.href = postData.canvasDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Imagem baixada com sucesso!');
  };

  const sendInstagramPost = async () => {
    if (!user || !postData.canvasDataUrl) {
      toast.error('Dados incompletos para envio');
      return;
    }

    const socialWebhookUrl = siteConfig?.social_webhook_url;
    if (!socialWebhookUrl) {
      toast.error('URL do webhook não configurada');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert canvas data URL to blob
      const response = await fetch(postData.canvasDataUrl);
      const blob = await response.blob();

      // Upload to Supabase storage
      const fileName = `instagram-post-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('news-media')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('news-media')
        .getPublicUrl(uploadData.path);

      const imageUrl = urlData.publicUrl;

      // Prepare timestamp
      let timestamp = new Date().toISOString();
      if (isScheduled && selectedDate) {
        const [hours, minutes] = selectedTime.split(':');
        const scheduledDate = new Date(selectedDate);
        scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        timestamp = scheduledDate.toISOString();
      }

      // Prepare payload exactly as specified
      const payload = {
        type: "instagram",
        timestamp,
        user_id: user.id,
        platforms: ["instagram"],
        content: {
          title: postData.text.title
        },
        visual: {
          image_url: imageUrl,
          text_size: postData.text.fontSize,
          text_align: postData.text.alignment,
          image_zoom: Math.round(postData.image.zoom * 100), // as percentage
          image_position: {
            x: postData.image.positionX,
            y: postData.image.positionY
          }
        },
        instagram: {
          caption,
          schedule: isScheduled && selectedDate ? {
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime
          } : undefined
        }
      };

      const webhookResponse = await fetch(socialWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!webhookResponse.ok) {
        throw new Error(`HTTP error! status: ${webhookResponse.status}`);
      }

      const action = isScheduled ? 'agendado' : 'enviado';
      toast.success(`Post ${action} com sucesso!`);
      onComplete();
      
    } catch (error) {
      console.error('Erro ao enviar post:', error);
      toast.error('Erro ao enviar post. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = caption.trim() && (!isScheduled || (selectedDate && selectedTime));

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Editor
        </Button>
        
        <h1 className="text-3xl font-bold">Finalizar Post do Instagram</h1>
        <p className="text-muted-foreground">Passo 2: Adicionar legenda e publicar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Legenda do Instagram</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="caption">Legenda/Descrição</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva a legenda do seu Instagram..."
                className="min-h-[120px] mt-2"
                maxLength={2200}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {caption.length}/2200 caracteres
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opções de Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="schedule"
                  checked={isScheduled}
                  onCheckedChange={setIsScheduled}
                />
                <Label htmlFor="schedule">Agendar Post</Label>
              </div>

              {isScheduled && (
                <div className="space-y-4">
                  <div>
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-2"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Selecionar data'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time">Horário</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Clock className="h-4 w-4" />
                      <Input
                        id="time"
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              onClick={downloadImage}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar Imagem
            </Button>

            <Button 
              onClick={sendInstagramPost}
              disabled={!isValid || isSubmitting}
              className="w-full"
              size="lg"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Enviando...' : isScheduled ? 'Agendar Post' : 'Enviar Agora'}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <Card className="w-fit">
            <CardHeader>
              <CardTitle>Visualização Final</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gradient-to-b from-purple-500 via-pink-500 to-orange-500 p-4">
                <div className="bg-white rounded-lg overflow-hidden">
                  {/* Instagram Header Mockup */}
                  <div className="flex items-center p-3 border-b">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <span className="ml-3 font-semibold text-sm">your_account</span>
                  </div>
                  
                  {/* Image */}
                  <div className="aspect-square">
                    {postData.canvasDataUrl && (
                      <img 
                        src={postData.canvasDataUrl} 
                        alt="Instagram post"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Caption Preview */}
                  <div className="p-3">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex space-x-3">
                        <div className="w-6 h-6 border-2 border-black rounded-full"></div>
                        <div className="w-6 h-6 border-2 border-black rounded-full"></div>
                        <div className="w-6 h-6 border-2 border-black rounded-full"></div>
                      </div>
                    </div>
                    
                    {caption && (
                      <p className="text-sm">
                        <span className="font-semibold">your_account</span>{' '}
                        {caption.length > 100 ? caption.substring(0, 100) + '...' : caption}
                      </p>
                    )}
                    
                    {isScheduled && selectedDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        📅 Agendado para {format(selectedDate, 'MMM d')} às {selectedTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}