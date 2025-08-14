import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate or get session ID from localStorage
const getSessionId = () => {
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const sessionId = getSessionId();
  const startTime = useRef<number>(Date.now());
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  // Track page view
  const trackPageView = async (articleId?: string, pageUrl?: string) => {
    try {
      await supabase.from('analytics_page_views').insert({
        article_id: articleId || null,
        session_id: sessionId,
        visitor_ip: null, // Will be handled server-side if needed
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        page_url: pageUrl || window.location.pathname
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  // Track time spent on page
  const trackReadTime = async (articleId?: string) => {
    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
    
    if (timeSpent < 5) return; // Don't track very short visits
    
    try {
      await supabase.from('analytics_read_time').insert({
        article_id: articleId || null,
        session_id: sessionId,
        seconds: timeSpent
      });
    } catch (error) {
      console.error('Error tracking read time:', error);
    }
  };

  // Send heartbeat to track active visitors
  const sendHeartbeat = async (articleId?: string) => {
    try {
      // Use upsert to update last_seen time
      await supabase.from('analytics_heartbeats').upsert({
        session_id: sessionId,
        article_id: articleId || null,
        visitor_ip: null,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'session_id',
        ignoreDuplicates: false
      });
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  };

  // Start tracking for a page/article
  const startTracking = (articleId?: string, pageUrl?: string) => {
    // Track initial page view
    trackPageView(articleId, pageUrl);
    
    // Send initial heartbeat
    sendHeartbeat(articleId);
    
    // Set up heartbeat interval (every 30 seconds)
    heartbeatInterval.current = setInterval(() => {
      sendHeartbeat(articleId);
    }, 30000);
    
    // Reset start time
    startTime.current = Date.now();
  };

  // Stop tracking and record final read time
  const stopTracking = (articleId?: string) => {
    // Clear heartbeat interval
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
    
    // Track final read time
    trackReadTime(articleId);
  };

  // Auto cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, []);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, stop heartbeats temporarily
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
          heartbeatInterval.current = null;
        }
      } else {
        // Page is visible again, resume heartbeats if we were tracking
        // This would need to be managed by the component using this hook
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    sessionId,
    trackPageView,
    trackReadTime,
    sendHeartbeat,
    startTracking,
    stopTracking
  };
};