import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InContentAdProps {
  newsId: string;
  paragraphPosition: number;
}

interface NewsAdvertisement {
  id: string;
  advertisement_id: string;
  paragraph_position: number;
  is_active: boolean;
  advertisements: {
    id: string;
    title: string;
    ad_code: string;
    image_url?: string;
    link_url?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
  };
}

export function InContentAd({ newsId, paragraphPosition }: InContentAdProps) {
  const [ad, setAd] = useState<NewsAdvertisement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAd();
  }, [newsId, paragraphPosition]);

  const fetchAd = async () => {
    try {
      const { data, error } = await supabase
        .from('news_advertisements')
        .select(`
          id,
          advertisement_id,
          paragraph_position,
          is_active,
          advertisements!inner (
            id,
            title,
            ad_code,
            image_url,
            link_url,
            is_active,
            start_date,
            end_date
          )
        `)
        .eq('news_id', newsId)
        .eq('paragraph_position', paragraphPosition)
        .eq('is_active', true)
        .eq('advertisements.is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching in-content ad:', error);
        setAd(null);
        return;
      }

      // Verificar se o anúncio está dentro do período ativo
      if (data && data.advertisements) {
        const now = new Date();
        const startDate = data.advertisements.start_date ? new Date(data.advertisements.start_date) : null;
        const endDate = data.advertisements.end_date ? new Date(data.advertisements.end_date) : null;

        const isInPeriod = (!startDate || now >= startDate) && (!endDate || now <= endDate);
        
        if (isInPeriod) {
          setAd(data);
        } else {
          setAd(null);
        }
      } else {
        setAd(null);
      }
    } catch (error) {
      console.error('Error fetching in-content ad:', error);
      setAd(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !ad) {
    return null;
  }

  const { advertisements } = ad;

  // Se existe código HTML do anúncio (como AdSense), renderizar diretamente
  if (advertisements.ad_code) {
    return (
      <div className="my-8 px-4 py-6 bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
            Publicidade
          </p>
          <div 
            className="in-content-ad"
            dangerouslySetInnerHTML={{ __html: advertisements.ad_code }}
          />
        </div>
      </div>
    );
  }

  // Se é uma imagem com link
  if (advertisements.image_url) {
    const adContent = (
      <div className="my-8 px-4 py-6 bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
            Publicidade
          </p>
          <img 
            src={advertisements.image_url} 
            alt={advertisements.title}
            className="w-full h-auto max-w-md mx-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
          />
        </div>
      </div>
    );

    if (advertisements.link_url) {
      return (
        <a 
          href={advertisements.link_url} 
          target="_blank" 
          rel="noopener noreferrer nofollow"
          className="block"
        >
          {adContent}
        </a>
      );
    }

    return adContent;
  }

  return null;
}