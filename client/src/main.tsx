import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

// Gestione delle eliminazioni tramite ricarica della pagina
// Questo meccanismo di emergenza previene le schermate nere
document.addEventListener("DOMContentLoaded", () => {
  // Controlla se c'è stata una richiesta di eliminazione
  const lastAction = localStorage.getItem("last_action");
  const deleteId = localStorage.getItem("delete_dream_id");
  
  if (lastAction === "delete_dream" && deleteId) {
    console.log("Tentativo di eliminazione del sogno dopo ricarica:", deleteId);
    
    // Rimuovi gli elementi del localStorage per evitare loop
    localStorage.removeItem("last_action");
    localStorage.removeItem("delete_dream_id");
    
    // Effettua l'eliminazione direttamente chiamando l'API
    setTimeout(() => {
      fetch(`/api/sogni/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(response => {
        if (response.ok) {
          console.log("Sogno eliminato con successo dopo ricarica");
          // Ricarica la pagina per aggiornare la UI
          setTimeout(() => {
            window.location.href = "/";
          }, 500);
        } else {
          console.error("Errore nell'eliminazione del sogno dopo ricarica:", response.status);
        }
      }).catch(error => {
        console.error("Errore durante l'eliminazione dopo ricarica:", error);
      });
    }, 1000); // Delay per assicurarsi che tutto sia caricato
  }
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
