import { Request, Response } from 'express';
import { db } from './db';
import { dreamChallenges, insertDreamChallengeSchema, challengeParticipations, insertChallengeParticipationSchema, dreamReactions, insertDreamReactionSchema } from '../shared/social-challenge-schema';
import { dreams, users } from '../shared/schema';
import { z } from 'zod';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inizializza l'API di Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Funzione per generare un prompt di ispirazione basato sul tema della sfida
export async function generateChallengePrompt(theme: string): Promise<string> {
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
    const result = await model.generateContent([
      systemPrompt
    ]);
    
    const response = result.response;
    const promptText = response.text().trim();

    return promptText;
  } catch (error: any) {
    console.error('Errore nella generazione del prompt:', error);
    return `Immagina un sogno sul tema "${theme}". Quali sensazioni provi? Cosa vedi, senti o percepisci? Come si sviluppa la storia nel tuo sogno?`;
  }
}

// API Controller per le sfide
export const ChallengeController = {
  // Ottieni tutte le sfide attive
  async getAllChallenges(req: Request, res: Response) {
    try {
      const isActive = req.query.active === 'true';
      let challenges;
      
      if (isActive) {
        const now = new Date();
        challenges = await db.select()
          .from(dreamChallenges)
          .where(
            and(
              eq(dreamChallenges.isActive, true),
              lte(dreamChallenges.startDate, now),
              gte(dreamChallenges.endDate, now)
            )
          )
          .orderBy(desc(dreamChallenges.createdAt));
      } else {
        challenges = await db.select()
          .from(dreamChallenges)
          .orderBy(desc(dreamChallenges.createdAt));
      }
      
      return res.status(200).json(challenges);
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
      return res.status(500).json({
        error: "Si è verificato un errore nel recupero delle sfide",
        details: error.message
      });
    }
  },
  
  // Ottieni una sfida specifica
  async getChallengeById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      const [challenge] = await db.select()
        .from(dreamChallenges)
        .where(eq(dreamChallenges.id, id));
      
      if (!challenge) {
        return res.status(404).json({ error: "Sfida non trovata" });
      }
      
      return res.status(200).json(challenge);
    } catch (error: any) {
      console.error('Error fetching challenge:', error);
      return res.status(500).json({
        error: "Si è verificato un errore nel recupero della sfida",
        details: error.message
      });
    }
  },
  
  // Crea una nuova sfida
  async createChallenge(req: Request, res: Response) {
    try {
      const user = req.user as any;
      
      // Valida i dati di input
      const challengeSchema = insertDreamChallengeSchema.extend({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      });
      
      const validatedData = challengeSchema.parse({
        ...req.body,
        creatorId: user.id,
      });
      
      // Genera un prompt template se non fornito
      if (!validatedData.promptTemplate) {
        validatedData.promptTemplate = await generateChallengePrompt(validatedData.theme);
      }
      
      const [challenge] = await db.insert(dreamChallenges)
        .values(validatedData)
        .returning();
      
      return res.status(201).json(challenge);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
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
  },
  
  // Aggiorna una sfida esistente
  async updateChallenge(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as any;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      // Verifica che la sfida esista e appartenga all'utente corrente
      const [challenge] = await db.select()
        .from(dreamChallenges)
        .where(eq(dreamChallenges.id, id));
      
      if (!challenge) {
        return res.status(404).json({ error: "Sfida non trovata" });
      }
      
      if (challenge.creatorId !== user.id) {
        return res.status(403).json({ error: "Non autorizzato a modificare questa sfida" });
      }
      
      // Aggiorna la sfida
      const [updatedChallenge] = await db.update(dreamChallenges)
        .set(req.body)
        .where(eq(dreamChallenges.id, id))
        .returning();
      
      return res.status(200).json(updatedChallenge);
    } catch (error: any) {
      console.error('Error updating challenge:', error);
      return res.status(500).json({
        error: "Si è verificato un errore nell'aggiornamento della sfida",
        details: error.message
      });
    }
  },
  
  // Partecipa a una sfida con un sogno
  async participateInChallenge(req: Request, res: Response) {
    try {
      const challengeId = parseInt(req.params.id);
      const dreamId = parseInt(req.body.dreamId);
      const user = req.user as any;
      
      if (isNaN(challengeId) || isNaN(dreamId)) {
        return res.status(400).json({ error: "ID non validi" });
      }
      
      // Verifica che la sfida esista ed è attiva
      const [challenge] = await db.select()
        .from(dreamChallenges)
        .where(
          and(
            eq(dreamChallenges.id, challengeId),
            eq(dreamChallenges.isActive, true)
          )
        );
      
      if (!challenge) {
        return res.status(404).json({ error: "Sfida non trovata o non attiva" });
      }
      
      const now = new Date();
      if (now < challenge.startDate || now > challenge.endDate) {
        return res.status(400).json({ error: "La sfida non è in corso" });
      }
      
      // Verifica che il sogno esista e appartenga all'utente corrente
      const [dream] = await db.select()
        .from(dreams)
        .where(
          and(
            eq(dreams.id, dreamId),
            eq(dreams.userId, user.id)
          )
        );
      
      if (!dream) {
        return res.status(404).json({ error: "Sogno non trovato o non autorizzato" });
      }
      
      // Verifica che l'utente non abbia già partecipato a questa sfida
      const [existingParticipation] = await db.select()
        .from(challengeParticipations)
        .where(
          and(
            eq(challengeParticipations.userId, user.id),
            eq(challengeParticipations.challengeId, challengeId)
          )
        );
      
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
      
      const [participation] = await db.insert(challengeParticipations)
        .values(participationData)
        .returning();
      
      // Aggiorna il contatore della sfida
      await db.update(dreamChallenges)
        .set({
          participantCount: (challenge.participantCount || 0) + 1
        })
        .where(eq(dreamChallenges.id, challengeId));
      
      // Aggiorna il sogno con il riferimento alla sfida
      await db.update(dreams)
        .set({
          isInChallenge: true,
          challengeId: challengeId
        })
        .where(eq(dreams.id, dreamId));
      
      // Aggiorna i punti dell'utente
      await db.update(users)
        .set({
          challengesCompleted: user.challengesCompleted + 1,
          inspirationPoints: user.inspirationPoints + challenge.pointsReward
        })
        .where(eq(users.id, user.id));
      
      return res.status(201).json({
        message: "Partecipazione alla sfida registrata con successo",
        pointsEarned: challenge.pointsReward,
        participation
      });
    } catch (error: any) {
      console.error('Error participating in challenge:', error);
      return res.status(500).json({
        error: "Si è verificato un errore nella partecipazione alla sfida",
        details: error.message
      });
    }
  },
  
  // Ottieni le partecipazioni a una sfida
  async getChallengeParticipations(req: Request, res: Response) {
    try {
      const challengeId = parseInt(req.params.id);
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      // Ottieni le partecipazioni
      const participations = await db.select({
        participation: challengeParticipations,
        dream: {
          id: dreams.id,
          content: dreams.content,
          story: dreams.story,
          category: dreams.category,
          emotion: dreams.emotion,
          emojiTranslation: dreams.emojiTranslation,
          dreamImageUrl: dreams.dreamImageUrl,
          createdAt: dreams.createdAt
        },
        user: {
          id: users.id,
          username: users.username,
          profileImage: users.profileImage
        }
      })
        .from(challengeParticipations)
        .innerJoin(dreams, eq(challengeParticipations.dreamId, dreams.id))
        .innerJoin(users, eq(challengeParticipations.userId, users.id))
        .where(eq(challengeParticipations.challengeId, challengeId))
        .orderBy(desc(challengeParticipations.submissionDate));
      
      return res.status(200).json(participations);
    } catch (error: any) {
      console.error('Error fetching challenge participations:', error);
      return res.status(500).json({
        error: "Si è verificato un errore nel recupero delle partecipazioni",
        details: error.message
      });
    }
  },
  
  // Ottieni un prompt di ispirazione per una sfida
  async getChallengePrompt(req: Request, res: Response) {
    try {
      const challengeId = parseInt(req.params.id);
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      // Ottieni la sfida
      const [challenge] = await db.select()
        .from(dreamChallenges)
        .where(eq(dreamChallenges.id, challengeId));
      
      if (!challenge) {
        return res.status(404).json({ error: "Sfida non trovata" });
      }
      
      // Se la sfida ha già un prompt template, lo utilizziamo
      let prompt = challenge.promptTemplate;
      
      // Altrimenti, generiamo un nuovo prompt
      if (!prompt) {
        prompt = await generateChallengePrompt(challenge.theme);
        
        // Salva il prompt generato per uso futuro
        await db.update(dreamChallenges)
          .set({ promptTemplate: prompt })
          .where(eq(dreamChallenges.id, challengeId));
      }
      
      return res.status(200).json({ prompt });
    } catch (error: any) {
      console.error('Error getting challenge prompt:', error);
      return res.status(500).json({
        error: "Si è verificato un errore nel recupero del prompt",
        details: error.message
      });
    }
  },
  
  // Aggiungi una reazione a un sogno
  async reactToDream(req: Request, res: Response) {
    try {
      const dreamId = parseInt(req.params.id);
      const user = req.user as any;
      
      if (isNaN(dreamId)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      // Verifica che il sogno esista
      const [dream] = await db.select()
        .from(dreams)
        .where(eq(dreams.id, dreamId));
      
      if (!dream) {
        return res.status(404).json({ error: "Sogno non trovato" });
      }
      
      // Verifica se l'utente ha già reagito in questo modo a questo sogno
      if (req.body.type === 'like') {
        const [existingReaction] = await db.select()
          .from(dreamReactions)
          .where(
            and(
              eq(dreamReactions.userId, user.id),
              eq(dreamReactions.dreamId, dreamId),
              eq(dreamReactions.type, 'like')
            )
          );
        
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
      
      const [reaction] = await db.insert(dreamReactions)
        .values(reactionData)
        .returning();
      
      // Aggiorna il contatore delle reazioni se il sogno è parte di una sfida
      if (dream.isInChallenge && dream.challengeId) {
        const [participation] = await db.select()
          .from(challengeParticipations)
          .where(
            and(
              eq(challengeParticipations.dreamId, dreamId),
              eq(challengeParticipations.challengeId, dream.challengeId)
            )
          );
        
        if (participation) {
          await db.update(challengeParticipations)
            .set({
              reactionCount: (participation.reactionCount || 0) + 1
            })
            .where(eq(challengeParticipations.id, participation.id));
        }
      }
      
      return res.status(201).json(reaction);
    } catch (error: any) {
      console.error('Error reacting to dream:', error);
      return res.status(500).json({
        error: "Si è verificato un errore nella reazione al sogno",
        details: error.message
      });
    }
  },
  
  // Ottieni le reazioni a un sogno
  async getDreamReactions(req: Request, res: Response) {
    try {
      const dreamId = parseInt(req.params.id);
      
      if (isNaN(dreamId)) {
        return res.status(400).json({ error: "ID non valido" });
      }
      
      // Ottieni le reazioni
      const reactions = await db.select({
        reaction: dreamReactions,
        user: {
          id: users.id,
          username: users.username,
          profileImage: users.profileImage
        }
      })
        .from(dreamReactions)
        .innerJoin(users, eq(dreamReactions.userId, users.id))
        .where(eq(dreamReactions.dreamId, dreamId))
        .orderBy(desc(dreamReactions.createdAt));
      
      return res.status(200).json(reactions);
    } catch (error: any) {
      console.error('Error fetching dream reactions:', error);
      return res.status(500).json({
        error: "Si è verificato un errore nel recupero delle reazioni",
        details: error.message
      });
    }
  }
};