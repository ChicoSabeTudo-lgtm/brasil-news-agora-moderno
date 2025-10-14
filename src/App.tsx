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

// Critical routes - loaded eagerly for better initial performance
import Index from "./pages/Index";
import NewsArticle from "./pages/NewsArticle";

// Important routes - loaded with high priority
const DynamicCategoryRoute = lazy(() => import("./components/DynamicCategoryRoute"));
const Search = lazy(() => import("./pages/Search"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Secondary routes - loaded on demand
const AoVivo = lazy(() => import(/* webpackChunkName: "ao-vivo" */ "./pages/AoVivo"));
const Videos = lazy(() => import(/* webpackChunkName: "videos" */ "./pages/Videos"));
const Contact = lazy(() => import(/* webpackChunkName: "contact" */ "./pages/Contact"));
const Advertise = lazy(() => import(/* webpackChunkName: "advertise" */ "./pages/Advertise"));
const Profile = lazy(() => import(/* webpackChunkName: "profile" */ "./pages/Profile"));

// Admin routes - heavily lazy loaded to reduce main bundle
const ModernAdmin = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/ModernAdmin"));
const SiteConfigurations = lazy(() => import(/* webpackChunkName: "admin-config" */ "./pages/SiteConfigurations"));

// Utility routes - loaded on demand
const AdsTxt = lazy(() => import(/* webpackChunkName: "utils" */ "./pages/AdsTxt"));
const Sitemap = lazy(() => import(/* webpackChunkName: "utils" */ "./pages/Sitemap"));
const RobotsTxt = lazy(() => import(/* webpackChunkName: "utils" */ "./pages/RobotsTxt"));

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
            {/* Critical routes - no lazy loading for best performance */}
            <Route path="/" element={<Index />} />
            <Route path="/noticia/:id" element={<NewsArticle />} />
            <Route path="/:categorySlug/:slug" element={<NewsArticle />} />
            <Route path="/:categorySlug/:slug/:id" element={<NewsArticle />} />
            
            {/* Important routes - with suspense */}
            <Route path="/auth" element={
              <Suspense fallback={<RouteLoader />}>
                <Auth />
              </Suspense>
            } />
            <Route path="/search" element={
              <Suspense fallback={<RouteLoader />}>
                <Search />
              </Suspense>
            } />
            <Route path="/busca" element={
              <Suspense fallback={<RouteLoader />}>
                <Search />
              </Suspense>
            } />
            
            {/* Secondary routes - lazy loaded */}
            <Route path="/ao-vivo" element={
              <Suspense fallback={<RouteLoader />}>
                <AoVivo />
              </Suspense>
            } />
            <Route path="/videos" element={
              <Suspense fallback={<RouteLoader />}>
                <Videos />
              </Suspense>
            } />
            <Route path="/contato" element={
              <Suspense fallback={<RouteLoader />}>
                <Contact />
              </Suspense>
            } />
            <Route path="/anuncie" element={
              <Suspense fallback={<RouteLoader />}>
                <Advertise />
              </Suspense>
            } />
            
            {/* Protected routes */}
            <Route path="/perfil" element={
              <Suspense fallback={<RouteLoader />}>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </Suspense>
            } />
            
            {/* Admin routes - heavily lazy loaded */}
            <Route path="/admin" element={
              <Suspense fallback={<RouteLoader />}>
                <ProtectedRoute requiredRole="redator">
                  <ModernAdmin />
                </ProtectedRoute>
              </Suspense>
            } />
            <Route path="/admin/configuracoes" element={
              <Suspense fallback={<RouteLoader />}>
                <ProtectedRoute requiredRole="admin">
                  <SiteConfigurations />
                </ProtectedRoute>
              </Suspense>
            } />
            
            {/* Utility routes */}
            <Route path="/ads.txt" element={
              <Suspense fallback={<RouteLoader />}>
                <AdsTxt />
              </Suspense>
            } />
            <Route path="/robots.txt" element={
              <Suspense fallback={<RouteLoader />}>
                <RobotsTxt />
              </Suspense>
            } />
            <Route path="/sitemap.xml" element={
              <Suspense fallback={<RouteLoader />}>
                <Sitemap />
              </Suspense>
            } />
            
            {/* Dynamic category route */}
            <Route path="/:categorySlug" element={
              <Suspense fallback={<RouteLoader />}>
                <DynamicCategoryRoute />
              </Suspense>
            } />
            
            {/* Catch-all 404 */}
            <Route path="*" element={
              <Suspense fallback={<RouteLoader />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
