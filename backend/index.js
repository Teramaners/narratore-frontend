import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'https://narratore-frontend.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const utenti = [
  { email: 'utente@example.com', password: 'password123' }
];

app.get('/', (req, res) => {
  res.send('✅ Il backend è attivo e funzionante!');
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const utente = utenti.find(u => u.email === email && u.password === password);

  if (utente) {
    res.status(200).json({ success: true, message: 'Login riuscito', token: 'abc123' });
  } else {
    res.status(401).json({ success: false, message: 'Email o password errati' });
  }
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const utenteEsistente = utenti.find(u => u.email === email);
  if (utenteEsistente) {
    return res.status(409).json({ success: false, message: 'Utente con questa email già registrato' });
  }
  const nuovoUtente = { name, email, password };
  utenti.push(nuovoUtente);
  res.status(201).json({ success: true, message: 'Registrazione avvenuta con successo!', user: { name, email } });
});

// --- NUOVA ROTTA: Aggiunta per il messaggio di benvenuto! ---
// Il tuo frontend cerca questo endpoint, quindi ora il backend lo fornirà.
app.get('/api/hello', (req, res) => {
  res.json({ message: "Ciao dal backend! Sono qui per raccontare storie." });
});
// ----------------------------------------------------------

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🟢 API server in ascolto su porta ${PORT}`);
  console.log(`Accessibile all'URL del backend: https://narratore-backend.onrender.com`);
});