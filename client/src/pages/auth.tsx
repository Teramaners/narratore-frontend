import { useState } from 'react';
import { Moon } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { RegisterForm } from '@/components/register-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/authContext';
import { Navigate } from 'wouter';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900 dark:from-indigo-900 dark:to-purple-900 light:from-blue-100 light:to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 dark:from-indigo-900 dark:to-purple-900 light:from-blue-100 light:to-purple-100 p-4 md:p-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-12">
          <div className="flex items-center">
            <Moon className="h-6 w-6 md:h-8 md:w-8 mr-2 dark:text-yellow-200 light:text-indigo-600" />
            <h1 className="text-2xl md:text-3xl font-bold dark:text-white light:text-gray-800">Narratore di Sogni</h1>
            <span className="hidden sm:inline-block ml-2 px-2 py-1 rounded text-xs dark:bg-purple-700 dark:text-purple-200 light:bg-indigo-100 light:text-indigo-600">
              Powered by Gemini
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-md">
            {isLogin ? (
              <LoginForm onRegisterClick={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onLoginClick={() => setIsLogin(true)} />
            )}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-white dark:text-purple-200 light:text-indigo-800">
              Accedi o registrati per iniziare a salvare i tuoi sogni e trasformarli in storie.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm dark:text-purple-300 light:text-indigo-500">
          <p>Narratore di Sogni © 2025 - Powered by Gemini AI</p>
          <p className="mt-1">Trasforma i tuoi sogni in storie uniche con l'intelligenza artificiale</p>
        </div>
      </div>
    </div>
  );
}