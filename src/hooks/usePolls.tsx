import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Poll {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_published: boolean;
  end_date?: string;
  created_at: string;
}

interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
  sort_order: number;
}

interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  voter_ip?: string;
  voter_session_id?: string;
}

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPolls = async () => {
    try {
      setLoading(true);
      
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .eq('is_published', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .order('sort_order');

      if (optionsError) throw optionsError;

      setPolls(pollsData || []);
      setPollOptions(optionsData || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setError('Erro ao carregar enquetes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const getActivePoll = () => {
    return polls.find(poll => 
      poll.is_active && 
      poll.is_published && 
      (!poll.end_date || new Date(poll.end_date) > new Date())
    );
  };

  const getPollOptions = (pollId: string) => {
    return pollOptions.filter(option => option.poll_id === pollId);
  };

  const votePoll = async (pollId: string, optionId: string) => {
    try {
      // Criar um ID de sessão único para controlar votos
      const sessionId = localStorage.getItem('poll_session_id') || 
        Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      if (!localStorage.getItem('poll_session_id')) {
        localStorage.setItem('poll_session_id', sessionId);
      }

      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          voter_session_id: sessionId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Atenção',
            description: 'Você já votou nesta enquete.',
            variant: 'destructive'
          });
          return false;
        }
        throw error;
      }

      // Atualizar opções localmente
      setPollOptions(prev => 
        prev.map(option => 
          option.id === optionId 
            ? { ...option, vote_count: option.vote_count + 1 }
            : option
        )
      );

      toast({
        title: 'Sucesso',
        description: 'Seu voto foi registrado!'
      });

      return true;
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao registrar voto. Tente novamente.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const hasVoted = async (pollId: string) => {
    try {
      const sessionId = localStorage.getItem('poll_session_id');
      if (!sessionId) return false;

      const { data } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('voter_session_id', sessionId)
        .limit(1);

      return (data && data.length > 0);
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  };

  return {
    polls,
    pollOptions,
    loading,
    error,
    refetch: fetchPolls,
    getActivePoll,
    getPollOptions,
    votePoll,
    hasVoted
  };
};