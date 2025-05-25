import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.domenicoattanasii.narratore',
  appName: 'Narratore-di-sogni',
  webDir: 'frontend/build',
  server: {
  androidScheme: 'http',
  cleartext: true,
    // Questa è la configurazione chiave per le Single Page Application (SPA)
    // Indica a Capacitor che, per qualsiasi percorso non trovato dal server interno
    // dell'applicazione mobile, deve servire il file 'index.html'.
    // Questo permette al router JavaScript della tua app React di prendere il controllo.
    "indexHtml": "index.html"
  }
};

export default config;