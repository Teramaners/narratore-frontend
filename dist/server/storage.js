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
exports.storage = exports.DatabaseStorage = void 0;
const schema_1 = require("@shared/schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
// Implementazione con database PostgreSQL
class DatabaseStorage {
    constructor() {
        // Rimuoviamo il sessionStore per evitare conflitti
    }
    // Metodi per gli utenti
    getUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [user] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
            return user;
        });
    }
    getUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const [user] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
            return user;
        });
    }
    createUser(insertUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const [user] = yield db_1.db.insert(schema_1.users).values(insertUser).returning();
            return user;
        });
    }
    // Metodi per i sogni
    getDream(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [dream] = yield db_1.db.select().from(schema_1.dreams).where((0, drizzle_orm_1.eq)(schema_1.dreams.id, id));
            return dream;
        });
    }
    getDreamsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select().from(schema_1.dreams).where((0, drizzle_orm_1.eq)(schema_1.dreams.userId, userId));
        });
    }
    createDream(dream) {
        return __awaiter(this, void 0, void 0, function* () {
            const [newDream] = yield db_1.db.insert(schema_1.dreams).values(dream).returning();
            return newDream;
        });
    }
    updateDream(id, dreamUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updatedDream] = yield db_1.db
                .update(schema_1.dreams)
                .set(dreamUpdate)
                .where((0, drizzle_orm_1.eq)(schema_1.dreams.id, id))
                .returning();
            return updatedDream;
        });
    }
    deleteDream(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [deletedDream] = yield db_1.db
                .delete(schema_1.dreams)
                .where((0, drizzle_orm_1.eq)(schema_1.dreams.id, id))
                .returning();
            return !!deletedDream;
        });
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
