import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStoryFromDream, generateEmojiTranslation, generateImageFromDream } from "./gemini";
import { insertDreamSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import path from "path";

// Middleware per proteggere le rotte che richiedono autenticazione
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Non autorizzato" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup autenticazione (Passport, sessioni, ecc.)
  setupAuth(app);

  // Aggiunge un endpoint alias da /api/me a /api/user per retrocompatibilità
  app.get("/api/me", (req, res) => {
    if (!req.isAuthenticated()) {
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
  
  // Endpoint per la traduzione del sogno in emoji
  app.post("/api/genera-emoji", async (req, res) => {
    try {
      const { sogno } = req.body;
      
      if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
        return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
      }

      const result = await generateEmojiTranslation(sogno);
      
      // Restituisce la traduzione emoji
      return res.status(200).json({ emojiTranslation: result.emojiTranslation });
    } catch (error: any) {
      console.error("Error generating emoji translation:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nella traduzione in emoji", 
        details: error.message 
      });
    }
  });
  
  // Endpoint per la generazione di immagini dai sogni
  app.post("/api/genera-immagine", async (req, res) => {
    try {
      const { sogno, racconto } = req.body;
      
      if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
        return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
      }
      
      if (!racconto || typeof racconto !== "string" || racconto.trim() === "") {
        return res.status(400).json({ error: "Il racconto del sogno è richiesto" });
      }

      const result = await generateImageFromDream(sogno, racconto);
      
      // Restituisce l'URL dell'immagine generata
      return res.status(200).json({ imageUrl: result.imageUrl });
    } catch (error: any) {
      console.error("Error generating dream image:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nella generazione dell'immagine", 
        details: error.message 
      });
    }
  });
  
  // Serviamo la cartella delle immagini generate
  app.use('/api/dream-images', (req, res, next) => {
    const filePath = path.resolve('./public/dream-images' + req.path);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving image:', err);
        next();
      }
    });
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
