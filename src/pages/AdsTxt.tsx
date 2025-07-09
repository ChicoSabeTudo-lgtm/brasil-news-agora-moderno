import { useSiteConfigurations } from '@/hooks/useSiteConfigurations';

export default function AdsTxt() {
  const { configuration } = useSiteConfigurations();

  // Set appropriate headers for ads.txt
  document.title = 'ads.txt';
  
  return (
    <pre style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre-wrap', 
      padding: '0',
      margin: '0',
      fontSize: '12px',
      lineHeight: '1.2'
    }}>
      {configuration?.ads_txt_content || ''}
    </pre>
  );
}