import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  stream_url?: string;
  chat_enabled: boolean;
  is_active: boolean;
  viewer_count: number;
  scheduled_start?: string;
  actual_start?: string;
  actual_end?: string;
  thumbnail_url?: string;
  created_at: string;
}

interface LiveProgram {
  id: string;
  live_stream_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  is_active: boolean;
}

export const useLiveStreams = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [programs, setPrograms] = useState<LiveProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      
      const { data: streamsData, error: streamsError } = await supabase
        .from('live_streams')
        .select('*')
        .order('created_at', { ascending: false });

      if (streamsError) throw streamsError;

      const { data: programsData, error: programsError } = await supabase
        .from('live_programs')
        .select('*')
        .eq('is_active', true)
        .order('start_time');

      if (programsError) throw programsError;

      setStreams(streamsData || []);
      setPrograms(programsData || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching live streams:', error);
      setError('Erro ao carregar transmissões ao vivo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const getActiveStream = () => {
    return streams.find(stream => stream.is_active);
  };

  const getCurrentPrograms = () => {
    const now = new Date();
    const currentDay = now.getDay() || 7; // 0=domingo -> 7, 1=segunda -> 1
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    return programs.filter(program => 
      program.days_of_week.includes(currentDay) && 
      program.start_time <= currentTime && 
      program.end_time >= currentTime
    );
  };

  const getUpcomingPrograms = () => {
    const now = new Date();
    const currentDay = now.getDay() || 7;
    const currentTime = now.toTimeString().slice(0, 5);

    return programs.filter(program => 
      program.days_of_week.includes(currentDay) && 
      program.start_time > currentTime
    ).slice(0, 3);
  };

  const updateViewerCount = async (streamId: string, count: number) => {
    try {
      const { error } = await supabase
        .from('live_streams')
        .update({ viewer_count: count })
        .eq('id', streamId);

      if (error) throw error;
      
      // Atualizar estado local
      setStreams(prev => 
        prev.map(stream => 
          stream.id === streamId 
            ? { ...stream, viewer_count: count }
            : stream
        )
      );
    } catch (error) {
      console.error('Error updating viewer count:', error);
    }
  };

  return {
    streams,
    programs,
    loading,
    error,
    refetch: fetchStreams,
    getActiveStream,
    getCurrentPrograms,
    getUpcomingPrograms,
    updateViewerCount
  };
};