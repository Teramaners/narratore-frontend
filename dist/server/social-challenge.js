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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeController = void 0;
exports.generateChallengePrompt = generateChallengePrompt;
const db_1 = require("./db");
const social_challenge_schema_1 = require("../shared/social-challenge-schema");
const schema_1 = require("../shared/schema");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const generative_ai_1 = require("@google/generative-ai");
// Inizializza l'API di Google Generative AI
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Funzione per generare un prompt di ispirazione basato sul tema della sfida
function generateChallengePrompt(theme) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
            const systemPrompt = `Sei un "Ispiratore di Sogni", un esperto nel generare spunti creativi per aiutare le persone a sognare o immaginare scenari onirici specifici basati su un tema. 
    
Il tema è: "${theme}".

Genera un breve prompt (60-80 parole massimo) che suggerisca un possibile sogno su questo tema. Il prompt deve:
1. Essere scritto in seconda persona ("Immagina di...")
2. Contenere dettagli sensoriali vividi (visivi, uditivi, olfattivi, ecc.)
3. Includere un elemento di meraviglia o sorpresa
4. Lasciare spazio all'interpretazione personale
5. Essere in italiano e usare un linguaggio evocativo
6. Terminare con una domanda aperta che stimoli l'immaginazione

Esempio di struttura: "Immagina di [situazione iniziale]. Mentre [evento], noti [dettaglio insolito]. [Elemento sensoriale] ti circonda mentre [sviluppo]. Cosa scopri quando [azione finale]?"`;
            // Generate content
            const result = yield model.generateContent([
                systemPrompt
            ]);
            const response = result.response;
            const promptText = response.text().trim();
            return promptText;
        }
        catch (error) {
            console.error('Errore nella generazione del prompt:', error);
            return `Immagina un sogno sul tema "${theme}". Quali sensazioni provi? Cosa vedi, senti o percepisci? Come si sviluppa la storia nel tuo sogno?`;
        }
    });
}
// API Controller per le sfide
exports.ChallengeController = {
    // Ottieni tutte le sfide attive
    getAllChallenges(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isActive = req.query.active === 'true';
                let challenges;
                if (isActive) {
                    const now = new Date();
                    challenges = yield db_1.db.select()
                        .from(social_challenge_schema_1.dreamChallenges)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamChallenges.isActive, true), (0, drizzle_orm_1.lte)(social_challenge_schema_1.dreamChallenges.startDate, now), (0, drizzle_orm_1.gte)(social_challenge_schema_1.dreamChallenges.endDate, now)))
                        .orderBy((0, drizzle_orm_1.desc)(social_challenge_schema_1.dreamChallenges.createdAt));
                }
                else {
                    challenges = yield db_1.db.select()
                        .from(social_challenge_schema_1.dreamChallenges)
                        .orderBy((0, drizzle_orm_1.desc)(social_challenge_schema_1.dreamChallenges.createdAt));
                }
                return res.status(200).json(challenges);
            }
            catch (error) {
                console.error('Error fetching challenges:', error);
                return res.status(500).json({
                    error: "Si è verificato un errore nel recupero delle sfide",
                    details: error.message
                });
            }
        });
    },
    // Ottieni una sfida specifica
    getChallengeById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    return res.status(400).json({ error: "ID non valido" });
                }
                const [challenge] = yield db_1.db.select()
                    .from(social_challenge_schema_1.dreamChallenges)
                    .where((0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamChallenges.id, id));
                if (!challenge) {
                    return res.status(404).json({ error: "Sfida non trovata" });
                }
                return res.status(200).json(challenge);
            }
            catch (error) {
                console.error('Error fetching challenge:', error);
                return res.status(500).json({
                    error: "Si è verificato un errore nel recupero della sfida",
                    details: error.message
                });
            }
        });
    },
    // Crea una nuova sfida
    createChallenge(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                // Valida i dati di input
                const challengeSchema = social_challenge_schema_1.insertDreamChallengeSchema.extend({
                    startDate: zod_1.z.coerce.date(),
                    endDate: zod_1.z.coerce.date(),
                });
                const validatedData = challengeSchema.parse(Object.assign(Object.assign({}, req.body), { creatorId: user.id }));
                // Genera un prompt template se non fornito
                if (!validatedData.promptTemplate) {
                    validatedData.promptTemplate = yield generateChallengePrompt(validatedData.theme);
                }
                const [challenge] = yield db_1.db.insert(social_challenge_schema_1.dreamChallenges)
                    .values(validatedData)
                    .returning();
                return res.status(201).json(challenge);
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        error: "Dati della sfida non validi",
                        details: error.errors
                    });
                }
                console.error('Error creating challenge:', error);
                return res.status(500).json({
                    error: "Si è verificato un errore nella creazione della sfida",
                    details: error.message
                });
            }
        });
    },
    // Aggiorna una sfida esistente
    updateChallenge(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const user = req.user;
                if (isNaN(id)) {
                    return res.status(400).json({ error: "ID non valido" });
                }
                // Verifica che la sfida esista e appartenga all'utente corrente
                const [challenge] = yield db_1.db.select()
                    .from(social_challenge_schema_1.dreamChallenges)
                    .where((0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamChallenges.id, id));
                if (!challenge) {
                    return res.status(404).json({ error: "Sfida non trovata" });
                }
                if (challenge.creatorId !== user.id) {
                    return res.status(403).json({ error: "Non autorizzato a modificare questa sfida" });
                }
                // Aggiorna la sfida
                const [updatedChallenge] = yield db_1.db.update(social_challenge_schema_1.dreamChallenges)
                    .set(req.body)
                    .where((0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamChallenges.id, id))
                    .returning();
                return res.status(200).json(updatedChallenge);
            }
            catch (error) {
                console.error('Error updating challenge:', error);
                return res.status(500).json({
                    error: "Si è verificato un errore nell'aggiornamento della sfida",
                    details: error.message
                });
            }
        });
    },
    // Partecipa a una sfida con un sogno
    participateInChallenge(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const challengeId = parseInt(req.params.id);
                const dreamId = parseInt(req.body.dreamId);
                const user = req.user;
                if (isNaN(challengeId) || isNaN(dreamId)) {
                    return res.status(400).json({ error: "ID non validi" });
                }
                // Verifica che la sfida esista ed è attiva
                const [challenge] = yield db_1.db.select()
                    .from(social_challenge_schema_1.dreamChallenges)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamChallenges.id, challengeId), (0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamChallenges.isActive, true)));
                if (!challenge) {
                    return res.status(404).json({ error: "Sfida non trovata o non attiva" });
                }
                const now = new Date();
                if (now < challenge.startDate || now > challenge.endDate) {
                    return res.status(400).json({ error: "La sfida non è in corso" });
                }
                // Verifica che il sogno esista e appartenga all'utente corrente
                const [dream] = yield db_1.db.select()
                    .from(schema_1.dreams)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dreams.id, dreamId), (0, drizzle_orm_1.eq)(schema_1.dreams.userId, user.id)));
                if (!dream) {
                    return res.status(404).json({ error: "Sogno non trovato o non autorizzato" });
                }
                // Verifica che l'utente non abbia già partecipato a questa sfida
                const [existingParticipation] = yield db_1.db.select()
                    .from(social_challenge_schema_1.challengeParticipations)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(social_challenge_schema_1.challengeParticipations.userId, user.id), (0, drizzle_orm_1.eq)(social_challenge_schema_1.challengeParticipations.challengeId, challengeId)));
                if (existingParticipation) {
                    return res.status(400).json({ error: "Hai già partecipato a questa sfida" });
                }
                // Crea la partecipazione
                const participationData = {
                    userId: user.id,
                    challengeId,
                    dreamId,
                    status: "submitted",
                    pointsEarned: 0,
                };
                const [participation] = yield db_1.db.insert(social_challenge_schema_1.challengeParticipations)
                    .values(participationData)
                    .returning();
                // Aggiorna il contatore della sfida
                yield db_1.db.update(social_challenge_schema_1.dreamChallenges)
                    .set({
                    participantCount: (challenge.participantCount || 0) + 1
                })
                    .where((0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamChallenges.id, challengeId));
                // Aggiorna il sogno con il riferimento alla sfida
                yield db_1.db.update(schema_1.dreams)
                    .set({
                    isInChallenge: true,
                    challengeId: challengeId
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.dreams.id, dreamId));
                // Aggiorna i punti dell'utente
                yield db_1.db.update(schema_1.users)
                    .set({
                    challengesCompleted: user.challengesCompleted + 1,
                    inspirationPoints: user.inspirationPoints + challenge.pointsReward
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
                return res.status(201).json({
                    message: "Partecipazione alla sfida registrata con successo",
                    pointsEarned: challenge.pointsReward,
                    participation
                });
            }
            catch (error) {
                console.error('Error participating in challenge:', error);
                return res.status(500).json({
                    error: "Si è verificato un errore nella partecipazione alla sfida",
                    details: error.message
                });
            }
        });
    },
    // Ottieni le partecipazioni a una sfida
    getChallengeParticipations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const challengeId = parseInt(req.params.id);
                if (isNaN(challengeId)) {
                    return res.status(400).json({ error: "ID non valido" });
                }
                // Ottieni le partecipazioni
                const participations = yield db_1.db.select({
                    participation: social_challenge_schema_1.challengeParticipations,
                    dream: {
                        id: schema_1.dreams.id,
                        content: schema_1.dreams.content,
                        story: schema_1.dreams.story,
                        category: schema_1.dreams.category,
                        emotion: schema_1.dreams.emotion,
                        emojiTranslation: schema_1.dreams.emojiTranslation,
                        dreamImageUrl: schema_1.dreams.dreamImageUrl,
                        createdAt: schema_1.dreams.createdAt
                    },
                    user: {
                        id: schema_1.users.id,
                        username: schema_1.users.username,
                        profileImage: schema_1.users.profileImage
                    }
                })
                    .from(social_challenge_schema_1.challengeParticipations)
                    .innerJoin(schema_1.dreams, (0, drizzle_orm_1.eq)(social_challenge_schema_1.challengeParticipations.dreamId, schema_1.dreams.id))
                    .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(social_challenge_schema_1.challengeParticipations.userId, schema_1.users.id))
                    .where((0, drizzle_orm_1.eq)(social_challenge_schema_1.challengeParticipations.challengeId, challengeId))
                    .orderBy((0, drizzle_orm_1.desc)(social_challenge_schema_1.challengeParticipations.submissionDate));
                return res.status(200).json(participations);
            }
            catch (error) {
                console.error('Error fetching challenge participations:', error);
                return res.status(500).json({
                    error: "Si è verificato un errore nel recupero delle partecipazioni",
                    details: error.message
                });
            }
        });
    },
    // Ottieni un prompt di ispirazione per una sfida
    getChallengePrompt(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const challengeId = parseInt(req.params.id);
                if (isNaN(challengeId)) {
                    return res.status(400).json({ error: "ID non valido" });
                }
                // Ottieni la sfida
                const [challenge] = yield db_1.db.select()
                    .from(social_challenge_schema_1.dreamChallenges)
                    .where((0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamChallenges.id, challengeId));
                if (!challenge) {
                    return res.status(404).json({ error: "Sfida non trovata" });
                }
                // Se la sfida ha già un prompt template, lo utilizziamo
                let prompt = challenge.promptTemplate;
                // Altrimenti, generiamo un nuovo prompt
                if (!prompt) {
                    prompt = yield generateChallengePrompt(challenge.theme);
                    // Salva il prompt generato per uso futuro
                    yield db_1.db.update(social_challenge_schema_1.dreamChallenges)
                        .set({ promptTemplate: prompt })
                        .where((0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamChallenges.id, challengeId));
                }
                return res.status(200).json({ prompt });
            }
            catch (error) {
                console.error('Error getting challenge prompt:', error);
                return res.status(500).json({
                    error: "Si è verificato un errore nel recupero del prompt",
                    details: error.message
                });
            }
        });
    },
    // Aggiungi una reazione a un sogno
    reactToDream(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dreamId = parseInt(req.params.id);
                const user = req.user;
                if (isNaN(dreamId)) {
                    return res.status(400).json({ error: "ID non valido" });
                }
                // Verifica che il sogno esista
                const [dream] = yield db_1.db.select()
                    .from(schema_1.dreams)
                    .where((0, drizzle_orm_1.eq)(schema_1.dreams.id, dreamId));
                if (!dream) {
                    return res.status(404).json({ error: "Sogno non trovato" });
                }
                // Verifica se l'utente ha già reagito in questo modo a questo sogno
                if (req.body.type === 'like') {
                    const [existingReaction] = yield db_1.db.select()
                        .from(social_challenge_schema_1.dreamReactions)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamReactions.userId, user.id), (0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamReactions.dreamId, dreamId), (0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamReactions.type, 'like')));
                    if (existingReaction) {
                        return res.status(400).json({ error: "Hai già messo like a questo sogno" });
                    }
                }
                // Crea la reazione
                const reactionData = {
                    userId: user.id,
                    dreamId,
                    type: req.body.type,
                    content: req.body.content,
                };
                const [reaction] = yield db_1.db.insert(social_challenge_schema_1.dreamReactions)
                    .values(reactionData)
                    .returning();
                // Aggiorna il contatore delle reazioni se il sogno è parte di una sfida
                if (dream.isInChallenge && dream.challengeId) {
                    const [participation] = yield db_1.db.select()
                        .from(social_challenge_schema_1.challengeParticipations)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(social_challenge_schema_1.challengeParticipations.dreamId, dreamId), (0, drizzle_orm_1.eq)(social_challenge_schema_1.challengeParticipations.challengeId, dream.challengeId)));
                    if (participation) {
                        yield db_1.db.update(social_challenge_schema_1.challengeParticipations)
                            .set({
                            reactionCount: (participation.reactionCount || 0) + 1
                        })
                            .where((0, drizzle_orm_1.eq)(social_challenge_schema_1.challengeParticipations.id, participation.id));
                    }
                }
                return res.status(201).json(reaction);
            }
            catch (error) {
                console.error('Error reacting to dream:', error);
                return res.status(500).json({
                    error: "Si è verificato un errore nella reazione al sogno",
                    details: error.message
                });
            }
        });
    },
    // Ottieni le reazioni a un sogno
    getDreamReactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dreamId = parseInt(req.params.id);
                if (isNaN(dreamId)) {
                    return res.status(400).json({ error: "ID non valido" });
                }
                // Ottieni le reazioni
                const reactions = yield db_1.db.select({
                    reaction: social_challenge_schema_1.dreamReactions,
                    user: {
                        id: schema_1.users.id,
                        username: schema_1.users.username,
                        profileImage: schema_1.users.profileImage
                    }
                })
                    .from(social_challenge_schema_1.dreamReactions)
                    .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamReactions.userId, schema_1.users.id))
                    .where((0, drizzle_orm_1.eq)(social_challenge_schema_1.dreamReactions.dreamId, dreamId))
                    .orderBy((0, drizzle_orm_1.desc)(social_challenge_schema_1.dreamReactions.createdAt));
                return res.status(200).json(reactions);
            }
            catch (error) {
                console.error('Error fetching dream reactions:', error);
                return res.status(500).json({
                    error: "Si è verificato un errore nel recupero delle reazioni",
                    details: error.message
                });
            }
        });
    }
};
