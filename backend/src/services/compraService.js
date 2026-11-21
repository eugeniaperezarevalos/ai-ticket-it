import { compraRepository, usuarioRepository } from "../repositories/index.js";
import { EstadoCompra } from "../domain/EstadoCompra.js";
import { AppError } from "../errors/AppError.js";

function aDTO(compra) {
  return {
    id: compra.id,
    evento: {
      id: compra.evento.id,
      nombre: compra.evento.nombre,
      fecha: compra.evento.fecha,
    },
    tipoEntrada: compra.tipoEntrada.nombre,
    cantidad: compra.cantidad,
    total: compra.total,
    estado: compra.estado,
    diasParaElEvento:
      compra.estado === EstadoCompra.CONFIRMADA ? compra.diasParaElEvento() : null,
    puedeCancelarse: compra.puedeCancelarse(),
  };
}

export const compraService = {
  comprasDeUsuario(usuarioId) {
    const usuario = usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return compraRepository
      .findAll()
      .filter((compra) => compra.comprador.id === usuario.id)
      .map(aDTO);
  },
};