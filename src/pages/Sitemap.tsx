import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Redirect to the Supabase edge function with custom domain
    window.location.href = 'https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/sitemap';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecionando para o sitemap...</p>
      </div>
    </div>
  );
};

export default Sitemap;