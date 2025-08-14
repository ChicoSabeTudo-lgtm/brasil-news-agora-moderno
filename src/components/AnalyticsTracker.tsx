import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsTrackerProps {
  articleId?: string;
  children: React.ReactNode;
}

export const AnalyticsTracker = ({ articleId, children }: AnalyticsTrackerProps) => {
  const location = useLocation();
  const { startTracking, stopTracking } = useAnalytics();

  useEffect(() => {
    // Start tracking when component mounts or location changes
    startTracking(articleId, location.pathname);

    // Cleanup when component unmounts or location changes
    return () => {
      stopTracking(articleId);
    };
  }, [articleId, location.pathname, startTracking, stopTracking]);

  return <>{children}</>;
};