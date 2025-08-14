import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardLayout } from '@/components/admin/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Import existing admin components
import { UserManagement } from '@/components/admin/UserManagement';
import { NewsEditor } from '@/components/admin/NewsEditor';
import { NewsList } from '@/components/admin/NewsList';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { AdvertisementManagement } from '@/components/admin/AdvertisementManagement';
import { InContentAdsManagement } from '@/components/admin/InContentAdsManagement';
import { ContactManagement } from '@/components/admin/ContactManagement';
import { AdvertisingManagement } from '@/components/admin/AdvertisingManagement';
import { LiveStreamManagement } from '@/components/admin/LiveStreamManagement';
import { VideoManagement } from '@/components/admin/VideoManagement';
import { DailyBriefsPanel } from '@/components/admin/DailyBriefsPanel';
import { PollManagement } from '@/components/admin/PollManagement';
import { BlocksConfigManagement } from '@/components/admin/BlocksConfigManagement';
import PostSharingForm from '@/components/admin/PostSharingForm';
import { AnalyticsPage } from '@/components/admin/analytics/AnalyticsPage';

export default function ModernAdmin() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [shareFormData, setShareFormData] = useState<{ title: string; url: string } | null>(null);

  // Set initial tab based on URL parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    // Handle both /admin?tab=analytics and /admin/analytics routes
    const pathname = window.location.pathname;
    if (pathname === '/admin/analytics') {
      setActiveTab('analytics');
      navigate('/admin?tab=analytics', { replace: true });
    } else if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams, navigate]);

  // Redirect unauthorized users away from admin-only tabs
  useEffect(() => {
    if (userRole !== 'admin') {
      const restricted = new Set(['categories','advertisements','in-content-ads','analytics','users']);
      if (restricted.has(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [userRole, activeTab]);

  const handleNavigateToShare = (newsData: { title: string; url: string }) => {
    setShareFormData(newsData);
    setActiveTab("post-sharing");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin?tab=${value}`, { replace: true });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <AdminSidebar />
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <AdminHeader />
              
              <main className="flex-1 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
                  {/* Hidden tabs list - navigation is handled by sidebar */}
                  <TabsList className="hidden">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="news">Notícias</TabsTrigger>
                    <TabsTrigger value="post-sharing">Compartilhamento</TabsTrigger>
                    <TabsTrigger value="live">Ao Vivo</TabsTrigger>
                    <TabsTrigger value="polls">Enquetes</TabsTrigger>
                    <TabsTrigger value="blocks-config">Blocos</TabsTrigger>
                    {userRole === 'admin' && (
                      <>
                        <TabsTrigger value="categories">Categorias</TabsTrigger>
                        <TabsTrigger value="advertisements">Propagandas</TabsTrigger>
                        <TabsTrigger value="in-content-ads">In-Content</TabsTrigger>
                        <TabsTrigger value="users">Usuários</TabsTrigger>
                        <TabsTrigger value="analytics">Análises</TabsTrigger>
                      </>
                    )}
                    <TabsTrigger value="contact">Contato</TabsTrigger>
                    <TabsTrigger value="advertising">Anunciantes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="mt-0 h-full">
                    <DashboardLayout />
                  </TabsContent>

                  <TabsContent value="news" className="mt-0 h-full p-6">
                    <Tabs defaultValue="list" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="list">Lista de Notícias</TabsTrigger>
                        <TabsTrigger value="pautas">Pautas do Dia</TabsTrigger>
                      </TabsList>
                      <TabsContent value="list">
                        <NewsList onNavigateToShare={handleNavigateToShare} />
                      </TabsContent>
                      <TabsContent value="pautas">
                        <DailyBriefsPanel />
                      </TabsContent>
                    </Tabs>
                  </TabsContent>

                  <TabsContent value="post-sharing" className="mt-0 h-full p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Compartilhamento de Posts</h2>
                      </div>
                      <PostSharingForm 
                        prefilledData={shareFormData}
                        onDataUsed={() => setShareFormData(null)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="live" className="mt-0 h-full p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Conteúdo Ao Vivo</h2>
                      </div>
                      
                      <Tabs defaultValue="streams" className="space-y-6">
                        <TabsList>
                          <TabsTrigger value="streams">Transmissões</TabsTrigger>
                          <TabsTrigger value="videos">Vídeos</TabsTrigger>
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

                  <TabsContent value="polls" className="mt-0 h-full p-6">
                    <PollManagement />
                  </TabsContent>

                  <TabsContent value="blocks-config" className="mt-0 h-full p-6">
                    <BlocksConfigManagement />
                  </TabsContent>

                  {userRole === 'admin' && (
                    <TabsContent value="categories" className="mt-0 h-full p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold">Gerenciar Categorias</h2>
                        </div>
                        <CategoryManagement />
                      </div>
                    </TabsContent>
                  )}

                  {userRole === 'admin' && (
                    <TabsContent value="advertisements" className="mt-0 h-full p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold">Gerenciar Propagandas</h2>
                        </div>
                        <AdvertisementManagement />
                      </div>
                    </TabsContent>
                  )}

                  {userRole === 'admin' && (
                    <TabsContent value="in-content-ads" className="mt-0 h-full p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold">Anúncios In-Content</h2>
                        </div>
                        <InContentAdsManagement />
                      </div>
                    </TabsContent>
                  )}

                  <TabsContent value="contact" className="mt-0 h-full p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Mensagens de Contato</h2>
                      </div>
                      <ContactManagement />
                    </div>
                  </TabsContent>

                  <TabsContent value="advertising" className="mt-0 h-full p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Solicitações de Anúncios</h2>
                      </div>
                      <AdvertisingManagement />
                    </div>
                  </TabsContent>

                  {userRole === 'admin' && (
                    <TabsContent value="users" className="mt-0 h-full p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
                        </div>
                        <UserManagement />
                      </div>
                    </TabsContent>
                  )}

                  {userRole === 'admin' && (
                    <TabsContent value="analytics" className="mt-0 h-full">
                      <AnalyticsPage />
                    </TabsContent>
                  )}
                </Tabs>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}