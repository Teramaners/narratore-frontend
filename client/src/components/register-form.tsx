import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onLoginClick: () => void;
}

export function RegisterForm({ onLoginClick }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { registerMutation } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword) {
      toast({
        title: "Campi mancanti",
        description: "Per favore compila tutti i campi",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Le password non corrispondono",
        description: "Assicurati che le password inserite siano identiche",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate({ 
      username, 
      password,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nome utente</Label>
        <Input
          id="username"
          placeholder="Scegli un nome utente"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Scegli una password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Conferma password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Conferma la tua password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Registrazione in corso...
          </span>
        ) : (
          "Registrati"
        )}
      </Button>
      
      <div className="text-center">
        <p className="text-sm dark:text-gray-400">
          Hai già un account?{" "}
          <button
            type="button"
            onClick={onLoginClick}
            className="text-primary hover:underline"
          >
            Accedi
          </button>
        </p>
      </div>
    </form>
  );
}