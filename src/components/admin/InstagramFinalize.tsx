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

  // Format caption with line breaks, hashtags, and mentions
  const formatCaption = (text: string): string => {
    return text
      // Convert line breaks to <br> tags
      .replace(/\n/g, '<br>')
      // Make hashtags blue and bold
      .replace(/#(\w+)/g, '<span style="color: #1d4ed8; font-weight: 600;">#$1</span>')
      // Make mentions blue and bold
      .replace(/@(\w+)/g, '<span style="color: #1d4ed8; font-weight: 600;">@$1</span>')
      // Make URLs clickable (basic detection)
      .replace(/(https?:\/\/[^\s]+)/g, '<span style="color: #1d4ed8;">$1</span>');
  };

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
    console.log('🚀 [INSTAGRAM] Iniciando sendInstagramPost...');
    console.log('🔍 [INSTAGRAM] User:', user?.id);
    console.log('🔍 [INSTAGRAM] postData.canvasDataUrl exists:', !!postData.canvasDataUrl);
    console.log('🔍 [INSTAGRAM] siteConfig exists:', !!siteConfig);
    
    if (!user || !postData.canvasDataUrl) {
      console.error('❌ [INSTAGRAM] Dados incompletos - user:', !!user, 'canvasDataUrl:', !!postData.canvasDataUrl);
      toast.error('Dados incompletos para envio');
      return;
    }

    const socialWebhookUrl = siteConfig?.social_webhook_url;
    console.log('🔍 [INSTAGRAM] socialWebhookUrl:', socialWebhookUrl);
    
    if (!socialWebhookUrl) {
      console.error('❌ [INSTAGRAM] URL do webhook não configurada');
      toast.error('URL do webhook não configurada');
      return;
    }

    setIsSubmitting(true);
    console.log('🔄 [INSTAGRAM] setIsSubmitting(true) - Iniciando processo...');

    try {
      console.log('🚀 [INSTAGRAM] Entrando no bloco try...');
      
      // Convert canvas data URL to blob without using fetch (CSP issue)
      console.log('📊 [INSTAGRAM] Convertendo canvas para blob...');
      console.log('🔍 [INSTAGRAM] Canvas data URL length:', postData.canvasDataUrl.length);
      
      // Convert data URL to blob directly without fetch
      const dataUrl = postData.canvasDataUrl;
      const base64Data = dataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      console.log('✅ [INSTAGRAM] Canvas convertido para blob:', blob.size, 'bytes', 'type:', blob.type);

      // Upload to Supabase storage
      const fileName = `instagram-post-${Date.now()}.jpg`;
      console.log('📤 Fazendo upload para storage:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('social-posts')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('❌ Erro no upload para storage:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('✅ Upload realizado com sucesso:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('social-posts')
        .getPublicUrl(uploadData.path);

      const imageUrl = urlData.publicUrl;
      console.log('🔗 URL pública gerada:', imageUrl);

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

      console.log('📨 Enviando payload para webhook:', JSON.stringify(payload, null, 2));
      console.log('🔗 URL do webhook:', socialWebhookUrl);

      const webhookResponse = await fetch(socialWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📊 Resposta do webhook - Status:', webhookResponse.status);
      
      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('❌ Erro na resposta do webhook:', errorText);
        throw new Error(`HTTP error! status: ${webhookResponse.status} - ${errorText}`);
      }

      const responseData = await webhookResponse.text();
      console.log('✅ Resposta do webhook:', responseData);

      const action = isScheduled ? 'agendado' : 'enviado';
      toast.success(`Post ${action} com sucesso!`);
      onComplete();
      
    } catch (error) {
      console.error('❌ [INSTAGRAM] ERRO CAPTURADO:', error);
      console.error('❌ [INSTAGRAM] Error type:', typeof error);
      console.error('❌ [INSTAGRAM] Error message:', error?.message);
      console.error('❌ [INSTAGRAM] Error stack:', error?.stack);
      
      // Detailed error logging
      if (error instanceof Error) {
        console.error('❌ [INSTAGRAM] Instance of Error - Name:', error.name);
        console.error('❌ [INSTAGRAM] Instance of Error - Message:', error.message);
      }
      
      toast.error(`Erro ao enviar post: ${error?.message || 'Erro desconhecido'}. Tente novamente.`);
    } finally {
      console.log('🔄 [INSTAGRAM] setIsSubmitting(false) - Finalizando processo...');
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
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
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
          <div className="w-full max-w-md">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-center">Visualização Final</h3>
              <p className="text-sm text-muted-foreground text-center">Como ficará no Instagram</p>
            </div>
            
            {/* Modern Instagram Post Preview */}
            <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-xl">
              {/* Instagram Header */}
              <div className="flex items-center justify-between p-4 bg-background">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
                    <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">PC</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">portalchicosabetudo</p>
                    <p className="text-xs text-muted-foreground">Patrocinado</p>
                  </div>
                </div>
                <div className="text-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="12" cy="19" r="2"/>
                  </svg>
                </div>
              </div>
              
              {/* Image */}
              <div className="aspect-square bg-muted flex items-center justify-center">
                {postData.canvasDataUrl && (
                  <img 
                    src={postData.canvasDataUrl} 
                    alt="Instagram post"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              {/* Instagram Actions */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <path d="M8.59 13.51l6.83 3.98"/>
                      <path d="M15.41 6.51l-6.82 3.98"/>
                    </svg>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                
                <p className="text-sm font-semibold text-foreground">1.234 curtidas</p>
                
                {/* Caption */}
                {caption && (
                  <div className="space-y-2">
                    <div className="text-sm text-foreground leading-relaxed">
                      <span className="font-semibold">portalchicosabetudo</span>{' '}
                      <span 
                        dangerouslySetInnerHTML={{
                          __html: formatCaption(caption)
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {caption && (
                  <p className="text-xs text-muted-foreground">Ver todos os comentários</p>
                )}
                
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Há 2 minutos</p>
                
                {isScheduled && selectedDate && (
                  <div className="mt-3 p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      📅 Agendado para {format(selectedDate, 'dd/MM/yyyy')} às {selectedTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}