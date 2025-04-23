import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Gestisce la query di autenticazione con maggiore tolleranza per gli errori
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 2, // Ritenta la query in caso di errore
    retryDelay: 1000, // Ritarda il retry di 1 secondo
  });

  // Logga lo stato di autenticazione per debug
  useEffect(() => {
    console.log("Auth state changed:", { 
      user: user?.username || null, 
      isLoading, 
      hasError: !!error 
    });
    
    if (error) {
      console.error("Auth error:", error);
    }
  }, [user, isLoading, error]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Tentativo di login per:", credentials.username);
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login effettuato con successo:", user.username);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login effettuato",
        description: `Benvenuto, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Errore durante il login:", error);
      toast({
        title: "Errore di login",
        description: error.message || "Credenziali non valide",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      console.log("Tentativo di registrazione per:", credentials.username);
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      console.log("Registrazione completata con successo:", user.username);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registrazione completata",
        description: `Benvenuto, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Errore durante la registrazione:", error);
      toast({
        title: "Errore di registrazione",
        description: error.message || "Impossibile creare l'account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Tentativo di logout");
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      console.log("Logout effettuato con successo");
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo",
      });
    },
    onError: (error: Error) => {
      console.error("Errore durante il logout:", error);
      toast({
        title: "Errore di logout",
        description: error.message,
        variant: "destructive",
      });
      
      // Forza il reset dell'auth state anche in caso di errore
      queryClient.setQueryData(["/api/user"], null);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere utilizzato all'interno di un AuthProvider");
  }
  return context;
}