import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, MessageSquare, FileText, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UrgentTask {
  id: string;
  type: 'contact' | 'news_draft' | 'user_approval';
  title: string;
  description: string;
  created_at: string;
  priority: 'high' | 'medium' | 'low';
}

export const UrgentTasksWidget = () => {
  const [tasks, setTasks] = useState<UrgentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUrgentTasks = async () => {
      try {
        const urgentTasks: UrgentTask[] = [];

        // Fetch unread contact messages
        const { data: contacts } = await supabase
          .from('contact_messages')
          .select('*')
          .eq('status', 'unread')
          .order('created_at', { ascending: false })
          .limit(3);

        if (contacts) {
          contacts.forEach(contact => {
            urgentTasks.push({
              id: `contact-${contact.id}`,
              type: 'contact',
              title: 'Nova mensagem de contato',
              description: `De: ${contact.name} - ${contact.subject}`,
              created_at: contact.created_at,
              priority: 'high'
            });
          });
        }

        // Fetch draft news older than 2 days
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
        const { data: draftNews } = await supabase
          .from('news')
          .select('*')
          .eq('is_published', false)
          .lt('created_at', twoDaysAgo)
          .order('created_at', { ascending: true })
          .limit(2);

        if (draftNews) {
          draftNews.forEach(news => {
            urgentTasks.push({
              id: `news-${news.id}`,
              type: 'news_draft',
              title: 'Rascunho pendente há mais de 2 dias',
              description: news.title,
              created_at: news.created_at,
              priority: 'medium'
            });
          });
        }

        // Sort by priority and date
        urgentTasks.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setTasks(urgentTasks.slice(0, 5));
      } catch (error) {
        console.error('Error fetching urgent tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrgentTasks();
    const interval = setInterval(fetchUrgentTasks, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return MessageSquare;
      case 'news_draft':
        return FileText;
      case 'user_approval':
        return Users;
      default:
        return AlertTriangle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="admin-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Pendências Urgentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="admin-slide-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Pendências Urgentes
          {tasks.length > 0 && (
            <Badge variant="destructive" className="admin-badge-pulse ml-auto admin-notification-bounce">
              {tasks.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Itens que precisam de atenção imediata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => {
            const IconComponent = getTaskIcon(task.type);
            const daysDiff = Math.floor(
              (Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getPriorityColor(task.priority)} rounded-full border-2 border-background`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1 mb-1">
                    {task.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    há {daysDiff === 0 ? 'hoje' : `${daysDiff} ${daysDiff === 1 ? 'dia' : 'dias'}`}
                  </div>
                </div>
                
                <Badge 
                  variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {task.priority === 'high' ? 'Urgente' : task.priority === 'medium' ? 'Médio' : 'Baixo'}
                </Badge>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhuma pendência urgente!</p>
              <p className="text-xs text-muted-foreground mt-1">Tudo em dia 🎉</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};