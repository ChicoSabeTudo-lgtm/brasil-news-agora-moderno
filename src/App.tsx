import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SiteCodeInjector } from "@/components/SiteCodeInjector";
import { EmbedBridge } from "@/components/EmbedBridge";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Politica from "./pages/Politica";
import Economia from "./pages/Economia";
import Esportes from "./pages/Esportes";
import Tecnologia from "./pages/Tecnologia";
import Internacional from "./pages/Internacional";
import Nacional from "./pages/Nacional";
import Entretenimento from "./pages/Entretenimento";
import Saude from "./pages/Saude";
import { DynamicCategoryRoute } from "./components/DynamicCategoryRoute";
import NewsArticle from "./pages/NewsArticle";
import Search from "./pages/Search";
import AoVivo from "./pages/AoVivo";
import Auth from "./pages/Auth";
import ModernAdmin from "./pages/ModernAdmin";
import Contact from "./pages/Contact";
import Advertise from "./pages/Advertise";
import Videos from "./pages/Videos";
import SiteConfigurations from "./pages/SiteConfigurations";
import AdsTxt from "./pages/AdsTxt";
import Profile from "./pages/Profile";
import Sitemap from "./pages/Sitemap";
import RobotsTxt from "./pages/RobotsTxt";

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
            {/* Rota dinâmica para todas as categorias */}
            <Route path="/:categorySlug" element={<DynamicCategoryRoute />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
