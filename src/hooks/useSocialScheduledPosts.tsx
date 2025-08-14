import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SocialScheduledPost {
  id: string;
  news_id: string;
  platform: 'instagram' | 'twitter' | 'facebook' | 'linkedin';
  content: string;
  image_url?: string;
  scheduled_for: string;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  cron_job_id?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  error_message?: string;
}

export const useSocialScheduledPosts = () => {
  const [posts, setPosts] = useState<SocialScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async (newsId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('social_scheduled_posts')
        .select('*')
        .order('scheduled_for', { ascending: false });

      if (newsId) {
        query = query.eq('news_id', newsId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts((data || []) as SocialScheduledPost[]);
    } catch (error) {
      console.error('Error fetching social scheduled posts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts agendados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const schedulePost = async (postData: {
    news_id: string;
    platform: string;
    content: string;
    image_url?: string;
    scheduled_for: string;
    created_by: string;
  }) => {
    try {
      setLoading(true);

      // Primeiro inserir o post
      const { data: insertedPost, error: insertError } = await supabase
        .from('social_scheduled_posts')
        .insert(postData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Depois agendar usando a função
      const { error: scheduleError } = await supabase.rpc('schedule_social_post', {
        p_post_id: insertedPost.id,
        p_when: postData.scheduled_for
      });

      if (scheduleError) throw scheduleError;

      toast({
        title: "Post agendado",
        description: `Post agendado para ${new Date(postData.scheduled_for).toLocaleString()}.`,
      });

      // Atualizar a lista
      await fetchPosts();
      return insertedPost;
    } catch (error) {
      console.error('Error scheduling social post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível agendar o post.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelSchedule = async (postId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase.rpc('cancel_social_schedule', {
        p_post_id: postId
      });

      if (error) throw error;

      toast({
        title: "Agendamento cancelado",
        description: "O post foi cancelado com sucesso.",
      });

      // Atualizar a lista
      await fetchPosts();
    } catch (error) {
      console.error('Error canceling social schedule:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const publishNow = async (postId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase.rpc('publish_social_post', {
        p_post_id: postId
      });

      if (error) throw error;

      toast({
        title: "Post publicado",
        description: "O post foi publicado imediatamente.",
      });

      // Atualizar a lista
      await fetchPosts();
    } catch (error) {
      console.error('Error publishing social post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar o post.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    fetchPosts,
    schedulePost,
    cancelSchedule,
    publishNow
  };
};