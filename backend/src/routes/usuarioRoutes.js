import { Router } from "express";
import { compraController } from "../controllers/compraController.js";

const router = Router();

router.get("/:usuarioId/compras", compraController.comprasDeUsuario);

export default router;