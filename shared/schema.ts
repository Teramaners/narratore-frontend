import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const dreams = pgTable("dreams", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  story: text("story").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDreamSchema = createInsertSchema(dreams).pick({
  content: true,
  story: true,
});

export type InsertDream = z.infer<typeof insertDreamSchema>;
export type Dream = typeof dreams.$inferSelect;
