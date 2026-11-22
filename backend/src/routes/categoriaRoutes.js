import { Router } from "express";
import { eventoController } from "../controllers/eventoController.js";

const router = Router();

router.get("/", eventoController.categorias);

export default router;