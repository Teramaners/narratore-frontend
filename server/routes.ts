import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { generateStoryFromDream, interpretDream } from "./gemini";
import { insertDreamSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Middleware per proteggere le rotte che richiedono autenticazione
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Non autorizzato" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Rotte di autenticazione
  
  // Registrazione utente
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Controlla se l'utente esiste già
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username già in uso" });
      }
      
      // Crea il nuovo utente
      const newUser = await storage.createUser(userData);
      
      // Rimuovi la password dalla risposta
      const { password, ...userWithoutPassword } = newUser;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dati utente non validi", details: error.errors });
      }
      
      console.error("Error registering user:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nella registrazione dell'utente", 
        details: error.message 
      });
    }
  });
  
  // Login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ error: info.message || "Autenticazione fallita" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Rimuovi la password dalla risposta
        const { password, ...userWithoutPassword } = user;
        
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  
  // Logout
  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ success: true });
    });
  });
  
  // Ottieni l'utente corrente
  app.get("/api/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non autenticato" });
    }
    
    // Rimuovi la password dalla risposta
    const { password, ...userWithoutPassword } = req.user as any;
    
    return res.status(200).json(userWithoutPassword);
  });
  // Endpoint per la generazione di racconti dai sogni
  app.post("/api/genera-racconto", async (req, res) => {
    try {
      const { sogno } = req.body;
      
      if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
        return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
      }

      const result = await generateStoryFromDream(sogno);
      
      // Restituisce il racconto generato
      return res.status(200).json({ racconto: result.story });
    } catch (error: any) {
      console.error("Error generating story:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nella generazione del racconto", 
        details: error.message 
      });
    }
  });
  
  // Endpoint per l'interpretazione dei sogni
  app.post("/api/interpreta-sogno", async (req, res) => {
    try {
      const { sogno } = req.body;
      
      if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
        return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
      }
      
      // Verifica che la chiave API di Gemini sia presente
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ 
          error: "Servizio di interpretazione non disponibile. Chiave API mancante." 
        });
      }
      
      const result = await interpretDream(sogno);
      
      // Restituisce l'interpretazione del sogno
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Error interpreting dream:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nell'interpretazione del sogno", 
        details: error.message 
      });
    }
  });

  // API per i sogni (protette da autenticazione)
  
  // Ottieni tutti i sogni dell'utente corrente
  app.get("/api/sogni", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const dreams = await storage.getDreamsByUserId(user.id);
      return res.status(200).json(dreams);
    } catch (error: any) {
      console.error("Error fetching dreams:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nel recupero dei sogni", 
        details: error.message 
      });
    }
  });
  
  // Ottieni un sogno specifico
  app.get("/api/sogni/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as any;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      const dream = await storage.getDream(id);
      
      if (!dream) {
        return res.status(404).json({ error: "Sogno non trovato" });
      }
      
      // Verifica che il sogno appartenga all'utente corrente
      if (dream.userId && dream.userId !== user.id) {
        return res.status(403).json({ error: "Non autorizzato ad accedere a questo sogno" });
      }
      
      return res.status(200).json(dream);
    } catch (error: any) {
      console.error("Error fetching dream:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nel recupero del sogno", 
        details: error.message 
      });
    }
  });
  
  // Crea un nuovo sogno
  app.post("/api/sogni", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Aggiungi l'ID utente ai dati del sogno
      const dreamData = {
        ...req.body,
        userId: user.id
      };
      
      const validatedData = insertDreamSchema.parse(dreamData);
      const newDream = await storage.createDream(validatedData);
      
      return res.status(201).json(newDream);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dati del sogno non validi", 
          details: error.errors 
        });
      }
      
      console.error("Error creating dream:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nella creazione del sogno", 
        details: error.message 
      });
    }
  });
  
  // Aggiorna un sogno esistente
  app.put("/api/sogni/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as any;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      // Verifica che il sogno appartenga all'utente corrente
      const dream = await storage.getDream(id);
      
      if (!dream) {
        return res.status(404).json({ error: "Sogno non trovato" });
      }
      
      if (dream.userId && dream.userId !== user.id) {
        return res.status(403).json({ error: "Non autorizzato a modificare questo sogno" });
      }
      
      const dreamData = req.body;
      const updatedDream = await storage.updateDream(id, dreamData);
      
      return res.status(200).json(updatedDream);
    } catch (error: any) {
      console.error("Error updating dream:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nell'aggiornamento del sogno", 
        details: error.message 
      });
    }
  });
  
  // Elimina un sogno
  app.delete("/api/sogni/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as any;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      // Verifica che il sogno appartenga all'utente corrente
      const dream = await storage.getDream(id);
      
      if (!dream) {
        return res.status(404).json({ error: "Sogno non trovato" });
      }
      
      if (dream.userId && dream.userId !== user.id) {
        return res.status(403).json({ error: "Non autorizzato a eliminare questo sogno" });
      }
      
      const success = await storage.deleteDream(id);
      
      return res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting dream:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nell'eliminazione del sogno", 
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
