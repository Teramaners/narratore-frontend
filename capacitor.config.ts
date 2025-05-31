import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.domenico.narratore',
  appName: 'Narratore di sogni',
  webDir: 'frontend/dist',
  server: {
    url: 'https://narratore-frontend.onrender.com',
    cleartext: false
  }
};

export default config;