"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var app = (0, express_1.default)();
var PORT = 3000;
app.use(body_parser_1.default.json());
// Endpoint di registrazione
app.post('/register', function (req, res) {
    var _a = req.body, username = _a.username, password = _a.password;
    console.log('Registrazione:', username, password);
    res.status(200).json({ message: 'Registrazione avvenuta con successo' });
});
// Endpoint di login
app.post('/login', function (req, res) {
    var _a = req.body, username = _a.username, password = _a.password;
    console.log('Login:', username, password);
    res.status(200).json({ message: 'Login effettuato con successo' });
});
// Rotta di base per Render
app.get('/', function (req, res) {
    res.send('Benvenuto nel backend di Narratore di Sogni!');
});
app.listen(PORT, function () {
    console.log("Server avviato su http://localhost:".concat(PORT));
});
