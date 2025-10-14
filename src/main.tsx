import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initWebVitals } from './utils/webVitals'

createRoot(document.getElementById("root")!).render(<App />);

// Inicializar tracking de Web Vitals
if (typeof window !== 'undefined') {
  initWebVitals();
}
