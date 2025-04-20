import { users, dreams, type User, type InsertUser, type Dream, type InsertDream } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interfaccia di storage estesa con metodi per i sogni
export interface IStorage {
  // Metodi per gli utenti
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Metodi per i sogni
  getDream(id: number): Promise<Dream | undefined>;
  getDreamsByUserId(userId: number): Promise<Dream[]>;
  createDream(dream: InsertDream): Promise<Dream>;
  updateDream(id: number, dream: Partial<InsertDream>): Promise<Dream | undefined>;
  deleteDream(id: number): Promise<boolean>;
}

// Implementazione con database PostgreSQL
export class DatabaseStorage implements IStorage {
  constructor() {
    // Rimuoviamo il sessionStore per evitare conflitti
  }
  
  // Metodi per gli utenti
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Metodi per i sogni
  async getDream(id: number): Promise<Dream | undefined> {
    const [dream] = await db.select().from(dreams).where(eq(dreams.id, id));
    return dream;
  }
  
  async getDreamsByUserId(userId: number): Promise<Dream[]> {
    return await db.select().from(dreams).where(eq(dreams.userId, userId));
  }
  
  async createDream(dream: InsertDream): Promise<Dream> {
    const [newDream] = await db.insert(dreams).values(dream).returning();
    return newDream;
  }
  
  async updateDream(id: number, dreamUpdate: Partial<InsertDream>): Promise<Dream | undefined> {
    const [updatedDream] = await db
      .update(dreams)
      .set(dreamUpdate)
      .where(eq(dreams.id, id))
      .returning();
    return updatedDream;
  }
  
  async deleteDream(id: number): Promise<boolean> {
    const [deletedDream] = await db
      .delete(dreams)
      .where(eq(dreams.id, id))
      .returning();
    return !!deletedDream;
  }
}

export const storage = new DatabaseStorage();
