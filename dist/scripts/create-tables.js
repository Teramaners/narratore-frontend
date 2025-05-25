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
// Script per creare le tabelle del database per Social Dream Challenge
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../server/db");
function createTables() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Creazione tabelle per Social Dream Challenge...');
            // Aggiungiamo le tabelle mancanti per il social challenge
            // 1. Tabella dream_challenges
            yield db_1.db.execute((0, drizzle_orm_1.sql) `
      CREATE TABLE IF NOT EXISTS dream_challenges (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        theme TEXT NOT NULL,
        prompt_template TEXT,
        banner_image_url TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        points_reward INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT TRUE,
        participant_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
            // 2. Tabella challenge_participations
            yield db_1.db.execute((0, drizzle_orm_1.sql) `
      CREATE TABLE IF NOT EXISTS challenge_participations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        challenge_id INTEGER NOT NULL REFERENCES dream_challenges(id),
        dream_id INTEGER NOT NULL REFERENCES dreams(id),
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'submitted',
        reaction_count INTEGER DEFAULT 0,
        is_winner BOOLEAN DEFAULT FALSE,
        points_earned INTEGER DEFAULT 0
      )
    `);
            // 3. Tabella dream_reactions
            yield db_1.db.execute((0, drizzle_orm_1.sql) `
      CREATE TABLE IF NOT EXISTS dream_reactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        dream_id INTEGER NOT NULL REFERENCES dreams(id),
        type TEXT NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
            // 4. Aggiungiamo nuovi campi alla tabella dreams
            yield db_1.db.execute((0, drizzle_orm_1.sql) `
      ALTER TABLE dreams
      ADD COLUMN IF NOT EXISTS is_in_challenge BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS challenge_id INTEGER
    `);
            // 5. Aggiungiamo nuovi campi alla tabella users
            yield db_1.db.execute((0, drizzle_orm_1.sql) `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile_image TEXT,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS challenges_completed INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS dreams_shared INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS inspiration_points INTEGER DEFAULT 0
    `);
            console.log('Tabelle create con successo!');
        }
        catch (error) {
            console.error('Errore nella creazione delle tabelle:', error);
        }
        finally {
            process.exit();
        }
    });
}
createTables();
