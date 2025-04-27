import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import ChallengesPage from "@/pages/challenges-page";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/lib/error-boundary";

function Router() {
  const { isLoading } = useAuth();
  
  // Mostra un indicatore di caricamento mentre verifichiamo lo stato di autenticazione
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Caricamento...</span>
      </div>
    );
  }
  
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
          <h1 className="text-2xl font-bold mb-4">Ops! Si è verificato un errore</h1>
          <p className="mb-4 text-center">L'applicazione ha riscontrato un problema imprevisto.</p>
          <button
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md"
            onClick={() => window.location.href = "/"}
          >
            Torna alla home
          </button>
        </div>
      }
    >
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/sfide" component={ChallengesPage} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
