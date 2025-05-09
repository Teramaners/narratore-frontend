import { useState } from "react";
// import { useAuth } from "@/hooks/use-auth"; // disattivato perché non usato
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onRegisterClick: () => void;
}

export function LoginForm({ onRegisterClick }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const { loginMutation } = useAuth(); // disattivato
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Login riuscito!");
    } else {
      alert("Credenziali non valide");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nome utente</Label>
        <Input
          id="username"
          placeholder="Il tuo nome utente"
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
          placeholder="La tua password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Accedi
      </Button>

      <div className="text-center">
        <p className="text-sm dark:text-gray-400">
          Non hai un account?{" "}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-primary hover:underline"
          >
            Registrati
          </button>
        </p>
      </div>
    </form>
  );
}
