import { compraService } from "../services/compraService.js";

export const compraController = {
  comprasDeUsuario(req, res, next) {
    try {
      const compras = compraService.comprasDeUsuario(req.params.usuarioId);
      res.json(compras);
    } catch (error) {
      next(error);
    }
  },
};