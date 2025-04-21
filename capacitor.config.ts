import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.narratoredisogni.app',
  appName: 'Narratore di Sogni',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  android: {
    buildOptions: {
      keystorePath: 'android.keystore',
      keystorePassword: 'narratore123',
      keystoreAlias: 'narratoredisogni',
      keystoreAliasPassword: 'narratore123'
    }
  }
};

export default config;
