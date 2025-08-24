import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle,
  Play, 
  X, 
  Search,
  Filter,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { useSocialScheduledPosts, SocialScheduledPost } from '@/hooks/useSocialScheduledPosts';
import { useAuth } from '@/hooks/useAuth';
import { SocialPostEditModal } from './SocialPostEditModal';
import { SocialPostViewModal } from './SocialPostViewModal';

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

const platformNames = {
  instagram: 'Instagram',
  twitter: 'Twitter',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
};

const statusColors = {
  scheduled: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800',
  published: 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800',
  failed: 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-800',
  cancelled: 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-800',
};

const statusNames = {
  scheduled: 'Agendado',
  published: 'Publicado',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

export const SocialPostsManagement = () => {
  const { posts, loading, fetchPosts, cancelSchedule, publishNow, updatePost, deletePost, cleanupOldPosts } = useSocialScheduledPosts();
  const { user, userRole, isOtpVerified } = useAuth();
  
  // Bypass temporário para admins - permitir acesso mesmo sem OTP verificado
  const hasAccess = user && userRole && 
    (userRole === 'admin' || userRole === 'redator') && 
    (isOtpVerified || userRole === 'admin'); // Admins podem acessar sem OTP
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<SocialScheduledPost | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log('🔄 Auth check effect triggered:', { 
      user: !!user, 
      userRole, 
      isOtpVerified, 
      hasAccess,
      authChecked
    });
    
    // Verificar autenticação primeiro
    if (hasAccess) {
      setAuthChecked(true);
      console.log('✅ User has access, fetching posts...');
      fetchPosts();
    } else if (user === null) {
      // Usuário não autenticado
      console.log('❌ User not authenticated');
      setAuthChecked(true);
    } else if (user && !isOtpVerified && userRole !== 'admin') {
      // Usuário sem OTP verificado (exceto admin)
      console.log('⚠️ User not OTP verified and not admin');
      setAuthChecked(true);
    }
  }, [user, userRole, isOtpVerified, hasAccess]); // Removed fetchPosts from dependencies

  // Auto-refresh posts apenas se usuário tem permissões
  useEffect(() => {
    if (authChecked && hasAccess) {
      console.log('🔄 Setting up auto-refresh interval');
      const interval = setInterval(() => {
        console.log('⏰ Auto-refresh triggered');
        fetchPosts();
      }, 30000);

      return () => {
        console.log('🛑 Clearing auto-refresh interval');
        clearInterval(interval);
      };
    }
  }, [authChecked, hasAccess]); // Removed fetchPosts from dependencies

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || post.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const getPlatformIcon = (platform: string) => {
    const Icon = platformIcons[platform as keyof typeof platformIcons];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR });
  };

  const handleEditPost = (post: SocialScheduledPost) => {
    console.log('✏️ Opening edit modal for post:', post.id);
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleViewPost = (post: SocialScheduledPost) => {
    console.log('👀 Opening view modal for post:', post.id);
    setSelectedPost(post);
    setIsViewModalOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      await deletePost(postId);
    }
  };

  const handleSavePost = async (updatedData: Partial<SocialScheduledPost>) => {
    if (selectedPost) {
      const success = await updatePost(selectedPost.id, updatedData);
      if (success) {
        setIsEditModalOpen(false);
        setSelectedPost(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Gerenciamento de Posts Sociais
            </div>
            <Button
              variant="outline"
              onClick={cleanupOldPosts}
              disabled={loading}
              className="flex items-center gap-2"
              title="Limpar posts antigos (48h+)"
            >
              <Trash2 className="w-4 h-4" />
              Limpeza Automática
            </Button>
          </CardTitle>
          <CardDescription>
            Visualize e gerencie todos os posts agendados para redes sociais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platform-filter">Plataforma</Label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as plataformas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPlatformFilter('all');
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Tabela de Posts */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Agendado para</TableHead>
                  <TableHead>Publicado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
               <TableBody>
                 {!authChecked ? (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-12">
                       <div className="flex flex-col items-center gap-3">
                         <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                         <p className="text-sm text-muted-foreground">Verificando permissões...</p>
                       </div>
                     </TableCell>
                   </TableRow>
                 ) : !user ? (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-12">
                       <div className="flex flex-col items-center gap-3">
                         <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                           <X className="w-8 h-8 text-red-500" />
                         </div>
                         <div>
                           <h3 className="font-medium text-red-700">Acesso negado</h3>
                           <p className="text-sm text-muted-foreground mt-1">
                             Você precisa estar logado para visualizar os posts sociais.
                           </p>
                         </div>
                       </div>
                     </TableCell>
                   </TableRow>
                  ) : userRole !== 'admin' && userRole !== 'redator' ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                            <X className="w-8 h-8 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-amber-700">Permissão insuficiente</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Apenas administradores e redatores podem gerenciar posts sociais.
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : !hasAccess ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-orange-500" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-medium text-orange-700">Verificação OTP necessária</h3>
                            <p className="text-sm text-muted-foreground">
                              Complete a verificação OTP para acessar o gerenciamento de posts sociais.
                            </p>
                            {userRole === 'admin' && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-sm">
                                <p>🔓 Como administrador, você tem acesso temporário, mas recomendamos completar a verificação OTP.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                          <p className="text-sm text-muted-foreground">Carregando posts sociais...</p>
                          {userRole === 'admin' && !isOtpVerified && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-sm max-w-sm">
                              <p>🔓 Acesso administrativo temporário ativo</p>
                            </div>
                          )}
                          {!isOtpVerified && userRole !== 'admin' && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-800 text-sm max-w-sm">
                              <p>⏳ Aguardando verificação OTP...</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                 ) : filteredPosts.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-12">
                       <div className="flex flex-col items-center gap-3">
                         <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                           <Calendar className="w-8 h-8 text-muted-foreground" />
                         </div>
                         <div>
                           <h3 className="font-medium">Nenhum post encontrado</h3>
                           <p className="text-sm text-muted-foreground mt-1">
                             {posts.length === 0 
                               ? "Ainda não há posts sociais cadastrados" 
                               : "Tente ajustar os filtros para encontrar posts"}
                           </p>
                         </div>
                       </div>
                     </TableCell>
                   </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(post.platform)}
                          <span className="font-medium">
                            {platformNames[post.platform as keyof typeof platformNames]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="truncate text-sm">{post.content}</p>
                        </div>
                      </TableCell>
                       <TableCell>
                         <Badge variant="outline" className={statusColors[post.status]}>
                           {statusNames[post.status]}
                         </Badge>
                       </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(post.scheduled_for)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.published_at ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(post.published_at)}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                       <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2">
                           {/* Botão Visualizar - mais proeminente */}
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleViewPost(post)}
                             disabled={loading}
                             className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 dark:text-blue-300"
                             title="Visualizar detalhes do post"
                           >
                             <Eye className="w-4 h-4 mr-1" />
                             Ver
                           </Button>
                           
                           {/* Botão Editar - apenas para posts agendados */}
                           {post.status === 'scheduled' && (
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleEditPost(post)}
                               disabled={loading}
                               className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950 dark:hover:bg-amber-900 dark:border-amber-800 dark:text-amber-300"
                               title="Editar post agendado"
                             >
                               <Edit className="w-4 h-4 mr-1" />
                               Editar
                             </Button>
                           )}
                           
                           {/* Ações específicas para posts agendados */}
                           {post.status === 'scheduled' && (
                             <>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => publishNow(post.id)}
                                 disabled={loading}
                                 className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-300"
                                 title="Publicar agora"
                               >
                                 <Play className="w-4 h-4 mr-1" />
                                 Publicar
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => cancelSchedule(post.id)}
                                 disabled={loading}
                                 className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800 dark:text-red-300"
                                 title="Cancelar agendamento"
                               >
                                 <X className="w-4 h-4 mr-1" />
                                 Cancelar
                               </Button>
                             </>
                           )}
                           
                           {/* Botão Excluir */}
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleDeletePost(post.id)}
                             disabled={loading}
                             className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                             title="Excluir post permanentemente"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                           
                           {/* Mostrar erro se houver */}
                           {post.status === 'failed' && post.error_message && (
                             <div className="text-sm text-red-600 dark:text-red-400 px-2 py-1 bg-red-50 dark:bg-red-950/50 rounded border border-red-200 dark:border-red-800" title={post.error_message}>
                               Erro
                             </div>
                           )}
                         </div>
                       </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {posts.filter(p => p.status === 'scheduled').length}
              </div>
              <div className="text-sm text-muted-foreground">Agendados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {posts.filter(p => p.status === 'published').length}
              </div>
              <div className="text-sm text-muted-foreground">Publicados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {posts.filter(p => p.status === 'failed').length}
              </div>
              <div className="text-sm text-muted-foreground">Falharam</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {posts.filter(p => p.status === 'cancelled').length}
              </div>
              <div className="text-sm text-muted-foreground">Cancelados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <SocialPostEditModal
        post={selectedPost}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPost(null);
        }}
        onSave={handleSavePost}
        loading={loading}
      />

      {/* Modal de Visualização */}
      <SocialPostViewModal
        post={selectedPost}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPost(null);
        }}
      />
    </div>
  );
};