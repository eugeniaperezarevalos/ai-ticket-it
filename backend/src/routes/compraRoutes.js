import { Router } from "express";
import { compraController } from "../controllers/compraController.js";

const router = Router();

router.post("/", compraController.realizarCompra);

export default router;