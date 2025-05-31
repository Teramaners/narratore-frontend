import express from "express";
import path from "path";
import session from "express-session";
import MemoryStore from "memorystore";
import apiRoutes from "./shared/api/index.js";
app.use("/api", apiRoutes);

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.resolve();
const MemoryStoreInstance = MemoryStore(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreInstance({ checkPeriod: 86400000 }),
    cookie: { maxAge: 3600000 },
  })
);

// API (opzionale)
app.use("/api", apiRoutes);

// Serve frontend React
app.use(express.static(path.join(__dirname, "dist/public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});