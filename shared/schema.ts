import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Tabella utenti
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Campi per il profilo social
  profileImage: text("profile_image"),
  bio: text("bio"),
  challengesCompleted: integer("challenges_completed").default(0),
  dreamsShared: integer("dreams_shared").default(0),
  inspirationPoints: integer("inspiration_points").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  profileImage: true,
  bio: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Tabella dei sogni
export const dreams = pgTable("dreams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  story: text("story").notNull(),
  category: text("category").default("non_categorizzato"),
  emotion: text("emotion").default("neutro"),
  isFavorite: integer("is_favorite").default(0), // Useremo 0 per false, 1 per true
  soundtrack: text("soundtrack"), // Tema musicale associato al sogno
  soundMood: text("sound_mood"), // Umore musicale (allegro, misterioso, inquietante, ecc.)
  emojiTranslation: text("emoji_translation"), // Traduzione del sogno in emoji
  dreamImageUrl: text("dream_image_url"), // URL dell'immagine generata per il sogno
  interpretation: text("interpretation"), // Interpretazione del sogno fornita dall'AI
  symbolism: text("symbolism"), // Simbolismo presente nel sogno identificato dall'AI
  insight: text("insight"), // Approfondimento psicologico sul sogno
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isInChallenge: boolean("is_in_challenge").default(false), // Flag per i sogni che partecipano a sfide
  challengeId: integer("challenge_id"), // ID della sfida a cui partecipa (se applicabile)
});

export const insertDreamSchema = createInsertSchema(dreams).pick({
  userId: true,
  content: true,
  story: true,
  category: true,
  emotion: true,
  isFavorite: true,
  soundtrack: true,
  soundMood: true,
  emojiTranslation: true,
  dreamImageUrl: true,
  interpretation: true,
  symbolism: true,
  insight: true,
  isInChallenge: true,
  challengeId: true,
});

export type InsertDream = z.infer<typeof insertDreamSchema>;
export type Dream = typeof dreams.$inferSelect;

// Prima definiamo le relazioni base per users e dreams
export const usersRelations = relations(users, ({ many }) => ({
  dreams: many(dreams)
}));

export const dreamsRelations = relations(dreams, ({ one }) => ({
  user: one(users, {
    fields: [dreams.userId],
    references: [users.id],
  })
}));
