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
});

export const usersRelations = relations(users, ({ many }) => ({
  dreams: many(dreams)
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
  tags: text("tags").array(),
  isFavorite: boolean("is_favorite"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dreamsRelations = relations(dreams, ({ one }) => ({
  user: one(users, {
    fields: [dreams.userId],
    references: [users.id],
  })
}));

export const insertDreamSchema = createInsertSchema(dreams).pick({
  userId: true,
  content: true,
  story: true,
  category: true,
  emotion: true,
  tags: true,
  isFavorite: true,
});

export type InsertDream = z.infer<typeof insertDreamSchema>;
export type Dream = typeof dreams.$inferSelect;
