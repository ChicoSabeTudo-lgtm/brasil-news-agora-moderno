import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
import NewsArticle from "./pages/NewsArticle";
import Search from "./pages/Search";
import AoVivo from "./pages/AoVivo";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/politica" element={<Politica />} />
            <Route path="/economia" element={<Economia />} />
            <Route path="/esportes" element={<Esportes />} />
            <Route path="/tecnologia" element={<Tecnologia />} />
            <Route path="/internacional" element={<Internacional />} />
            <Route path="/nacional" element={<Nacional />} />
            <Route path="/entretenimento" element={<Entretenimento />} />
            <Route path="/saude" element={<Saude />} />
            <Route path="/busca" element={<Search />} />
            <Route path="/ao-vivo" element={<AoVivo />} />
            <Route path="/noticia/:id" element={<NewsArticle />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
