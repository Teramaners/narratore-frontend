const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // sostituisce body-parser.json()

// Utente di esempio
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

// Avvio del server
app.listen(PORT, () => {
  console.log(`🟢 API server in ascolto su http://localhost:${PORT}`);
});
