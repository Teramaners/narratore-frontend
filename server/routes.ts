import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  generateStoryFromDream, 
  generateEmojiTranslation, 
  generateImageFromDream, 
  analyzeEmotionsInDream,
  artStyles 
} from "./gemini";
import {
  extractDreamSymbols,
  getDreamSymbolInfo,
  dreamSymbolCategories
} from "./dream-symbols";
import { insertDreamSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import path from "path";
import { ChallengeController } from "./social-challenge";

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
      const { 
        sogno, 
        stile, 
        lunghezza, 
        tono, 
        includiTitolo 
      } = req.body;
      
      if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
        return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
      }

      // Opzioni di generazione
      const options = {
        style: stile,
        length: lunghezza,
        tone: tono,
        includeTitle: includiTitolo
      };

      const result = await generateStoryFromDream(sogno, options);
      
      // Restituisce il racconto generato, includendo il titolo se disponibile
      return res.status(200).json({ 
        racconto: result.story,
        titolo: result.title
      });
    } catch (error: any) {
      console.error("Error generating story:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nella generazione del racconto", 
        details: error.message 
      });
    }
  });
  
  // Endpoint per la traduzione del sogno in emoji con spiegazioni
  app.post("/api/genera-emoji", async (req, res) => {
    try {
      const { sogno } = req.body;
      
      if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
        return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
      }

      const result = await generateEmojiTranslation(sogno);
      
      // Restituisce tutti i dati della traduzione emoji
      return res.status(200).json({
        emojiTranslation: result.emojiTranslation,
        emojiExplanations: result.emojiExplanations || [],
        emojiMood: result.emojiMood || ""
      });
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
      const { sogno, racconto, stileArtistico } = req.body;
      
      if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
        return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
      }
      
      if (!racconto || typeof racconto !== "string" || racconto.trim() === "") {
        return res.status(400).json({ error: "Il racconto del sogno è richiesto" });
      }

      // Genera l'immagine usando lo stile artistico richiesto (o il default)
      const result = await generateImageFromDream(sogno, racconto, stileArtistico);
      
      // Restituisce i dati dell'immagine generata
      return res.status(200).json({
        imageUrl: result.imageUrl,
        description: result.description
      });
    } catch (error: any) {
      console.error("Error generating dream image:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nella generazione dell'immagine", 
        details: error.message 
      });
    }
  });
  
  // Endpoint per ottenere gli stili artistici disponibili
  app.get("/api/stili-artistici", (req, res) => {
    return res.status(200).json(artStyles);
  });
  
  // Endpoint per ottenere gli stili letterari disponibili
  app.get("/api/stili-letterari", (req, res) => {
    return res.status(200).json(literaryStyles);
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
  
  // Endpoint per l'analisi delle emozioni nel sogno
  app.post("/api/analizza-emozioni", async (req, res) => {
    try {
      const { sogno, racconto } = req.body;
      
      if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
        return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
      }
      
      if (!racconto || typeof racconto !== "string" || racconto.trim() === "") {
        return res.status(400).json({ error: "Il racconto del sogno è richiesto" });
      }
      
      const result = await analyzeEmotionsInDream(sogno, racconto);
      
      // Restituisce l'analisi delle emozioni
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Error analyzing emotions:", error);
      return res.status(500).json({
        error: "Si è verificato un errore nell'analisi delle emozioni",
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

  // API per le sfide di ispirazione dei sogni (protette da autenticazione)
  
  // Ottieni tutte le sfide
  app.get("/api/sfide", async (req, res) => {
    await ChallengeController.getAllChallenges(req, res);
  });
  
  // Ottieni una sfida specifica
  app.get("/api/sfide/:id", async (req, res) => {
    await ChallengeController.getChallengeById(req, res);
  });
  
  // Crea una nuova sfida
  app.post("/api/sfide", isAuthenticated, async (req, res) => {
    await ChallengeController.createChallenge(req, res);
  });
  
  // Aggiorna una sfida esistente
  app.put("/api/sfide/:id", isAuthenticated, async (req, res) => {
    await ChallengeController.updateChallenge(req, res);
  });
  
  // Partecipa a una sfida con un sogno
  app.post("/api/sfide/:id/partecipa", isAuthenticated, async (req, res) => {
    await ChallengeController.participateInChallenge(req, res);
  });
  
  // Ottieni le partecipazioni a una sfida
  app.get("/api/sfide/:id/partecipazioni", async (req, res) => {
    await ChallengeController.getChallengeParticipations(req, res);
  });
  
  // Ottieni un prompt di ispirazione per una sfida
  app.get("/api/sfide/:id/prompt", async (req, res) => {
    await ChallengeController.getChallengePrompt(req, res);
  });
  
  // Aggiungi una reazione a un sogno
  app.post("/api/sogni/:id/reazioni", isAuthenticated, async (req, res) => {
    await ChallengeController.reactToDream(req, res);
  });
  
  // Ottieni le reazioni a un sogno
  app.get("/api/sogni/:id/reazioni", async (req, res) => {
    await ChallengeController.getDreamReactions(req, res);
  });

  // API per il dizionario dei simboli dei sogni
  
  // Estrai i simboli principali da un testo di sogno
  app.post("/api/simboli-sogno/estrai", async (req, res) => {
    try {
      const { testo, includePositions } = req.body;
      
      if (!testo || typeof testo !== "string" || testo.trim() === "") {
        return res.status(400).json({ error: "Il testo del sogno è richiesto" });
      }
      
      const simboli = await extractDreamSymbols(testo, includePositions === true);
      return res.status(200).json(simboli);
    } catch (error: any) {
      console.error("Error extracting dream symbols:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nell'estrazione dei simboli", 
        details: error.message 
      });
    }
  });
  
  // Ottieni informazioni dettagliate su un simbolo specifico
  app.get("/api/simboli-sogno/:simbolo", async (req, res) => {
    try {
      const simbolo = req.params.simbolo;
      
      if (!simbolo || simbolo.trim() === "") {
        return res.status(400).json({ error: "Il nome del simbolo è richiesto" });
      }
      
      const infoSimbolo = await getDreamSymbolInfo(simbolo);
      return res.status(200).json(infoSimbolo);
    } catch (error: any) {
      console.error("Error getting dream symbol info:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nel recupero delle informazioni sul simbolo", 
        details: error.message 
      });
    }
  });
  
  // Ottieni l'elenco delle categorie di simboli nei sogni
  app.get("/api/simboli-sogno/categorie", (req, res) => {
    try {
      return res.status(200).json(dreamSymbolCategories);
    } catch (error: any) {
      console.error("Error getting dream symbol categories:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nel recupero delle categorie dei simboli", 
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
