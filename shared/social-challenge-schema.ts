import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./schema";

// Tabella delle sfide sui sogni
export const dreamChallenges = pgTable("dream_challenges", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  theme: text("theme").notNull(), // Tema della sfida (es. "Viaggi", "Paure", "Natura")
  promptTemplate: text("prompt_template"), // Template per generare spunti di sogni
  bannerImageUrl: text("banner_image_url"), // URL dell'immagine banner della sfida
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  pointsReward: integer("points_reward").default(10), // Punti di ispirazione guadagnati completando la sfida
  isActive: boolean("is_active").default(true),
  participantCount: integer("participant_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella delle partecipazioni alle sfide
export const challengeParticipations = pgTable("challenge_participations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => dreamChallenges.id).notNull(),
  dreamId: integer("dream_id").references(() => users.id).notNull(), // Riferimento al sogno che partecipa alla sfida
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  status: text("status").default("submitted"), // submitted, approved, featured
  reactionCount: integer("reaction_count").default(0),
  isWinner: boolean("is_winner").default(false),
  pointsEarned: integer("points_earned").default(0),
});

// Tabella delle reazioni ai sogni (like, commenti, ecc.)
export const dreamReactions = pgTable("dream_reactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dreamId: integer("dream_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // like, commento, stella, ispirazione, ecc.
  content: text("content"), // Per i commenti
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -----------------------------
// Schemi di inserimento
// -----------------------------

export const insertDreamChallengeSchema = createInsertSchema(dreamChallenges).pick({
  creatorId: true,
  title: true,
  description: true,
  theme: true,
  promptTemplate: true,
  bannerImageUrl: true,
  startDate: true,
  endDate: true,
  pointsReward: true,
  isActive: true,
});

export type InsertDreamChallenge = z.infer<typeof insertDreamChallengeSchema>;
export type DreamChallenge = typeof dreamChallenges.$inferSelect;

export const insertChallengeParticipationSchema = createInsertSchema(challengeParticipations).pick({
  userId: true,
  challengeId: true,
  dreamId: true,
  status: true,
});

export type InsertChallengeParticipation = z.infer<typeof insertChallengeParticipationSchema>;
export type ChallengeParticipation = typeof challengeParticipations.$inferSelect;

export const insertDreamReactionSchema = createInsertSchema(dreamReactions).pick({
  userId: true,
  dreamId: true,
  type: true,
  content: true,
});

export type InsertDreamReaction = z.infer<typeof insertDreamReactionSchema>;
export type DreamReaction = typeof dreamReactions.$inferSelect;

// -----------------------------
// Definizione delle relazioni
// -----------------------------

export const dreamChallengesRelations = relations(dreamChallenges, ({ one, many }) => ({
  creator: one(users, {
    fields: [dreamChallenges.creatorId],
    references: [users.id],
  }),
  participations: many(challengeParticipations),
}));

export const challengeParticipationsRelations = relations(challengeParticipations, ({ one }) => ({
  user: one(users, {
    fields: [challengeParticipations.userId],
    references: [users.id],
  }),
  challenge: one(dreamChallenges, {
    fields: [challengeParticipations.challengeId],
    references: [dreamChallenges.id],
  }),
}));

export const dreamReactionsRelations = relations(dreamReactions, ({ one }) => ({
  user: one(users, {
    fields: [dreamReactions.userId],
    references: [users.id],
  }),
}));