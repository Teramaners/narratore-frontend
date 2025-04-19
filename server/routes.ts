import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStoryFromDream } from "./anthropic";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dream to story generation endpoint
  app.post("/api/genera-racconto", async (req, res) => {
    try {
      const { sogno } = req.body;
      
      if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
        return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
      }

      const result = await generateStoryFromDream(sogno);
      
      // This endpoint doesn't need to store the dream, as that's handled client-side
      return res.status(200).json({ racconto: result.story });
    } catch (error: any) {
      console.error("Error generating story:", error);
      return res.status(500).json({ 
        error: "Si è verificato un errore nella generazione del racconto", 
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
