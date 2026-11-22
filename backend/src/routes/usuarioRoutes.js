import { Router } from "express";
import { eventoController } from "../controllers/eventoController.js";
import { compraController } from "../controllers/compraController.js";

const router = Router();

router.get("/:usuarioId/compras", compraController.comprasDeUsuario);
router.get("/:usuarioId/eventos", eventoController.eventosDeOrganizador);

export default router;