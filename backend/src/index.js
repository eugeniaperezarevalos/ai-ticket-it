import express from "express";
import { cargarDatosDeEjemplo } from "./data/seed.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

cargarDatosDeEjemplo();

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});