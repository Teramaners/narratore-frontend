const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001; // oppure qualsiasi altra porta libera

app.use(cors());
app.use(bodyParser.json());

// Semplice endpoint di login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'utente' && password === 'password123') {
    res.json({ success: true, token: 'abc123' });
  } else {
    res.status(401).json({ success: false, message: 'Credenziali non valide' });
  }
});
app.get('/', (req, res) => {
  res.send('Il backend è attivo e funzionante!');
});
// Dati utenti di esempio (login semplificato)
const utenti = [
  { email: 'utente@example.com', password: 'password123' }
];

// API di login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const utente = utenti.find(u => u.email === email && u.password === password);

  if (utente) {
    res.json({ success: true, message: 'Login riuscito' });
  } else {
    res.status(401).json({ success: false, message: 'Email o password errati' });
  }
});

app.listen(PORT, () => {
  console.log(`API server in ascolto su http://localhost:${PORT}`);
});
