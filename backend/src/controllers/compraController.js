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
  realizarCompra(req, res, next) {
    try {
      const compra = compraService.realizarCompra(req.body);
      res.status(201).json(compra);
    } catch (error) {
      next(error);
    }
  },
  cancelarCompra(req, res, next) {
    try {
      const compra = compraService.cancelarCompra(req.params.compraId, req.body.usuarioId);
      res.json(compra);
    } catch (error) {
      next(error);
    }
  },
    mensajesDeCompra(req, res, next) {
    try {
      res.json(compraService.mensajesDeCompra(req.params.compraId, req.query.usuarioId));
    } catch (error) {
      next(error);
    }
  },

  enviarMensaje(req, res, next) {
    try {
      const mensajes = compraService.enviarMensaje(req.params.compraId, req.body.usuarioId, req.body.mensaje);
      res.status(201).json(mensajes);
    } catch (error) {
      next(error);
    }
  },
};