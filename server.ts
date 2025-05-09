// server.ts

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json()); // oppure puoi usare direttamente: app.use(express.json());

// Endpoint di registrazione
app.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log('Registrazione:', username, password);
  res.status(200).json({ message: 'Registrazione avvenuta con successo' });
});

// Endpoint di login
app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log('Login:', username, password);
  res.status(200).json({ message: 'Login effettuato con successo' });
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});