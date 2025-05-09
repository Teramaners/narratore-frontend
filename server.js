// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Simula un database in memoria
let users = [];

app.use(cors());
app.use(bodyParser.json());

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find((u) => u.username === username)) {
    return res.json({ message: "Utente già registrato." });
  }
  users.push({ username, password });
  res.json({ message: "Registrazione completata." });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    res.json({ message: "Login riuscito!" });
  } else {
    res.json({ message: "Credenziali non valide." });
  }
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});