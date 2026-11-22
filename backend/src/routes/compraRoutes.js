import { Router } from "express";
import { compraController } from "../controllers/compraController.js";

const router = Router();

router.post("/", compraController.realizarCompra);
router.post("/:compraId/cancelar", compraController.cancelarCompra);

export default router;