import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.domenicoattanasii.narratore',
  appName: 'Narratore-di-sogni',
  webDir: 'frontend/build', // Puoi anche rimuovere questa riga se carichi da URL esterno, ma non fa male tenerla
  server: {
    url: 'https://narratore-frontend.onrender.com/', // <--- AGGIUNGI O MODIFICA QUESTA RIGA!
    androidScheme: 'http',
    cleartext: true,
    // "indexHtml": "index.html" // Questa riga non è necessaria se carichi da un URL esterno
  }
};

export default config;