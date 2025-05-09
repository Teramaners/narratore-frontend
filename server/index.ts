import 'dotenv/config'; // Carica le variabili d'ambiente (potrebbe essere prima o dopo l'importazione esplicita)
import dotenv from 'dotenv'; // Questa è la riga che aggiungiamo
import path from "path";
import express from "express";
import { Request, Response, NextFunction } from 'express';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Assicurati che dotenv venga configurato con il percorso corretto
dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = (err as any).status || (err as any).statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error("Errore nel middleware di gestione degli errori:", err);
  // Non rilanciare l'errore qui, altrimenti il processo potrebbe terminare di nuovo
});

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });

  } catch (error) {
    console.error("Errore durante l'avvio del server:", error);
    console.error(error); // Stampa l'errore completo
  }
})();