import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rotta di test
app.get('/', (req, res) => {
  res.send('Server attivo!');
});

// Rotta messaggio
app.get('/api/messaggio', (req, res) => {
  res.json({ messaggio: 'Benvenuto nel Narratore di Sogni!' });
});

// Rotta di login (POST)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Validazione semplificata (sostituibile con DB reale)
  if (username === 'utente' && password === 'password123') {
    res.json({ success: true, token: 'fake-jwt-token', user: { username } });
  } else {
    res.status(401).json({ success: false, message: 'Credenziali non valide' });
  }
});

// Avvio server
app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});