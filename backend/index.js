const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
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

// Avvio del server
app.listen(PORT, () => {
  console.log(`🟢 API server in ascolto su http://localhost:${PORT}`);
});