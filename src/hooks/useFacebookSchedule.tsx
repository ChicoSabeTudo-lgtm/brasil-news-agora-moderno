import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FacebookSchedule {
  id: string;
  news_title: string;
  news_url: string;
  scheduled_date: string;
  scheduled_time: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}

export const useFacebookSchedule = () => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState<string>('');

  // Get current date in Fortaleza timezone
  const getFortalezaDate = () => {
    const now = new Date();
    const fortalezaDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Fortaleza"}));
    return fortalezaDate.toISOString().split('T')[0];
  };

  // Initialize current date and check for day change
  useEffect(() => {
    const fortalezaDate = getFortalezaDate();
    setCurrentDate(fortalezaDate);

    // Check if we need to clean old entries
    const checkAndClean = async () => {
      try {
        await supabase.rpc('clean_old_facebook_schedule' as any);
      } catch (error) {
        console.error('Error cleaning old Facebook schedule:', error);
      }
    };

    checkAndClean();

    // Set up interval to check for day change every minute
    const interval = setInterval(() => {
      const newDate = getFortalezaDate();
      if (newDate !== currentDate) {
        setCurrentDate(newDate);
        // Invalidate queries when day changes
        queryClient.invalidateQueries({ queryKey: ['facebook_schedule'] });
        checkAndClean();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentDate, queryClient]);

  // Query to fetch today's Facebook schedule
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['facebook_schedule', currentDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facebook_daily_schedule' as any)
        .select('*')
        .eq('scheduled_date', currentDate)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return data as FacebookSchedule[];
    },
    enabled: !!currentDate,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (scheduleData: Omit<FacebookSchedule, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('facebook_daily_schedule' as any)
        .insert([{
          ...scheduleData,
          scheduled_date: currentDate,
          created_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facebook_schedule'] });
      toast.success('Pauta Facebook adicionada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar pauta Facebook: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FacebookSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('facebook_daily_schedule' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facebook_schedule'] });
      toast.success('Pauta Facebook atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar pauta Facebook: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('facebook_daily_schedule' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facebook_schedule'] });
      toast.success('Pauta Facebook removida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover pauta Facebook: ' + error.message);
    },
  });

  // Helper functions
  const createSchedule = (scheduleData: Omit<FacebookSchedule, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    createMutation.mutate(scheduleData);
  };

  const updateSchedule = (id: string, updates: Partial<FacebookSchedule>) => {
    updateMutation.mutate({ id, ...updates });
  };

  const deleteSchedule = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Validate URL
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Format time for display
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  // Get schedule count for today
  const todayCount = schedules.length;

  // Get schedules by time period
  const getSchedulesByPeriod = (period: 'morning' | 'afternoon' | 'evening') => {
    return schedules.filter(schedule => {
      const hour = parseInt(schedule.scheduled_time.split(':')[0]);
      
      switch (period) {
        case 'morning':
          return hour >= 6 && hour < 12;
        case 'afternoon':
          return hour >= 12 && hour < 18;
        case 'evening':
          return hour >= 18 || hour < 6;
        default:
          return true;
      }
    });
  };

  return {
    schedules,
    isLoading,
    currentDate,
    todayCount,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    validateUrl,
    formatTime,
    getSchedulesByPeriod,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
