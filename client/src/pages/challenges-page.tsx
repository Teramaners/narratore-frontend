import { useAuth } from "@/hooks/use-auth";
import DreamChallenges from "@/components/dream-challenge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function ChallengesPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Caricamento...</div>;
  }

  // Se l'utente non è autenticato, mostra un messaggio con invito ad accedere
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-6 text-center p-4">
        <h1 className="text-3xl font-bold">Sfide di Ispirazione dei Sogni</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Partecipa alle sfide, condividi i tuoi sogni più interessanti e ispirati dai sogni degli altri.
        </p>
        <Button onClick={() => navigate("/auth")}>Accedi per partecipare</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <DreamChallenges />
    </div>
  );
}