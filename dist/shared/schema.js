"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dreamsRelations = exports.usersRelations = exports.insertDreamSchema = exports.dreams = exports.insertUserSchema = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_1 = require("drizzle-orm");
// Tabella utenti
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    // Campi per il profilo social
    profileImage: (0, pg_core_1.text)("profile_image"),
    bio: (0, pg_core_1.text)("bio"),
    challengesCompleted: (0, pg_core_1.integer)("challenges_completed").default(0),
    dreamsShared: (0, pg_core_1.integer)("dreams_shared").default(0),
    inspirationPoints: (0, pg_core_1.integer)("inspiration_points").default(0),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
    profileImage: true,
    bio: true,
});
// Tabella dei sogni
exports.dreams = (0, pg_core_1.pgTable)("dreams", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id),
    content: (0, pg_core_1.text)("content").notNull(),
    story: (0, pg_core_1.text)("story").notNull(),
    category: (0, pg_core_1.text)("category").default("non_categorizzato"),
    emotion: (0, pg_core_1.text)("emotion").default("neutro"),
    isFavorite: (0, pg_core_1.integer)("is_favorite").default(0), // Useremo 0 per false, 1 per true
    soundtrack: (0, pg_core_1.text)("soundtrack"), // Tema musicale associato al sogno
    soundMood: (0, pg_core_1.text)("sound_mood"), // Umore musicale (allegro, misterioso, inquietante, ecc.)
    emojiTranslation: (0, pg_core_1.text)("emoji_translation"), // Traduzione del sogno in emoji
    dreamImageUrl: (0, pg_core_1.text)("dream_image_url"), // URL dell'immagine generata per il sogno
    interpretation: (0, pg_core_1.text)("interpretation"), // Interpretazione del sogno fornita dall'AI
    symbolism: (0, pg_core_1.text)("symbolism"), // Simbolismo presente nel sogno identificato dall'AI
    insight: (0, pg_core_1.text)("insight"), // Approfondimento psicologico sul sogno
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    isInChallenge: (0, pg_core_1.boolean)("is_in_challenge").default(false), // Flag per i sogni che partecipano a sfide
    challengeId: (0, pg_core_1.integer)("challenge_id"), // ID della sfida a cui partecipa (se applicabile)
});
exports.insertDreamSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dreams).pick({
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
// Prima definiamo le relazioni base per users e dreams
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    dreams: many(exports.dreams)
}));
exports.dreamsRelations = (0, drizzle_orm_1.relations)(exports.dreams, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.dreams.userId],
        references: [exports.users.id],
    })
}));
