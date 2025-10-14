import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

// Função para enviar métricas para analytics
function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // Enviar para console em desenvolvimento
  if (import.meta.env.DEV) {
    console.log('📊 Web Vital:', metric.name, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Enviar para analytics (Google Analytics, custom endpoint, etc)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // Google Analytics 4
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Beacon API para enviar de forma confiável mesmo quando a página está sendo fechada
  if (navigator.sendBeacon) {
    // Você pode configurar um endpoint próprio aqui
    // navigator.sendBeacon('/api/web-vitals', body);
  }
}

// Inicializar tracking de Web Vitals
export function initWebVitals() {
  // Largest Contentful Paint (LCP) - Bom: < 2.5s
  onLCP(sendToAnalytics);

  // Interaction to Next Paint (INP) - Bom: < 200ms
  // Substituiu FID como métrica principal de interatividade
  onINP(sendToAnalytics);

  // Cumulative Layout Shift (CLS) - Bom: < 0.1
  onCLS(sendToAnalytics);

  // First Contentful Paint (FCP) - Bom: < 1.8s
  onFCP(sendToAnalytics);

  // Time to First Byte (TTFB) - Bom: < 800ms
  onTTFB(sendToAnalytics);
}

// Exportar função para integração manual se necessário
export { onCLS, onFCP, onLCP, onTTFB, onINP };

