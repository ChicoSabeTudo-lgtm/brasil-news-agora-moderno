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
      console.log('🔄 Fetching social scheduled posts...');
      let query = supabase
        .from('social_scheduled_posts')
        .select('*')
        .order('scheduled_for', { ascending: false });

      if (newsId) {
        query = query.eq('news_id', newsId);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log('✅ Posts fetched successfully:', data);
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
      console.log('🔄 Scheduling social post:', postData);

      // Primeiro inserir o post
      const { data: insertedPost, error: insertError } = await supabase
        .from('social_scheduled_posts')
        .insert(postData)
        .select()
        .single();

      console.log('📝 Post insertion result:', { insertedPost, insertError });

      if (insertError) throw insertError;

      // Depois agendar usando a função
      const { error: scheduleError } = await supabase.rpc('schedule_social_post', {
        p_post_id: insertedPost.id,
        p_when: postData.scheduled_for
      });

      if (scheduleError) throw scheduleError;

      console.log('✅ Social post scheduled successfully:', insertedPost);
      
      toast({
        title: "Post agendado",
        description: `Post agendado para ${new Date(postData.scheduled_for).toLocaleString()}.`,
      });

      // Atualizar a lista
      console.log('🔄 Refreshing posts list...');
      await fetchPosts();
      console.log('🔄 Posts after refresh:', posts);
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

  const updatePost = async (postId: string, updatedData: Partial<SocialScheduledPost>) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('social_scheduled_posts')
        .update(updatedData)
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post atualizado",
        description: "O post foi atualizado com sucesso.",
      });

      // Atualizar a lista
      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error updating social post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o post.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('social_scheduled_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post excluído",
        description: "O post foi excluído com sucesso.",
      });

      // Atualizar a lista
      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error deleting social post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cleanupOldPosts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('cleanup-social-posts');
      
      if (error) throw error;
      
      toast({
        title: "Limpeza concluída",
        description: data.message || "Posts antigos foram removidos com sucesso.",
      });
      
      // Atualizar a lista após limpeza
      await fetchPosts();
    } catch (error) {
      console.error('Error cleaning up old posts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a limpeza automática.",
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
    publishNow,
    updatePost,
    deletePost,
    cleanupOldPosts
  };
};