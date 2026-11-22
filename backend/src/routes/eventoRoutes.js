import { Router } from "express";
import { eventoController } from "../controllers/eventoController.js";

const router = Router();

router.get("/", eventoController.buscar);
router.get("/:eventoId", eventoController.detalle);

export default router;