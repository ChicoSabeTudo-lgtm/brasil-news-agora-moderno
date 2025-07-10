import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stats } from '@/components/admin/Stats';
import { UserManagement } from '@/components/admin/UserManagement';
import { NewsEditor } from '@/components/admin/NewsEditor';
import { NewsList } from '@/components/admin/NewsList';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { AdvertisementManagement } from '@/components/admin/AdvertisementManagement';
import { ContactManagement } from '@/components/admin/ContactManagement';
import { AdvertisingManagement } from '@/components/admin/AdvertisingManagement';
import { LiveStreamManagement } from '@/components/admin/LiveStreamManagement';
import { VideoManagement } from '@/components/admin/VideoManagement';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  PlusCircle,
  TrendingUp,
  Tag,
  Megaphone,
  Mail,
  Building,
  Radio,
  Video
} from 'lucide-react';

export default function Admin() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Painel Administrativo
              </h1>
              <p className="text-muted-foreground mt-2">
                Bem-vindo, {user?.email} 
                <Badge variant="secondary" className="ml-2">
                  {userRole === 'admin' ? 'Administrador' : 'Redator'}
                </Badge>
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/configuracoes')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-9 lg:w-auto lg:grid-cols-none lg:inline-flex">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notícias
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Ao Vivo
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categorias
              </TabsTrigger>
              <TabsTrigger value="advertisements" className="flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Propagandas
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contato
              </TabsTrigger>
              <TabsTrigger value="advertising" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Anunciantes
              </TabsTrigger>
              {userRole === 'admin' && (
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuários
                </TabsTrigger>
              )}
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Análises
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <Stats />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Atividade Recente</CardTitle>
                    <CardDescription>
                      Últimas ações realizadas no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">Nova notícia publicada</p>
                          <p className="text-sm text-muted-foreground">
                            "Reforma tributária aprovada" - Política
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          2h atrás
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">Notícia editada</p>
                          <p className="text-sm text-muted-foreground">
                            "Selic mantida em 10,75%" - Economia
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          4h atrás
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Usuário cadastrado</p>
                          <p className="text-sm text-muted-foreground">
                            Novo redator adicionado
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          1d atrás
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Métricas Rápidas</CardTitle>
                    <CardDescription>
                      Resumo das principais estatísticas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Notícias hoje</span>
                        <span className="text-2xl font-bold text-primary">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Visualizações</span>
                        <span className="text-2xl font-bold text-primary">8.4k</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Engajamento</span>
                        <span className="text-2xl font-bold text-primary">94%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Usuários ativos</span>
                        <span className="text-2xl font-bold text-primary">
                          {userRole === 'admin' ? '8' : '3'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="news">
              <div className="space-y-6">
                <NewsList />
              </div>
            </TabsContent>

            <TabsContent value="live">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Conteúdo Ao Vivo</h2>
                </div>
                
                <Tabs defaultValue="streams" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="streams" className="flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      Transmissões
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Vídeos
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="streams">
                    <LiveStreamManagement />
                  </TabsContent>
                  
                  <TabsContent value="videos">
                    <VideoManagement />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Gerenciar Categorias</h2>
                </div>
                <CategoryManagement />
              </div>
            </TabsContent>

            <TabsContent value="advertisements">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Gerenciar Propagandas</h2>
                </div>
                <AdvertisementManagement />
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Mensagens de Contato</h2>
                </div>
                <ContactManagement />
              </div>
            </TabsContent>

            <TabsContent value="advertising">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Solicitações de Anúncios</h2>
                </div>
                <AdvertisingManagement />
              </div>
            </TabsContent>

            {userRole === 'admin' && (
              <TabsContent value="users">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
                    <Button>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Convidar Usuário
                    </Button>
                  </div>
                  <UserManagement />
                </div>
              </TabsContent>
            )}

            <TabsContent value="analytics">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Análises e Relatórios</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tráfego por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Política</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full">
                              <div className="w-16 h-2 bg-primary rounded-full"></div>
                            </div>
                            <span className="text-sm">80%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Economia</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full">
                              <div className="w-12 h-2 bg-primary rounded-full"></div>
                            </div>
                            <span className="text-sm">60%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Esportes</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full">
                              <div className="w-10 h-2 bg-primary rounded-full"></div>
                            </div>
                            <span className="text-sm">50%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Semanal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Gráficos detalhados em desenvolvimento
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}