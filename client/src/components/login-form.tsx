import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoginCredentials } from '@/lib/auth';

interface LoginFormProps {
  onRegisterClick: () => void;
}

export function LoginForm({ onRegisterClick }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      await login(credentials);
      toast({
        title: 'Accesso effettuato',
        description: 'Hai effettuato l\'accesso con successo.',
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Errore di accesso',
        description: error.message || 'Si è verificato un errore durante l\'accesso.',
        variant: 'destructive'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center">Accedi</CardTitle>
        <CardDescription className="text-center">
          Inserisci le tue credenziali per accedere al tuo account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              value={credentials.username}
              onChange={handleInputChange}
              className="w-full"
              placeholder="Il tuo username"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={credentials.password}
              onChange={handleInputChange}
              className="w-full"
              placeholder="La tua password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full dark:bg-purple-600 dark:hover:bg-purple-700"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Accesso in corso...' : 'Accedi'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={onRegisterClick}
          >
            Non hai un account? Registrati
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}