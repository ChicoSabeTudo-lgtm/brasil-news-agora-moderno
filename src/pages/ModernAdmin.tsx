import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardLayout } from '@/components/admin/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
import { SocialPostsManagement } from '@/components/admin/SocialPostsManagement';
import { AiTextGenerator } from '@/components/admin/ai/AiTextGenerator';
import { FinancialEntries } from '@/components/admin/finance/FinancialEntries';
import { OrdersManagement } from '@/components/admin/finance/OrdersManagement';
import { ClientsManagement } from '@/components/admin/finance/ClientsManagement';
import { SuppliersManagement } from '@/components/admin/finance/SuppliersManagement';
import { AdvertisementsManagement } from '@/components/admin/finance/AdvertisementsManagement';
import { HRCalculator } from '@/components/admin/finance/HRCalculator';
import { CompanyData } from '@/components/admin/finance/CompanyData';
import { CompanyDocuments } from '@/components/admin/finance/CompanyDocuments';
import { CompanyCertifications } from '@/components/admin/finance/CompanyCertifications';
import { InvoiceManagement } from '@/components/admin/finance/InvoiceManagement';
import { DasManagement } from '@/components/admin/finance/DasManagement';
import { InssManagement } from '@/components/admin/finance/InssManagement';
import { LegalCaseManagement } from '@/components/admin/finance/LegalCaseManagement';


