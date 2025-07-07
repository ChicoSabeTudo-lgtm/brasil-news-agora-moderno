import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BacklinkInfo {
  keyword: string;
  title: string;
  url: string;
  score: number;
}

interface BacklinkResult {
  processedContent: string;
  backlinksAdded: number;
  backlinks: BacklinkInfo[];
}

export const useBacklinks = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const generateBacklinks = async (
    content: string, 
    currentNewsId?: string, 
    categorySlug?: string
  ): Promise<BacklinkResult> => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-backlinks', {
        body: {
          content,
          currentNewsId,
          categorySlug
        }
      });

      if (error) {
        console.error('Error generating backlinks:', error);
        return {
          processedContent: content,
          backlinksAdded: 0,
          backlinks: []
        };
      }

      return {
        processedContent: data.processedContent || content,
        backlinksAdded: data.backlinksAdded || 0,
        backlinks: data.backlinks || []
      };
      
    } catch (error) {
      console.error('Error in generateBacklinks:', error);
      return {
        processedContent: content,
        backlinksAdded: 0,
        backlinks: []
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    generateBacklinks,
    isProcessing
  };
};