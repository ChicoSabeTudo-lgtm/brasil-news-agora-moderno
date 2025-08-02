import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X, Save, FileText, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useDailyBriefs } from '@/hooks/useDailyBriefs';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DailyBriefsFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  brief?: any;
}

interface FormData {
  title: string;
  description: string;
  briefTime: string;
  briefDate: Date;
  status: 'rascunho' | 'em_andamento' | 'finalizada';
  priority: 'baixa' | 'media' | 'alta';
  categoryId: string;
  imageFile: File | null;
  existingImageUrl: string | null;
}

const DEFAULT_FORM_DATA: FormData = {
  title: '',
  description: '',
  briefTime: format(new Date(), 'HH:mm'),
  briefDate: new Date(),
  status: 'rascunho',
  priority: 'media',
  categoryId: '',
  imageFile: null,
  existingImageUrl: null,
};

const STATUS_OPTIONS = [
  { value: 'rascunho', label: 'Rascunho', icon: FileText },
  { value: 'em_andamento', label: 'Em Andamento', icon: Clock },
  { value: 'finalizada', label: 'Finalizada', icon: AlertCircle },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'baixa', label: 'Baixa', color: 'bg-green-500' },
  { value: 'media', label: 'Média', color: 'bg-yellow-500' },
  { value: 'alta', label: 'Alta', color: 'bg-red-500' },
] as const;

export const DailyBriefsForm = ({ open, onClose, onSuccess, brief }: DailyBriefsFormProps) => {
  const { createBrief, updateBrief } = useDailyBriefs();
  const { categories } = useCategories();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset and populate form when modal opens/closes or brief changes
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { open, brief });
    
    if (!open) {
      // Reset form when closing
      setFormData(DEFAULT_FORM_DATA);
      setErrors({});
      return;
    }

    if (brief) {
      // Editing mode - populate with brief data
      console.log('📝 Populando formulário com dados da pauta:', brief);
      console.log('📝 Category ID recebido:', brief.category_id);
      
      const briefDate = brief.brief_date 
        ? new Date(brief.brief_date + 'T00:00:00')
        : new Date();

      const newFormData = {
        title: brief.title || '',
        description: brief.description || '',
        briefTime: brief.brief_time || format(new Date(), 'HH:mm'),
        briefDate,
        status: brief.status || 'rascunho',
        priority: brief.priority || 'media',
        categoryId: brief.category_id || '',
        imageFile: null,
        existingImageUrl: brief.image_url || null,
      };
      
      console.log('📝 Dados do formulário sendo definidos:', newFormData);
      setFormData(newFormData);
    } else {
      // New brief mode - reset to defaults
      setFormData(DEFAULT_FORM_DATA);
    }
    
    setErrors({});
  }, [open, brief]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }

    if (!formData.briefDate) {
      newErrors.briefDate = 'A data é obrigatória';
    }

    if (!formData.briefTime) {
      newErrors.briefTime = 'A hora é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Formato de arquivo não suportado. Use JPG, PNG, GIF ou SVG.",
        variant: "destructive",
      });
      return;
    }
    
    updateFormData('imageFile', file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `daily-briefs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('news-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      let imageUrl = formData.existingImageUrl;
      
      if (formData.imageFile) {
        imageUrl = await uploadImage(formData.imageFile);
      }

      const briefData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        brief_date: format(formData.briefDate, 'yyyy-MM-dd'),
        brief_time: formData.briefTime,
        status: formData.status,
        priority: formData.priority,
        category_id: formData.categoryId || null,
        image_url: imageUrl
      };

      if (brief?.id) {
        await updateBrief(brief.id, briefData);
        toast({
          title: "Sucesso",
          description: "Pauta atualizada com sucesso!",
        });
      } else {
        await createBrief(briefData);
        toast({
          title: "Sucesso",
          description: "Pauta criada com sucesso!",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar pauta:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar pauta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeSelectedFile = () => {
    updateFormData('imageFile', null);
    // Clear file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getPriorityColor = (priority: string) => {
    const option = PRIORITY_OPTIONS.find(p => p.value === priority);
    return option?.color || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Save className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {brief ? 'Editar Pauta' : 'Nova Pauta Diária'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {brief ? 'Atualize os dados da pauta existente' : 'Crie uma nova pauta para o time'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título da Pauta *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Digite um título claro e objetivo"
              className={cn(errors.title && "border-red-500")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Descreva os detalhes, objetivos e recursos necessários para esta pauta"
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data da Pauta *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.briefDate && "text-muted-foreground",
                      errors.briefDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.briefDate ? (
                      format(formData.briefDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      "Selecione a data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.briefDate}
                    onSelect={(date) => date && updateFormData('briefDate', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.briefDate && (
                <p className="text-sm text-red-500">{errors.briefDate}</p>
              )}
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={formData.briefTime}
                onChange={(e) => updateFormData('briefTime', e.target.value)}
                className={cn(errors.briefTime && "border-red-500")}
              />
              {errors.briefTime && (
                <p className="text-sm text-red-500">{errors.briefTime}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => updateFormData('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: any) => updateFormData('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(({ value, label, color }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", color)} />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Categoria</Label>
            <Select 
              value={formData.categoryId || 'none'} 
              onValueChange={(value) => {
                console.log('🔄 Categoria selecionada:', value);
                updateFormData('categoryId', value === 'none' ? '' : value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">Nenhuma categoria</span>
                </SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload de Imagem */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Imagem da Pauta</Label>
            
            {/* Imagem Atual */}
            {formData.existingImageUrl && !formData.imageFile && (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                <img 
                  src={formData.existingImageUrl}
                  alt="Imagem atual"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Imagem atual</p>
                  <p className="text-xs text-muted-foreground">Clique para alterar a imagem</p>
                </div>
              </div>
            )}
            
            {/* Nova Imagem Selecionada */}
            {formData.imageFile ? (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-primary/5">
                <img 
                  src={URL.createObjectURL(formData.imageFile)}
                  alt="Nova imagem"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{formData.imageFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeSelectedFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              /* Upload Area */
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <div className="space-y-2">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:text-primary/80">
                      Clique para selecionar uma imagem
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF ou SVG até 2MB
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/png,image/jpeg,image/gif,image/svg+xml"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="min-w-[140px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {brief ? 'Atualizando...' : 'Criando...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {brief ? 'Atualizar Pauta' : 'Criar Pauta'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};