"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotta GET per Render
app.get('/', (req, res) => {
    res.send('Benvenuto nel backend di Narratore di Sogni!');
});
// Endpoint di login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'test@example.com' && password === 'password') {
        res.json({ success: true, token: 'fake-jwt-token' });
    }
    else {
        res.status(401).json({ success: false, message: 'Credenziali non valide' });
    }
});
app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});
