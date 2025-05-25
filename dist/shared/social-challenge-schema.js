"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dreamReactionsRelations = exports.challengeParticipationsRelations = exports.dreamChallengesRelations = exports.insertDreamReactionSchema = exports.insertChallengeParticipationSchema = exports.insertDreamChallengeSchema = exports.dreamReactions = exports.challengeParticipations = exports.dreamChallenges = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("./schema");
// Tabella delle sfide sui sogni
exports.dreamChallenges = (0, pg_core_1.pgTable)("dream_challenges", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    creatorId: (0, pg_core_1.integer)("creator_id").references(() => schema_1.users.id),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    theme: (0, pg_core_1.text)("theme").notNull(), // Tema della sfida (es. "Viaggi", "Paure", "Natura")
    promptTemplate: (0, pg_core_1.text)("prompt_template"), // Template per generare spunti di sogni
    bannerImageUrl: (0, pg_core_1.text)("banner_image_url"), // URL dell'immagine banner della sfida
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    pointsReward: (0, pg_core_1.integer)("points_reward").default(10), // Punti di ispirazione guadagnati completando la sfida
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    participantCount: (0, pg_core_1.integer)("participant_count").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Tabella delle partecipazioni alle sfide
exports.challengeParticipations = (0, pg_core_1.pgTable)("challenge_participations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => schema_1.users.id).notNull(),
    challengeId: (0, pg_core_1.integer)("challenge_id").references(() => exports.dreamChallenges.id).notNull(),
    dreamId: (0, pg_core_1.integer)("dream_id").references(() => schema_1.users.id).notNull(), // Riferimento al sogno che partecipa alla sfida
    submissionDate: (0, pg_core_1.timestamp)("submission_date").defaultNow().notNull(),
    status: (0, pg_core_1.text)("status").default("submitted"), // submitted, approved, featured
    reactionCount: (0, pg_core_1.integer)("reaction_count").default(0),
    isWinner: (0, pg_core_1.boolean)("is_winner").default(false),
    pointsEarned: (0, pg_core_1.integer)("points_earned").default(0),
});
// Tabella delle reazioni ai sogni (like, commenti, ecc.)
exports.dreamReactions = (0, pg_core_1.pgTable)("dream_reactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => schema_1.users.id).notNull(),
    dreamId: (0, pg_core_1.integer)("dream_id").references(() => schema_1.users.id).notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // like, commento, stella, ispirazione, ecc.
    content: (0, pg_core_1.text)("content"), // Per i commenti
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// -----------------------------
// Schemi di inserimento
// -----------------------------
exports.insertDreamChallengeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dreamChallenges).pick({
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
exports.insertChallengeParticipationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.challengeParticipations).pick({
    userId: true,
    challengeId: true,
    dreamId: true,
    status: true,
});
exports.insertDreamReactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dreamReactions).pick({
    userId: true,
    dreamId: true,
    type: true,
    content: true,
});
// -----------------------------
// Definizione delle relazioni
// -----------------------------
exports.dreamChallengesRelations = (0, drizzle_orm_1.relations)(exports.dreamChallenges, ({ one, many }) => ({
    creator: one(schema_1.users, {
        fields: [exports.dreamChallenges.creatorId],
        references: [schema_1.users.id],
    }),
    participations: many(exports.challengeParticipations),
}));
exports.challengeParticipationsRelations = (0, drizzle_orm_1.relations)(exports.challengeParticipations, ({ one }) => ({
    user: one(schema_1.users, {
        fields: [exports.challengeParticipations.userId],
        references: [schema_1.users.id],
    }),
    challenge: one(exports.dreamChallenges, {
        fields: [exports.challengeParticipations.challengeId],
        references: [exports.dreamChallenges.id],
    }),
}));
exports.dreamReactionsRelations = (0, drizzle_orm_1.relations)(exports.dreamReactions, ({ one }) => ({
    user: one(schema_1.users, {
        fields: [exports.dreamReactions.userId],
        references: [schema_1.users.id],
    }),
}));
