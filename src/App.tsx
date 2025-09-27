import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import RouteLoader from "@/components/RouteLoader";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SiteCodeInjector } from "@/components/SiteCodeInjector";
import { EmbedBridge } from "@/components/EmbedBridge";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Politica = lazy(() => import("./pages/Politica"));
const Economia = lazy(() => import("./pages/Economia"));
const Esportes = lazy(() => import("./pages/Esportes"));
const Tecnologia = lazy(() => import("./pages/Tecnologia"));
const Internacional = lazy(() => import("./pages/Internacional"));
const Nacional = lazy(() => import("./pages/Nacional"));
const Entretenimento = lazy(() => import("./pages/Entretenimento"));
const Saude = lazy(() => import("./pages/Saude"));
const DynamicCategoryRoute = lazy(() => import("./components/DynamicCategoryRoute"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const Search = lazy(() => import("./pages/Search"));
const AoVivo = lazy(() => import("./pages/AoVivo"));
const Auth = lazy(() => import("./pages/Auth"));
const ModernAdmin = lazy(() => import("./pages/ModernAdmin"));
const Contact = lazy(() => import("./pages/Contact"));
const Advertise = lazy(() => import("./pages/Advertise"));
const Videos = lazy(() => import("./pages/Videos"));
const SiteConfigurations = lazy(() => import("./pages/SiteConfigurations"));
const AdsTxt = lazy(() => import("./pages/AdsTxt"));
const Profile = lazy(() => import("./pages/Profile"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const RobotsTxt = lazy(() => import("./pages/RobotsTxt"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <SiteCodeInjector />
        <EmbedBridge />
        <BrowserRouter>
          <Suspense fallback={<RouteLoader /> }>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="redator">
                <ModernAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/configuracoes" element={
              <ProtectedRoute requiredRole="admin">
                <SiteConfigurations />
              </ProtectedRoute>
            } />
            <Route path="/search" element={<Search />} />
            <Route path="/busca" element={<Search />} />
            <Route path="/ao-vivo" element={<AoVivo />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/anuncie" element={<Advertise />} />
            <Route path="/ads.txt" element={<AdsTxt />} />
            <Route path="/robots.txt" element={<RobotsTxt />} />
            <Route path="/sitemap.xml" element={<Sitemap />} />
            <Route path="/noticia/:id" element={<NewsArticle />} />
            <Route path="/:categorySlug/:slug" element={<NewsArticle />} />
            <Route path="/:categorySlug/:slug/:id" element={<NewsArticle />} />
            {/* Rota dinâmica para todas as categorias */}
            <Route path="/:categorySlug" element={<DynamicCategoryRoute />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
