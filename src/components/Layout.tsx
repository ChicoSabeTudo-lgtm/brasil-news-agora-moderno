import { Header } from "@/components/Header";
import { NewsTicker } from "@/components/NewsTicker";
import { Advertisement } from "@/components/Advertisement";
import { Footer } from "@/components/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NewsTicker />
      
      {/* Advertisement Space - Header */}
      <Advertisement position="header" />
      
      {children}
      
      <Footer />
    </div>
  );
};