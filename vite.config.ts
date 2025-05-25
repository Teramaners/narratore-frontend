<<<<<<< HEAD
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Avvolgi tutto in una funzione async
export default defineConfig(async () => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
  ];

  // Le seguenti righe sono specifiche per l'ambiente Replit.
  // Se non stai deployando o sviluppando su Replit per l'APK finale,
  // potresti volerle rimuovere per alleggerire la configurazione,
  // ma non causano problemi se presenti.
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
  ) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    // ✅ Questa è la riga fondamentale e già presente per Capacitor/WebView
    // Assicura che i percorsi degli asset siano relativi (es. assets/image.png anziché /assets/image.png)
    // Questo è cruciale quando l'app viene caricata dal filesystem locale in una WebView.
    base: './', 

    plugins,

    resolve: {
      alias: {
        // Alias di risoluzione per importazioni più pulite.
        // Assicurati che il percorso 'client/src' sia corretto rispetto alla root del tuo progetto.
        "@": path.resolve(__dirname, "client", "src"),
        // Se 'shared' e 'attached_assets' sono al livello della root del progetto, questi percorsi sono corretti.
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },

    // 'root' definisce la radice del progetto per Vite.
    // Se la tua applicazione Vite (dove risiede l'index.html principale) è in 'client', è corretto.
    root: path.resolve(__dirname, "client"), 

    build: {
      // 'outDir' è la directory dove Vite depositerà i file di build ottimizzati.
      // 🚀 QUESTA DEVE CORRISPONDERE ESATTAMENTE ALLA 'webDir' NEL TUO capacitor.config.json.
      // Se il tuo capacitor.config.json ha "webDir": "dist/public", allora questa è corretta.
      outDir: path.resolve(__dirname, "dist/public"), 
      
      // 'emptyOutDir: true' è una buona pratica per assicurarsi che la directory di output sia pulita
      // ad ogni build, evitando file orfani da build precedenti.
      emptyOutDir: true,
      
      // Opzionali ma utili per il debug o l'ottimizzazione:
      // sourcemap: false, // Imposta a 'true' se vuoi source maps per il debug in produzione (aumenta le dimensioni)
      // minify: 'esbuild', // O 'terser' per la minificazione del codice
    },

    // Configurazione del server di sviluppo (utile per 'npm run dev')
    server: {
        host: true, // Permette l'accesso da reti esterne (es. cellulare sulla stessa rete)
        port: 5173, // Porta di default di Vite, puoi cambiarla
    }
  };
});
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
>>>>>>> db7c04cba147d03bde4bd27799e1529e59d49af4
