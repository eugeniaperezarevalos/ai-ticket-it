import { eventoService } from "../services/eventoService.js";

export const eventoController = {
  buscar(req, res, next) {
    try {
      res.json(eventoService.buscar(req.query));
    } catch (error) {
      next(error);
    }
  },

  detalle(req, res, next) {
    try {
      res.json(eventoService.detalle(req.params.eventoId));
    } catch (error) {
      next(error);
    }
  },

  categorias(req, res, next) {
    try {
      res.json(eventoService.categorias());
    } catch (error) {
      next(error);
    }
  },

  eventosDeOrganizador(req, res, next) {
    try {
      res.json(eventoService.eventosDeOrganizador(req.params.usuarioId));
    } catch (error) {
      next(error);
    }
  },

  comprasDeEvento(req, res, next) {
    try {
      res.json(eventoService.comprasDeEvento(req.params.eventoId, req.query.usuarioId));
    } catch (error) {
      next(error);
    }
  },
};