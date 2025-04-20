import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Reindirizza alla home se l'utente è già autenticato
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  // Se il caricamento è ancora in corso, mostra un indicatore
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Se l'utente non è ancora autenticato, mostra il form di login/registrazione
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form di autenticazione */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold dark:text-white">Narratore di Sogni</h1>
            <p className="mt-2 text-lg dark:text-gray-300">
              {isLogin ? "Accedi al tuo account" : "Crea un nuovo account"}
            </p>
          </div>

          {isLogin ? (
            <LoginForm onRegisterClick={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onLoginClick={() => setIsLogin(true)} />
          )}
        </div>
      </div>

      {/* Hero section */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 p-8 flex items-center justify-center">
        <div className="max-w-md text-white">
          <h2 className="text-4xl font-bold mb-4">Trasforma i tuoi sogni in storie</h2>
          <p className="text-lg mb-6">
            Benvenuto su Narratore di Sogni, dove la tua esperienza onirica diventa una storia coinvolgente grazie all'intelligenza artificiale.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Genera narrazioni dai tuoi sogni
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Categorizza e organizza le tue esperienze
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Generi brani musicali personalizzati
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Condividi le tue storie con gli amici
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}