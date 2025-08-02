import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X, Save } from 'lucide-react';
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

export const DailyBriefsForm = ({ open, onClose, onSuccess, brief }: DailyBriefsFormProps) => {
  const { createBrief, updateBrief } = useDailyBriefs();
  const { categories } = useCategories();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [briefTime, setBriefTime] = useState(format(new Date(), 'HH:mm'));
  const [status, setStatus] = useState<'rascunho' | 'em_andamento' | 'finalizada'>('rascunho');
  const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>('media');
  const [categoryId, setCategoryId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Reset form when modal opens/closes or brief changes
  useEffect(() => {
    if (open && brief) {
      // Editing mode - populate with brief data
      setTitle(brief.title || '');
      setDescription(brief.description || '');
      setBriefTime(brief.brief_time || format(new Date(), 'HH:mm'));
      setStatus(brief.status || 'rascunho');
      setPriority(brief.priority || 'media');
      setCategoryId(brief.category_id || '');
      
      // Parse date correctly
      if (brief.brief_date) {
        const dateParts = brief.brief_date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        const day = parseInt(dateParts[2]);
        setSelectedDate(new Date(year, month, day));
      }
    } else if (open && !brief) {
      // New brief mode - reset to defaults
      setTitle('');
      setDescription('');
      setBriefTime(format(new Date(), 'HH:mm'));
      setStatus('rascunho');
      setPriority('media');
      setCategoryId('');
      setSelectedDate(new Date());
      setSelectedFile(null);
    }
  }, [open, brief]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 2MB.",
          variant: "destructive",
        });
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Erro",
          description: "Formato de arquivo não suportado. Use JPG, PNG, GIF ou SVG.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `daily-briefs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      let imageUrl = brief?.image_url || null;
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const briefData = {
        title: title.trim(),
        description: description.trim() || null,
        brief_date: format(selectedDate, 'yyyy-MM-dd'),
        brief_time: briefTime,
        status,
        priority,
        category_id: categoryId || null,
        image_url: imageUrl
      };

      if (brief) {
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
        description: error.message || "Erro ao salvar pauta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            {brief ? 'Editar Pauta' : 'Nova Pauta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da pauta"
                required
                className="mt-1"
              />
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes da pauta"
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Data */}
            <div>
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Hora */}
            <div>
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={briefTime}
                onChange={(e) => setBriefTime(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div>
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="md:col-span-2">
              <Label>Categoria</Label>
              <Select value={categoryId || 'none'} onValueChange={(value) => setCategoryId(value === 'none' ? '' : value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma categoria</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload de Imagem */}
            <div className="md:col-span-2">
              <Label>Imagem (opcional)</Label>
              <div className="mt-2">
                {brief?.image_url && !selectedFile && (
                  <div className="flex items-center gap-2 p-3 border rounded-lg mb-2">
                    <img 
                      src={brief.image_url}
                      alt="Imagem atual"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Imagem atual</p>
                    </div>
                  </div>
                )}
                
                {selectedFile ? (
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <img 
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-muted-foreground">
                            Clique para selecionar ou arraste uma imagem
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            SVG, PNG, JPG, GIF até 2MB
                          </span>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/svg+xml,image/png,image/jpeg,image/gif"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {brief ? 'Atualizando...' : 'Criando...'}
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {brief ? 'Atualizar' : 'Criar Pauta'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};