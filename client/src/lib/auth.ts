import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword?: string;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await apiRequest("POST", "/api/login", credentials);
  return await response.json();
}

export async function register(credentials: RegisterCredentials): Promise<User> {
  // Rimuovi conferma password prima di inviare
  const { confirmPassword, ...userData } = credentials;
  const response = await apiRequest("POST", "/api/register", userData);
  return await response.json();
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/logout");
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/me", {
      credentials: "include"
    });
    
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}