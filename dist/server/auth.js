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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuth = setupAuth;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const express_session_1 = __importDefault(require("express-session"));
const crypto_1 = require("crypto");
const util_1 = require("util");
const storage_1 = require("./storage");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = (0, crypto_1.randomBytes)(16).toString("hex");
        const buf = (yield scryptAsync(password, salt, 64));
        return `${buf.toString("hex")}.${salt}`;
    });
}
function comparePasswords(supplied, stored) {
    return __awaiter(this, void 0, void 0, function* () {
        // Verifichiamo che la stored password abbia il formato corretto
        if (!stored || !stored.includes(".")) {
            // Se la password è memorizzata in plaintext (caso di test/sviluppo)
            return supplied === stored;
        }
        const [hashed, salt] = stored.split(".");
        const hashedBuf = Buffer.from(hashed, "hex");
        const suppliedBuf = (yield scryptAsync(supplied, salt, 64));
        return (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf);
    });
}
function setupAuth(app) {
    const sessionSettings = {
        secret: process.env.SESSION_SECRET || "narratore-di-sogni-secret",
        resave: false,
        saveUninitialized: false,
        // Non usiamo lo storage.sessionStore che causa problemi
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 giorni
        }
    };
    app.set("trust proxy", 1);
    app.use((0, express_session_1.default)(sessionSettings));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    passport_1.default.use(new passport_local_1.Strategy((username, password, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield storage_1.storage.getUserByUsername(username);
            if (!user || !(yield comparePasswords(password, user.password))) {
                return done(null, false);
            }
            else {
                return done(null, user);
            }
        }
        catch (err) {
            return done(err);
        }
    })));
    passport_1.default.serializeUser((user, done) => done(null, user.id));
    passport_1.default.deserializeUser((id, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield storage_1.storage.getUser(id);
            done(null, user);
        }
        catch (err) {
            done(err);
        }
    }));
    app.post("/api/register", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const existingUser = yield storage_1.storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).json({ error: "Nome utente già esistente" });
            }
            const user = yield storage_1.storage.createUser(Object.assign(Object.assign({}, req.body), { password: yield hashPassword(req.body.password) }));
            req.login(user, (err) => {
                if (err)
                    return next(err);
                res.status(201).json(user);
            });
        }
        catch (err) {
            next(err);
        }
    }));
    app.post("/api/login", (req, res, next) => {
        passport_1.default.authenticate("local", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ error: "Credenziali non valide" });
            }
            req.login(user, (loginErr) => {
                if (loginErr) {
                    return next(loginErr);
                }
                return res.status(200).json(user);
            });
        })(req, res, next);
    });
    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err)
                return next(err);
            res.sendStatus(200);
        });
    });
    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated())
            return res.status(401).json({ error: "Non autenticato" });
        res.json(req.user);
    });
}
