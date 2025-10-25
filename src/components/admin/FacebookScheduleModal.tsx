import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { useFacebookSchedule, FacebookSchedule } from '@/hooks/useFacebookSchedule';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Link, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FacebookScheduleModalProps {
  schedule?: FacebookSchedule | null;
  onClose: () => void;
}

export const FacebookScheduleModal = ({ schedule, onClose }: FacebookScheduleModalProps) => {
  const { createSchedule, updateSchedule, validateUrl, currentDate } = useFacebookSchedule();
  
  const [formData, setFormData] = useState({
    news_title: '',
    news_url: '',
    scheduled_time: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (schedule) {
      setFormData({
        news_title: schedule.news_title,
        news_url: schedule.news_url,
        scheduled_time: schedule.scheduled_time,
      });
    } else {
      // Set default time to next hour
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      const timeString = `${nextHour.getHours().toString().padStart(2, '0')}:${nextHour.getMinutes().toString().padStart(2, '0')}`;
      
      setFormData({
        news_title: '',
        news_url: '',
        scheduled_time: timeString,
      });
    }
  }, [schedule]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate title
    if (!formData.news_title.trim()) {
      newErrors.news_title = 'Título da notícia é obrigatório';
    } else if (formData.news_title.trim().length < 5) {
      newErrors.news_title = 'Título deve ter pelo menos 5 caracteres';
    }

    // Validate URL
    if (!formData.news_url.trim()) {
      newErrors.news_url = 'URL da notícia é obrigatória';
    } else if (!validateUrl(formData.news_url.trim())) {
      newErrors.news_url = 'URL inválida. Certifique-se de incluir http:// ou https://';
    }

    // Validate time
    if (!formData.scheduled_time) {
      newErrors.scheduled_time = 'Horário é obrigatório';
    } else {
      const [hours, minutes] = formData.scheduled_time.split(':').map(Number);
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        newErrors.scheduled_time = 'Horário inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduleData = {
        news_title: formData.news_title.trim(),
        news_url: formData.news_url.trim(),
        scheduled_time: formData.scheduled_time,
        scheduled_date: currentDate,
      };

      if (schedule) {
        updateSchedule(schedule.id, scheduleData);
      } else {
        createSchedule(scheduleData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving Facebook schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get current time suggestions
  const getTimeSuggestions = () => {
    const now = new Date();
    const suggestions = [];
    
    // Generate suggestions for the next 12 hours
    for (let i = 1; i <= 12; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      const timeString = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      suggestions.push(timeString);
    }
    
    return suggestions;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Date Display */}
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Data: {format(new Date(currentDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })} (Fuso: America/Fortaleza)
        </span>
      </div>

      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="news_title" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Título da Notícia *
        </Label>
        <Input
          id="news_title"
          type="text"
          placeholder="Digite o título da notícia que será postada..."
          value={formData.news_title}
          onChange={(e) => handleInputChange('news_title', e.target.value)}
          className={errors.news_title ? 'border-destructive' : ''}
        />
        {errors.news_title && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.news_title}
          </p>
        )}
      </div>

      {/* URL Field */}
      <div className="space-y-2">
        <Label htmlFor="news_url" className="flex items-center gap-2">
          <Link className="w-4 h-4" />
          URL da Notícia *
        </Label>
        <Input
          id="news_url"
          type="url"
          placeholder="https://exemplo.com/noticia"
          value={formData.news_url}
          onChange={(e) => handleInputChange('news_url', e.target.value)}
          className={errors.news_url ? 'border-destructive' : ''}
        />
        {errors.news_url && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.news_url}
          </p>
        )}
      </div>

      {/* Time Field */}
      <div className="space-y-2">
        <Label htmlFor="scheduled_time" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Horário de Postagem *
        </Label>
        <Input
          id="scheduled_time"
          type="time"
          value={formData.scheduled_time}
          onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
          className={errors.scheduled_time ? 'border-destructive' : ''}
        />
        {errors.scheduled_time && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.scheduled_time}
          </p>
        )}
        
        {/* Time Suggestions */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Sugestões de horário:</p>
          <div className="flex flex-wrap gap-2">
            {getTimeSuggestions().slice(0, 6).map((time) => (
              <Button
                key={time}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('scheduled_time', time)}
                className="text-xs"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> A pauta será automaticamente limpa ao virar o dia (00:00 no fuso America/Fortaleza).
          Certifique-se de que o horário está correto para o dia de hoje.
        </AlertDescription>
      </Alert>

      {/* Form Actions */}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : schedule ? 'Atualizar Pauta' : 'Criar Pauta'}
        </Button>
      </DialogFooter>
    </form>
  );
};
