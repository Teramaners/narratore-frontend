import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- AGGIUNTE E MODIFICHE IMPORTANTI ---
  // 1. 'base: './'' serve per i deploy in produzione,
  //    risolvendo problemi di percorsi degli assets come quello che hai visto nei log.
  base: './',

  // 2. 'server.proxy' è solo per lo sviluppo locale.
  //    Assicurati che il tuo backend giri su http://localhost:3001 quando sviluppi.
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  // ------------------------------------

  // Assicurati che la cartella di output sia 'dist' (default per Vite)
  // in modo che Render sappia dove trovare i file compilati.
  build: {
    outDir: 'dist',
  }
})