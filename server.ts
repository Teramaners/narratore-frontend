import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

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

// Rotta di base per Render
app.get('/', (req: Request, res: Response) => {
  res.send('Benvenuto nel backend di Narratore di Sogni!');
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});