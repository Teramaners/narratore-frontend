"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // Carica le variabili d'ambiente (potrebbe essere prima o dopo l'importazione esplicita)
const dotenv_1 = __importDefault(require("dotenv")); // Questa è la riga che aggiungiamo
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const vite_1 = require("./vite");
// Assicurati che dotenv venga configurato con il percorso corretto
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
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
            (0, vite_1.log)(logLine);
        }
    });
    next();
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const server = yield (0, routes_1.registerRoutes)(app);
        app.use((err, req, res, next) => {
            const status = err.status || err.statusCode || 500;
            const message = err.message || "Internal Server Error";
            res.status(status).json({ message });
            console.error("Errore nel middleware di gestione degli errori:", err);
            // Non rilanciare l'errore qui, altrimenti il processo potrebbe terminare di nuovo
        });
        // importantly only setup vite in development and after
        // setting up all the other routes so the catch-all route
        // doesn't interfere with the other routes
        if (app.get("env") === "development") {
            yield (0, vite_1.setupVite)(app, server);
        }
        else {
            (0, vite_1.serveStatic)(app);
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
            (0, vite_1.log)(`serving on port ${port}`);
        });
    }
    catch (error) {
        console.error("Errore durante l'avvio del server:", error);
        console.error(error); // Stampa l'errore completo
    }
}))();
