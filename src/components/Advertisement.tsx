import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Advertisement {
  id: string;
  title: string;
  position: 'header' | 'politics' | 'sports' | 'international';
  ad_code?: string;
  image_url?: string;
  link_url?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

interface AdvertisementProps {
  position: 'header' | 'politics' | 'sports' | 'international';
}

export function Advertisement({ position }: AdvertisementProps) {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvertisement();
  }, [position]);

  const fetchAdvertisement = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAd(data as Advertisement);
    } catch (error) {
      console.error('Error fetching advertisement:', error);
      setAd(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !ad) {
    return null;
  }

  // Render HTML code advertisement
  if (ad.ad_code) {
    return (
      <div className="advertisement-space my-6">
        <div 
          className="w-full"
          dangerouslySetInnerHTML={{ __html: ad.ad_code }}
        />
      </div>
    );
  }

  // Render image advertisement
  if (ad.image_url) {
    const content = (
      <div className="advertisement-space my-6">
        <img 
          src={ad.image_url} 
          alt={ad.title}
          className="w-full h-auto object-contain rounded-lg shadow-sm max-w-full"
          style={{ aspectRatio: 'auto' }}
        />
      </div>
    );

    if (ad.link_url) {
      return (
        <a 
          href={ad.link_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          {content}
        </a>
      );
    }

    return content;
  }

  return null;
}