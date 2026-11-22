import { Router } from "express";
import { compraController } from "../controllers/compraController.js";

const router = Router();

router.post("/", compraController.realizarCompra);
router.post("/:compraId/cancelar", compraController.cancelarCompra);
router.get("/:compraId/mensajes", compraController.mensajesDeCompra);
router.post("/:compraId/mensajes", compraController.enviarMensaje);
router.post("/:compraId/resenia", compraController.reseniar);

export default router;