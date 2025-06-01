import express from 'express';
import cors from 'cors';

const app = express();

// --- MODIFICA CHIAVE QUI PER CORS ---
// È FONDAMENTALE specificare l'origine esatta del tuo frontend su Render.
// Questo permette al tuo frontend (su un dominio diverso) di fare richieste al tuo backend.
app.use(cors({
  origin: 'https://narratore-frontend.onrender.com', // <--- QUESTO È IL TUO FRONTEND SU RENDER
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specifica i metodi HTTP che il frontend può usare
  allowedHeaders: ['Content-Type', 'Authorization'], // Specifica gli header che il frontend può inviare
}));

app.use(express.json()); // Middleware per leggere il body delle richieste JSON

// Utente di esempio (per ora un array in memoria, per un vero progetto useresti un Database)
const utenti = [
  { email: 'utente@example.com', password: 'password123' }
];

// Endpoint test
app.get('/', (req, res) => {
  res.send('✅ Il backend è attivo e funzionante!');
});

// Endpoint di login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const utente = utenti.find(u => u.email === email && u.password === password);

  if (utente) {
    res.status(200).json({ success: true, message: 'Login riuscito', token: 'abc123' });
  } else {
    res.status(401).json({ success: false, message: 'Email o password errati' });
  }
});

// --- NUOVO ENDPOINT DI REGISTRAZIONE ---
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  // Controllo semplice per evitare duplicati in questo array di esempio.
  // In un'applicazione reale, useresti una query al database.
  const utenteEsistente = utenti.find(u => u.email === email);
  if (utenteEsistente) {
    // Status 409 Conflict indica che la risorsa (l'utente) esiste già.
    return res.status(409).json({ success: false, message: 'Utente con questa email già registrato' });
  }

  // Creazione del nuovo utente e aggiunta all'array.
  // In un'applicazione reale, salveresti l'utente nel database (e la password criptata!).
  const nuovoUtente = { name, email, password };
  utenti.push(nuovoUtente);

  // Risposta di successo con status 201 Created.
  res.status(201).json({ success: true, message: 'Registrazione avvenuta con successo!', user: { name, email } });
});
// --- FINE NUOVO ENDPOINT DI REGISTRAZIONE ---

// --- MODIFICA CHIAVE QUI PER LA PORTA ---
// Render assegna una porta tramite la variabile d'ambiente 'PORT'.
// È essenziale che il tuo server ascolti su quella porta.
const PORT = process.env.PORT || 3001; // Usa la porta di Render o 3001 per lo sviluppo locale

// Avvio del server
app.listen(PORT, () => {
  console.log(`🟢 API server in ascolto su porta ${PORT}`);
  // Puoi aggiungere un log che mostri l'URL completo su Render per chiarezza
  console.log(`Accessibile all'URL del backend: https://narratore-backend.onrender.com`);
});