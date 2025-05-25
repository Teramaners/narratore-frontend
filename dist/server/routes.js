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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const storage_1 = require("./storage");
const gemini_1 = require("./gemini");
const dream_symbols_1 = require("./dream-symbols");
const schema_1 = require("@shared/schema");
const zod_1 = require("zod");
const auth_1 = require("./auth");
const path_1 = __importDefault(require("path"));
const social_challenge_1 = require("./social-challenge");
// Middleware per proteggere le rotte che richiedono autenticazione
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Non autorizzato" });
}
function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        // Setup autenticazione (Passport, sessioni, ecc.)
        (0, auth_1.setupAuth)(app);
        // Aggiunge un endpoint alias da /api/me a /api/user per retrocompatibilità
        app.get("/api/me", (req, res) => {
            if (!req.isAuthenticated()) {
                return res.status(401).json({ error: "Non autenticato" });
            }
            // Rimuovi la password dalla risposta
            const _a = req.user, { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
            return res.status(200).json(userWithoutPassword);
        });
        // Endpoint per la generazione di racconti dai sogni
        app.post("/api/genera-racconto", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { sogno, stile, lunghezza, tono, includiTitolo } = req.body;
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
                const result = yield (0, gemini_1.generateStoryFromDream)(sogno, options);
                // Restituisce il racconto generato, includendo il titolo se disponibile
                return res.status(200).json({
                    racconto: result.story,
                    titolo: result.title
                });
            }
            catch (error) {
                console.error("Error generating story:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nella generazione del racconto",
                    details: error.message
                });
            }
        }));
        // Endpoint per la traduzione del sogno in emoji con spiegazioni
        app.post("/api/genera-emoji", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { sogno } = req.body;
                if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
                    return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
                }
                const result = yield (0, gemini_1.generateEmojiTranslation)(sogno);
                // Restituisce tutti i dati della traduzione emoji
                return res.status(200).json({
                    emojiTranslation: result.emojiTranslation,
                    emojiExplanations: result.emojiExplanations || [],
                    emojiMood: result.emojiMood || ""
                });
            }
            catch (error) {
                console.error("Error generating emoji translation:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nella traduzione in emoji",
                    details: error.message
                });
            }
        }));
        // Endpoint per la generazione di immagini dai sogni
        app.post("/api/genera-immagine", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { sogno, racconto, stileArtistico } = req.body;
                if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
                    return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
                }
                if (!racconto || typeof racconto !== "string" || racconto.trim() === "") {
                    return res.status(400).json({ error: "Il racconto del sogno è richiesto" });
                }
                // Genera l'immagine usando lo stile artistico richiesto (o il default)
                const result = yield (0, gemini_1.generateImageFromDream)(sogno, racconto, stileArtistico);
                // Restituisce i dati dell'immagine generata
                return res.status(200).json({
                    imageUrl: result.imageUrl,
                    description: result.description
                });
            }
            catch (error) {
                console.error("Error generating dream image:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nella generazione dell'immagine",
                    details: error.message
                });
            }
        }));
        // Endpoint per ottenere gli stili artistici disponibili
        app.get("/api/stili-artistici", (req, res) => {
            return res.status(200).json(gemini_1.artStyles);
        });
        // Endpoint per ottenere gli stili letterari disponibili
        app.get("/api/stili-letterari", (req, res) => {
            return res.status(200).json(gemini_1.literaryStyles);
        });
        // Serviamo la cartella delle immagini generate
        app.use('/api/dream-images', (req, res, next) => {
            const filePath = path_1.default.resolve('./public/dream-images' + req.path);
            res.sendFile(filePath, (err) => {
                if (err) {
                    console.error('Error serving image:', err);
                    next();
                }
            });
        });
        // Endpoint per l'analisi delle emozioni nel sogno
        app.post("/api/analizza-emozioni", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { sogno, racconto } = req.body;
                if (!sogno || typeof sogno !== "string" || sogno.trim() === "") {
                    return res.status(400).json({ error: "Il contenuto del sogno è richiesto" });
                }
                if (!racconto || typeof racconto !== "string" || racconto.trim() === "") {
                    return res.status(400).json({ error: "Il racconto del sogno è richiesto" });
                }
                const result = yield (0, gemini_1.analyzeEmotionsInDream)(sogno, racconto);
                // Restituisce l'analisi delle emozioni
                return res.status(200).json(result);
            }
            catch (error) {
                console.error("Error analyzing emotions:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nell'analisi delle emozioni",
                    details: error.message
                });
            }
        }));
        // API per i sogni (protette da autenticazione)
        // Ottieni tutti i sogni dell'utente corrente
        app.get("/api/sogni", isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const dreams = yield storage_1.storage.getDreamsByUserId(user.id);
                return res.status(200).json(dreams);
            }
            catch (error) {
                console.error("Error fetching dreams:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nel recupero dei sogni",
                    details: error.message
                });
            }
        }));
        // Ottieni un sogno specifico
        app.get("/api/sogni/:id", isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const user = req.user;
                if (isNaN(id)) {
                    return res.status(400).json({ error: "ID non valido" });
                }
                const dream = yield storage_1.storage.getDream(id);
                if (!dream) {
                    return res.status(404).json({ error: "Sogno non trovato" });
                }
                // Verifica che il sogno appartenga all'utente corrente
                if (dream.userId && dream.userId !== user.id) {
                    return res.status(403).json({ error: "Non autorizzato ad accedere a questo sogno" });
                }
                return res.status(200).json(dream);
            }
            catch (error) {
                console.error("Error fetching dream:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nel recupero del sogno",
                    details: error.message
                });
            }
        }));
        // Crea un nuovo sogno
        app.post("/api/sogni", isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                // Aggiungi l'ID utente ai dati del sogno
                const dreamData = Object.assign(Object.assign({}, req.body), { userId: user.id });
                const validatedData = schema_1.insertDreamSchema.parse(dreamData);
                const newDream = yield storage_1.storage.createDream(validatedData);
                return res.status(201).json(newDream);
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
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
        }));
        // Aggiorna un sogno esistente
        app.put("/api/sogni/:id", isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const user = req.user;
                if (isNaN(id)) {
                    return res.status(400).json({ error: "ID non valido" });
                }
                // Verifica che il sogno appartenga all'utente corrente
                const dream = yield storage_1.storage.getDream(id);
                if (!dream) {
                    return res.status(404).json({ error: "Sogno non trovato" });
                }
                if (dream.userId && dream.userId !== user.id) {
                    return res.status(403).json({ error: "Non autorizzato a modificare questo sogno" });
                }
                const dreamData = req.body;
                const updatedDream = yield storage_1.storage.updateDream(id, dreamData);
                return res.status(200).json(updatedDream);
            }
            catch (error) {
                console.error("Error updating dream:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nell'aggiornamento del sogno",
                    details: error.message
                });
            }
        }));
        // Elimina un sogno
        app.delete("/api/sogni/:id", isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const user = req.user;
                if (isNaN(id)) {
                    return res.status(400).json({ error: "ID non valido" });
                }
                // Verifica che il sogno appartenga all'utente corrente
                const dream = yield storage_1.storage.getDream(id);
                if (!dream) {
                    return res.status(404).json({ error: "Sogno non trovato" });
                }
                if (dream.userId && dream.userId !== user.id) {
                    return res.status(403).json({ error: "Non autorizzato a eliminare questo sogno" });
                }
                const success = yield storage_1.storage.deleteDream(id);
                return res.status(204).send();
            }
            catch (error) {
                console.error("Error deleting dream:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nell'eliminazione del sogno",
                    details: error.message
                });
            }
        }));
        // API per le sfide di ispirazione dei sogni (protette da autenticazione)
        // Ottieni tutte le sfide
        app.get("/api/sfide", (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield social_challenge_1.ChallengeController.getAllChallenges(req, res);
        }));
        // Ottieni una sfida specifica
        app.get("/api/sfide/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield social_challenge_1.ChallengeController.getChallengeById(req, res);
        }));
        // Crea una nuova sfida
        app.post("/api/sfide", isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield social_challenge_1.ChallengeController.createChallenge(req, res);
        }));
        // Aggiorna una sfida esistente
        app.put("/api/sfide/:id", isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield social_challenge_1.ChallengeController.updateChallenge(req, res);
        }));
        // Partecipa a una sfida con un sogno
        app.post("/api/sfide/:id/partecipa", isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield social_challenge_1.ChallengeController.participateInChallenge(req, res);
        }));
        // Ottieni le partecipazioni a una sfida
        app.get("/api/sfide/:id/partecipazioni", (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield social_challenge_1.ChallengeController.getChallengeParticipations(req, res);
        }));
        // Ottieni un prompt di ispirazione per una sfida
        app.get("/api/sfide/:id/prompt", (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield social_challenge_1.ChallengeController.getChallengePrompt(req, res);
        }));
        // Aggiungi una reazione a un sogno
        app.post("/api/sogni/:id/reazioni", isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield social_challenge_1.ChallengeController.reactToDream(req, res);
        }));
        // Ottieni le reazioni a un sogno
        app.get("/api/sogni/:id/reazioni", (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield social_challenge_1.ChallengeController.getDreamReactions(req, res);
        }));
        // API per il dizionario dei simboli dei sogni
        // Estrai i simboli principali da un testo di sogno
        app.post("/api/simboli-sogno/estrai", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { testo, includePositions } = req.body;
                if (!testo || typeof testo !== "string" || testo.trim() === "") {
                    return res.status(400).json({ error: "Il testo del sogno è richiesto" });
                }
                const simboli = yield (0, dream_symbols_1.extractDreamSymbols)(testo, includePositions === true);
                return res.status(200).json(simboli);
            }
            catch (error) {
                console.error("Error extracting dream symbols:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nell'estrazione dei simboli",
                    details: error.message
                });
            }
        }));
        // Ottieni informazioni dettagliate su un simbolo specifico
        app.get("/api/simboli-sogno/:simbolo", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const simbolo = req.params.simbolo;
                if (!simbolo || simbolo.trim() === "") {
                    return res.status(400).json({ error: "Il nome del simbolo è richiesto" });
                }
                const infoSimbolo = yield (0, dream_symbols_1.getDreamSymbolInfo)(simbolo);
                return res.status(200).json(infoSimbolo);
            }
            catch (error) {
                console.error("Error getting dream symbol info:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nel recupero delle informazioni sul simbolo",
                    details: error.message
                });
            }
        }));
        // Ottieni l'elenco delle categorie di simboli nei sogni
        app.get("/api/simboli-sogno/categorie", (req, res) => {
            try {
                return res.status(200).json(dream_symbols_1.dreamSymbolCategories);
            }
            catch (error) {
                console.error("Error getting dream symbol categories:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nel recupero delle categorie dei simboli",
                    details: error.message
                });
            }
        });
        // Endpoint per la generazione di ebook dai sogni
        app.post("/api/genera-ebook", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Gestisce sia i dati JSON che i dati form
                let sogni, titolo, autore;
                if (req.is('application/json')) {
                    // Richiesta JSON normale
                    ({ sogni, titolo, autore } = req.body);
                }
                else {
                    // Richiesta da form
                    try {
                        sogni = JSON.parse(req.body.sogni || '[]');
                        titolo = req.body.titolo;
                        autore = req.body.autore;
                    }
                    catch (parseError) {
                        console.error("Errore nel parsing dei dati del form:", parseError);
                        return res.status(400).json({ error: "Formato dei dati non valido" });
                    }
                }
                if (!sogni || !Array.isArray(sogni) || sogni.length === 0) {
                    return res.status(400).json({ error: "È necessario fornire almeno un sogno" });
                }
                // Prepara i contenuti dell'ebook come HTML semplice
                const title = titolo || "Il Mio Libro dei Sogni";
                const author = autore || "Narratore di Sogni";
                // Costruisci l'HTML completo per la pagina
                let html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    h1 { color: #333; text-align: center; }
    h2 { color: #444; border-bottom: 1px solid #eee; padding-bottom: 0.5em; }
    .dream-content { font-style: italic; margin-bottom: 15px; }
    .dream-story { margin-top: 20px; }
    .emoji-translation { margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; }
    .emoji { font-size: 24px; }
    .metadata { color: #666; font-size: 0.9em; }
    .dream-container { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px dashed #ccc; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p style="text-align: center;">di ${author}</p>
  
  <div class="toc">
    <h2>Indice dei Sogni</h2>
    <ol>
      ${sogni.map((sogno, index) => { var _a; return `<li><a href="#dream-${index + 1}">${sogno.titolo || ((_a = sogno.content) === null || _a === void 0 ? void 0 : _a.substring(0, 30)) || "Sogno senza titolo"}...</a></li>`; }).join('\n      ')}
    </ol>
  </div>

  ${sogni.map((sogno, index) => `
  <div id="dream-${index + 1}" class="dream-container">
    <h2>${sogno.titolo || "Sogno senza titolo"}</h2>
    <div class="dream-content">
      <p>${sogno.content || sogno.testo || ""}</p>
    </div>
    <div class="dream-story">
      <p>${sogno.story || sogno.racconto || ""}</p>
    </div>
    ${sogno.emojiTranslation ? `
    <div class="emoji-translation">
      <h3>Traduzione Emoji</h3>
      <p class="emoji">${sogno.emojiTranslation}</p>
    </div>
    ` : ''}
    <div class="metadata">
      ${sogno.categoria || sogno.category ? `<p><strong>Categoria:</strong> ${sogno.categoria || sogno.category}</p>` : ''}
      ${sogno.emozione || sogno.emotion ? `<p><strong>Emozione:</strong> ${sogno.emozione || sogno.emotion}</p>` : ''}
      ${sogno.createdAt ? `<p><small>Data: ${new Date(sogno.createdAt).toLocaleDateString('it-IT')}</small></p>` : ''}
    </div>
  </div>
  `).join('\n')}
  
  <footer>
    <p style="text-align: center; margin-top: 30px; color: #999;">
      Generato con Narratore di Sogni
    </p>
  </footer>
</body>
</html>`;
                // Invia l'HTML come risposta
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '-')}.html"`);
                return res.send(html);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error("Errore nell'endpoint di generazione ebook:", error);
                return res.status(500).json({
                    error: "Si è verificato un errore nella generazione dell'ebook",
                    details: errorMessage
                });
            }
        }));
        const httpServer = (0, http_1.createServer)(app);
        return httpServer;
    });
}