export default function ModernAdmin() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [shareFormData, setShareFormData] = useState<{ title: string; url: string; summary?: string } | null>(null);

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
      const restricted = new Set(['categories','advertisements','in-content-ads','users']);
      if (restricted.has(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [userRole, activeTab]);

  const handleNavigateToShare = (newsData: { title: string; url: string; summary?: string }) => {
    setShareFormData(newsData);
    setActiveTab("post-sharing");
  };

  const handleTabChange = (value: string) => {
    // Gestores não podem acessar outras abas fora de redação/propagandas
    if (userRole === 'gestor') {
      const allowed = new Set(['dashboard', 'news', 'post-sharing', 'ads-finance']);
      if (!allowed.has(value)) {
        setActiveTab('dashboard');
        navigate('/admin?tab=dashboard', { replace: true });
        return;
      }
    }

    setActiveTab(value);
    navigate(`/admin?tab=${value}`, { replace: true });
  };

  const renderContent = () => {
    if (userRole === 'gestor' && !['dashboard', 'news', 'post-sharing', 'ads-finance'].includes(activeTab)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Acesso restrito</h1>
            <p className="text-muted-foreground max-w-md">
              Como gestor você tem acesso completo à Redação e à seção de Propagandas.
              Outras áreas estão disponíveis apenas para administradores ou redatores.
            </p>
            <Button variant="outline" onClick={() => handleTabChange('dashboard')}>
              Voltar ao dashboard
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
                  {/* Hidden tabs list - navigation is handled by sidebar */}
                  <TabsList className="hidden">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="news">Notícias</TabsTrigger>
                    <TabsTrigger value="post-sharing">Compartilhamento</TabsTrigger>
                    <TabsTrigger value="social-posts">Posts Sociais</TabsTrigger>
                    {userRole !== 'gestor' && (
                      <TabsTrigger value="live">Ao Vivo</TabsTrigger>
                    )}
                    {userRole !== 'gestor' && (
                      <TabsTrigger value="polls">Enquetes</TabsTrigger>
                    )}
                    {userRole !== 'gestor' && (
                      <TabsTrigger value="blocks-config">Blocos</TabsTrigger>
                    )}
                    {userRole !== 'gestor' && (
                      <TabsTrigger value="ai-texts">Textos de IA</TabsTrigger>
                    )}
                    {/* Financeiro visível para admin e redator; gestor acessa apenas propagandas */}
                    {(userRole === 'admin' || userRole === 'redator') && (
                      <TabsTrigger value="finance">Financeiro</TabsTrigger>
                    )}
                    {(userRole === 'admin' || userRole === 'redator') && (
                      <TabsTrigger value="clients">Clientes</TabsTrigger>
                    )}
                    {(userRole === 'admin' || userRole === 'redator') && (
                      <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
                    )}
                    {(userRole === 'admin' || userRole === 'gestor') && (
                      <TabsTrigger value="ads-finance">Propagandas</TabsTrigger>
                    )}
                    {(userRole === 'admin' || userRole === 'redator') && (
                      <TabsTrigger value="insertion-orders">Gestão de PIs</TabsTrigger>
                    )}
                    {(userRole === 'admin' || userRole === 'redator') && (
                      <TabsTrigger value="hr-calculator">Calculadora RH</TabsTrigger>
                    )}
                    {userRole === 'admin' && (
                      <>
                        <TabsTrigger value="categories">Categorias</TabsTrigger>
                        <TabsTrigger value="advertisements">Propagandas</TabsTrigger>
                        <TabsTrigger value="in-content-ads">In-Content</TabsTrigger>
                        <TabsTrigger value="users">Usuários</TabsTrigger>
                      </>
                    )}
                    {(userRole === 'admin' || userRole === 'redator' || userRole === 'gestor') && (
                      <TabsTrigger value="analytics">Análises</TabsTrigger>
                    )}
                    <TabsTrigger value="contact">Contato</TabsTrigger>
                    <TabsTrigger value="advertising">Anunciantes</TabsTrigger>
                    <TabsTrigger value="company-data">Dados da Empresa</TabsTrigger>
                    <TabsTrigger value="company-documents">Documentos</TabsTrigger>
                    <TabsTrigger value="company-certifications">Certidões</TabsTrigger>
                    <TabsTrigger value="invoices">Notas Fiscais</TabsTrigger>
                    <TabsTrigger value="das-payments">Pagamentos DAS</TabsTrigger>
                    <TabsTrigger value="inss-payments">Pagamentos INSS</TabsTrigger>
                    <TabsTrigger value="legal-cases">Processos Judiciais</TabsTrigger>
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

                  {userRole !== 'gestor' && (
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
                  )}

                  {userRole !== 'gestor' && (
                    <TabsContent value="social-posts" className="mt-0 h-full p-6">
                      <SocialPostsManagement />
                    </TabsContent>
                  )}

                  {userRole !== 'gestor' && (
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
                  )}

                  <TabsContent value="polls" className="mt-0 h-full p-6">
                    <PollManagement />
                  </TabsContent>

                  {userRole !== 'gestor' && (
                    <TabsContent value="blocks-config" className="mt-0 h-full p-6">
                      <BlocksConfigManagement />
                    </TabsContent>
                  )}

                  {userRole !== 'gestor' && (
                    <TabsContent value="ai-texts" className="mt-0 h-full p-6">
                      <AiTextGenerator />
                    </TabsContent>
                  )}

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

                  {(userRole === 'admin' || userRole === 'redator') && (
                    <TabsContent value="finance" className="mt-0 h-full p-6">
                      <FinancialEntries />
                    </TabsContent>
                  )}

                  {(userRole === 'admin' || userRole === 'redator') && (
                    <TabsContent value="clients" className="mt-0 h-full p-6">
                      <ClientsManagement />
                    </TabsContent>
                  )}

                  {(userRole === 'admin' || userRole === 'redator') && (
                    <TabsContent value="suppliers" className="mt-0 h-full p-6">
                      <SuppliersManagement />
                    </TabsContent>
                  )}

                  {(userRole === 'admin' || userRole === 'gestor') && (
                    <TabsContent value="ads-finance" className="mt-0 h-full p-6">
                      <AdvertisementsManagement />
                    </TabsContent>
                  )}

                  {(userRole === 'admin' || userRole === 'redator') && (
                    <TabsContent value="insertion-orders" className="mt-0 h-full p-6">
                      <OrdersManagement />
                    </TabsContent>
                  )}

                  {(userRole === 'admin' || userRole === 'redator') && (
                    <TabsContent value="hr-calculator" className="mt-0 h-full p-6">
                      <HRCalculator />
                    </TabsContent>
                  )}

                  {userRole === 'admin' && (
                    <TabsContent value="company-data" className="mt-0 h-full">
                      <CompanyData />
                    </TabsContent>
                  )}

                  {userRole === 'admin' && (
                    <TabsContent value="company-documents" className="mt-0 h-full">
                      <CompanyDocuments />
                    </TabsContent>
                  )}

                  {userRole === 'admin' && (
                    <TabsContent value="company-certifications" className="mt-0 h-full">
                      <CompanyCertifications />
                    </TabsContent>
                  )}

                  {userRole === 'admin' && (
                    <TabsContent value="invoices" className="mt-0 h-full">
                      <InvoiceManagement />
                    </TabsContent>
                  )}

                  {userRole === 'admin' && (
                    <TabsContent value="das-payments" className="mt-0 h-full">
                      <DasManagement />
                    </TabsContent>
                  )}

                  {userRole === 'admin' && (
                    <TabsContent value="inss-payments" className="mt-0 h-full">
                      <InssManagement />
                    </TabsContent>
                  )}

                  {userRole === 'admin' && (
                    <TabsContent value="legal-cases" className="mt-0 h-full">
                      <LegalCaseManagement />
                    </TabsContent>
                  )}
          </Tabs>
        </main>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'redator', 'gestor']}>
      <div className="min-h-screen bg-background">
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <AdminSidebar />
            {renderContent()}
          </div>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}
