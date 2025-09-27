import React from 'react';
import { Layout } from "@/components/Layout";
import { Advertisement } from "@/components/Advertisement";
import { Link } from "react-router-dom";
import { useVideos } from "@/hooks/useVideos";
import { Play, Eye, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import breakingImage from "@/assets/breaking-news-hero.jpg";
import { getBestVideoThumbnail } from "@/utils/videoUtils";

const Videos = () => {
  const { videos, loading, error, updateViews } = useVideos();

  const handleVideoClick = (videoId: string) => {
    updateViews(videoId);
  };

  const formatPublishedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Agora há pouco";
    } else if (diffInHours < 24) {
      return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else {
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="sr-only">Carregando...</span>
          </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || videos.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Nenhum vídeo disponível</h2>
              <p className="text-lg text-muted-foreground">
                {error || 'Não há vídeos publicados no momento. Volte mais tarde para conferir o conteúdo.'}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const featuredVideo = videos[0];
  const otherVideos = videos.slice(1);

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary transition-colors">
                Início
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Vídeos</span>
            </nav>
            
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Vídeos
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Assista aos melhores vídeos informativos, análises detalhadas e coberturas especiais sobre os principais acontecimentos do Brasil e do mundo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">

        {/* Featured Video */}
        {featuredVideo && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                Destaque
              </span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div 
                className="relative cursor-pointer group"
                onClick={() => handleVideoClick(featuredVideo.id)}
              >
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={getBestVideoThumbnail(featuredVideo.thumbnail_url, featuredVideo.video_url, breakingImage)}
                    alt={featuredVideo.title}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors shadow-lg">
                      <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                    </div>
                  </div>
                  
                  {/* Duration */}
                  <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded text-sm font-medium">
                    {featuredVideo.duration}
                  </div>
                  
                  {/* Category */}
                  {featuredVideo.categories && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                        {featuredVideo.categories.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {featuredVideo.title}
                </h3>
                
                {featuredVideo.description && (
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {featuredVideo.description}
                  </p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{featuredVideo.views.toLocaleString()} visualizações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatPublishedAt(featuredVideo.published_at || featuredVideo.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Other Videos Grid */}
        {otherVideos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                Todos os Vídeos
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleVideoClick(video.id)}
                >
                  <div className="relative">
                    <img 
                      src={getBestVideoThumbnail(video.thumbnail_url, video.video_url, breakingImage)}
                      alt={video.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    
                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                      {video.duration}
                    </div>
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                        <Play className="w-6 h-6 text-black ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Category */}
                    {video.categories && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                          {video.categories.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {video.title}
                    </h3>
                    
                    <div className="flex items-center text-xs text-muted-foreground justify-between">
                      <span>{video.views.toLocaleString()} visualizações</span>
                      <span>{formatPublishedAt(video.published_at || video.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Advertisement Space */}
        <Advertisement position="sports" />
      </main>
    </Layout>
  );
};

export default Videos;
