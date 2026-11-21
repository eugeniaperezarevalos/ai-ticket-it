import express from "express";
import { cargarDatosDeEjemplo } from "./data/seed.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/usuarios", usuarioRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode ?? 500;
  res.status(status).json({ error: err.message });
});

cargarDatosDeEjemplo();

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});