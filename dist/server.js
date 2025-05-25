"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use(body_parser_1.default.json());
// Endpoint di registrazione
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    console.log('Registrazione:', username, password);
    res.status(200).json({ message: 'Registrazione avvenuta con successo' });
});
// Endpoint di login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login:', username, password);
    res.status(200).json({ message: 'Login effettuato con successo' });
});
// Rotta di base per Render
app.get('/', (req, res) => {
    res.send('Benvenuto nel backend di Narratore di Sogni!');
});
app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});
