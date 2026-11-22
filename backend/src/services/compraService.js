import { EstadoCompra } from "../domain/EstadoCompra.js";
import { compraRepository, usuarioRepository, eventoRepository, reseniaRepository } from "../repositories/index.js";
import { Compra } from "../domain/Compra.js";
import { AppError } from "../errors/AppError.js";
import { Resenia } from "../domain/Resenia.js";

function yaFueReseniada(compra) {
  return reseniaRepository
    .findAll()
    .some((resenia) => resenia.comprador.id === compra.comprador.id && resenia.evento.id === compra.evento.id);
}

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
    puedeReseniar: compra.estado === EstadoCompra.UTILIZADA && !yaFueReseniada(compra),
  };
}

function aDTOMensaje(mensaje) {
  return {
    autorId: mensaje.usuario.id,
    autor: `${mensaje.usuario.nombre} ${mensaje.usuario.apellido}`,
    mensaje: mensaje.mensaje,
    enviado: mensaje.enviado,
  };
}

function buscarCompraParaChat(compraId, usuarioId) {
  const compra = compraRepository.findById(compraId);
  if (!compra) {
    throw new AppError("Compra no encontrada", 404);
  }
  const usuario = usuarioRepository.findById(usuarioId);
  if (!usuario) {
    throw new AppError("Usuario no encontrado", 404);
  }
  if (!compra.esParticipante(usuario)) {
    throw new AppError("Solo el comprador o el organizador pueden usar este chat", 403);
  }
  return { compra, usuario };
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
  realizarCompra({ compradorId, eventoId, tipoEntradaId, cantidad }) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new AppError("La cantidad debe ser un número entero mayor a 0", 400);
    }

    const comprador = usuarioRepository.findById(compradorId);
    if (!comprador) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const evento = eventoRepository.findById(eventoId);
    if (!evento) {
      throw new AppError("Evento no encontrado", 404);
    }
    if (evento.fecha <= new Date()) {
      throw new AppError("El evento ya se realizó", 422);
    }

    const tipoEntrada = evento.buscarTipoEntrada(tipoEntradaId);
    if (!tipoEntrada) {
      throw new AppError("Tipo de entrada no encontrado", 404);
    }
    if (!tipoEntrada.hayCupoPara(cantidad)) {
      throw new AppError(`Solo quedan ${tipoEntrada.cupo} entradas ${tipoEntrada.nombre}`, 422);
    }

    const compra = compraRepository.save(new Compra(comprador, evento, tipoEntrada, cantidad));
    return aDTO(compra);
  },

    cancelarCompra(compraId, usuarioId) {
    const compra = compraRepository.findById(compraId);
    if (!compra) {
      throw new AppError("Compra no encontrada", 404);
    }
    if (compra.comprador.id !== String(usuarioId)) {
      throw new AppError("Solo el comprador puede cancelar la compra", 403);
    }
    if (!compra.puedeCancelarse()) {
      throw new AppError("La compra no se puede cancelar: ya fue utilizada, ya estaba cancelada o el evento ya se realizó", 422);
    }

    compra.cancelar(compra.comprador);
    return aDTO(compra);
  },
    mensajesDeCompra(compraId, usuarioId) {
    const { compra } = buscarCompraParaChat(compraId, usuarioId);
    return compra.mensajes.map(aDTOMensaje);
  },

  enviarMensaje(compraId, usuarioId, texto) {
    if (!texto || texto.trim() === "") {
      throw new AppError("El mensaje no puede estar vacío", 400);
    }
    const { compra, usuario } = buscarCompraParaChat(compraId, usuarioId);
    compra.agregarMensaje(usuario, texto.trim());
    return compra.mensajes.map(aDTOMensaje);
  },
  reseniar(compraId, { usuarioId, puntuacion, detalle }) {
    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      throw new AppError("La puntuación debe ser un número entero entre 1 y 5", 400);
    }
    if (!detalle || detalle.trim() === "") {
      throw new AppError("El comentario no puede estar vacío", 400);
    }

    const compra = compraRepository.findById(compraId);
    if (!compra) {
      throw new AppError("Compra no encontrada", 404);
    }
    if (compra.comprador.id !== String(usuarioId)) {
      throw new AppError("Solo el comprador puede calificar el evento", 403);
    }
    if (compra.estado !== EstadoCompra.UTILIZADA) {
      throw new AppError("Solo se puede calificar un evento después de usar la entrada", 422);
    }
    if (yaFueReseniada(compra)) {
      throw new AppError("Ya calificaste este evento", 422);
    }

    const resenia = reseniaRepository.save(
      new Resenia(compra.comprador, compra.evento, detalle.trim(), puntuacion)
    );
    return {
      id: resenia.id,
      evento: compra.evento.nombre,
      puntuacion: resenia.puntuacion,
      detalle: resenia.detalle,
    };
  },
};