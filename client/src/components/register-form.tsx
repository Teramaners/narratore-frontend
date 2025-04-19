import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RegisterCredentials } from '@/lib/auth';

interface RegisterFormProps {
  onLoginClick: () => void;
}

export function RegisterForm({ onLoginClick }: RegisterFormProps) {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const { register } = useAuth();
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
    setIsRegistering(true);

    // Verifica che le password corrispondano
    if (credentials.password !== credentials.confirmPassword) {
      toast({
        title: 'Errore di validazione',
        description: 'Le password non corrispondono.',
        variant: 'destructive'
      });
      setIsRegistering(false);
      return;
    }

    try {
      await register(credentials);
      toast({
        title: 'Registrazione completata',
        description: 'Il tuo account è stato creato con successo.',
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Errore di registrazione',
        description: error.message || 'Si è verificato un errore durante la registrazione.',
        variant: 'destructive'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center">Registrazione</CardTitle>
        <CardDescription className="text-center">
          Crea un nuovo account per salvare i tuoi sogni
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
              placeholder="Scegli un username"
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
              placeholder="Crea una password"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Conferma Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={credentials.confirmPassword}
              onChange={handleInputChange}
              className="w-full"
              placeholder="Ripeti la password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full dark:bg-purple-600 dark:hover:bg-purple-700"
            disabled={isRegistering}
          >
            {isRegistering ? 'Registrazione in corso...' : 'Registrati'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={onLoginClick}
          >
            Hai già un account? Accedi
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}