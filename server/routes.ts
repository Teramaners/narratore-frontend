import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStoryFromDream } from "./gemini";
import { insertDreamSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // API per i sogni
  
  // Ottieni tutti i sogni di un utente
  app.get("/api/sogni", async (req, res) => {
    try {
      // Nota: In un'applicazione reale, dovresti ottenere l'ID utente dalla sessione
      // Per scopi dimostrativi, utilizziamo l'ID utente passato come parametro
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "UserId non valido" });
      }
      
      const dreams = await storage.getDreamsByUserId(userId);
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
  app.get("/api/sogni/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      const dream = await storage.getDream(id);
      
      if (!dream) {
        return res.status(404).json({ error: "Sogno non trovato" });
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
  app.post("/api/sogni", async (req, res) => {
    try {
      const dreamData = insertDreamSchema.parse(req.body);
      const newDream = await storage.createDream(dreamData);
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
  app.put("/api/sogni/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      const dreamData = req.body;
      const updatedDream = await storage.updateDream(id, dreamData);
      
      if (!updatedDream) {
        return res.status(404).json({ error: "Sogno non trovato" });
      }
      
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
  app.delete("/api/sogni/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      const success = await storage.deleteDream(id);
      
      if (!success) {
        return res.status(404).json({ error: "Sogno non trovato" });
      }
      
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
