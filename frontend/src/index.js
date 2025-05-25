const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint di registrazione
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  console.log('Utente registrato:', { name, email });
  return res.status(200).json({ message: 'Registrazione riuscita!' });
});

// Endpoint di login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password richieste' });
  }

  console.log('Login tentato:', { email });
  return res.status(200).json({ message: 'Accesso riuscito!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server in ascolto sulla porta ${PORT}`);
});
