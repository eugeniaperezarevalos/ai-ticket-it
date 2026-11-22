import { Router } from "express";
import { eventoController } from "../controllers/eventoController.js";

const router = Router();

router.get("/", eventoController.buscar);
router.get("/:eventoId", eventoController.detalle);
router.get("/:eventoId/compras", eventoController.comprasDeEvento);
router.post("/", eventoController.crear);

export default router;