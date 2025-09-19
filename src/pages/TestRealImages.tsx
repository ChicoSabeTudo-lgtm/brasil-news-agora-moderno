import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { InstitutionalImageGallery } from "@/components/InstitutionalImageGallery";
import { SimpleGallery } from "@/components/SimpleGallery";
import { supabase } from "@/integrations/supabase/client";

interface NewsImage {
  image_url: string;
  public_url?: string;
  path?: string;
  caption?: string;
  is_cover: boolean;
  sort_order: number;
}

interface NewsWithImages {
  id: string;
  title: string;
  slug: string;
  news_images: NewsImage[];
}

export default function TestRealImages() {
  const [newsWithImages, setNewsWithImages] = useState<NewsWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsWithImages | null>(null);

  useEffect(() => {
    fetchNewsWithImages();
  }, []);

  const fetchNewsWithImages = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('news')
        .select(`
          id,
          title,
          slug,
          news_images (
            image_url,
            public_url,
            path,
            is_cover,
            caption,
            sort_order
          )
        `)
        .eq('is_published', true)
        .not('news_images', 'is', null)
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Filtrar apenas notícias que têm imagens
      const newsWithImagesData = data?.filter(news => 
        news.news_images && news.news_images.length > 0
      ) || [];

      console.log('📰 Notícias com imagens encontradas:', newsWithImagesData);
      setNewsWithImages(newsWithImagesData);
      
      if (newsWithImagesData.length > 0) {
        setSelectedNews(newsWithImagesData[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar notícias com imagens:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Carregando notícias com imagens...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (newsWithImages.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Nenhuma notícia com imagens encontrada</h1>
            <p className="text-gray-600 mb-4">
              Não há notícias publicadas com imagens no banco de dados.
            </p>
            <button 
              onClick={fetchNewsWithImages}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Teste com Imagens Reais do Banco de Dados
        </h1>
        
        {/* Seletor de notícias */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Selecione uma notícia:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsWithImages.map((news) => (
              <button
                key={news.id}
                onClick={() => setSelectedNews(news)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedNews?.id === news.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-sm mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {news.news_images.length} imagem(ns)
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Galeria da notícia selecionada */}
        {selectedNews && (
          <div className="space-y-12">
            {/* Debug: Galeria simples */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-red-600">
                Debug - Galeria Simples (Imagens Reais)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Notícia: {selectedNews.title}
              </p>
              <SimpleGallery 
                images={selectedNews.news_images}
                newsTitle={selectedNews.title}
              />
            </div>

            {/* Galeria institucional */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#0E2A47]">
                Galeria Institucional (Imagens Reais)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Primário #0E2A47 | Hover #0B2239 | Destaque controlado #C6001C
              </p>
              <InstitutionalImageGallery 
                images={selectedNews.news_images}
                newsTitle={selectedNews.title}
                variant="marinho"
              />
            </div>

            {/* Informações de debug */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Informações de Debug</h3>
              <div className="space-y-2 text-sm">
                <p><strong>ID da notícia:</strong> {selectedNews.id}</p>
                <p><strong>Título:</strong> {selectedNews.title}</p>
                <p><strong>Slug:</strong> {selectedNews.slug}</p>
                <p><strong>Total de imagens:</strong> {selectedNews.news_images.length}</p>
                <div className="mt-4">
                  <p><strong>Detalhes das imagens:</strong></p>
                  <ul className="ml-4 space-y-1">
                    {selectedNews.news_images.map((img, index) => (
                      <li key={index} className="text-xs">
                        {index + 1}. {img.is_cover ? '(Capa) ' : ''}
                        URL: {img.image_url || img.public_url || 'N/A'} | 
                        Caption: {img.caption || 'N/A'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

