
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SchedulingTest = () => {
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testScheduling = async () => {
    setTesting(true);
    try {
      console.log('Testing pg_cron function...');
      
      // Test if pg_cron is available
      const { data, error } = await supabase.rpc('schedule_post_publish', {
        p_post_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        p_when: new Date(Date.now() + 60000).toISOString() // 1 minute from now
      });

      console.log('Test result:', { data, error });

      if (error) {
        throw error;
      }

      toast({
        title: "Teste realizado",
        description: "Função de agendamento testada. Verifique o console.",
      });
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Erro no teste",
        description: `Erro: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Teste de Agendamento</h3>
      <Button 
        onClick={testScheduling} 
        disabled={testing}
        variant="outline"
      >
        {testing ? 'Testando...' : 'Testar Função de Agendamento'}
      </Button>
    </div>
  );
};
