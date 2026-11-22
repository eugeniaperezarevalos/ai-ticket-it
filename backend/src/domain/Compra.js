import { EstadoCompra } from "./EstadoCompra.js";
import { CambioEstadoCompra } from "./CambioEstadoCompra.js";
import { Mensaje } from "./Mensaje.js";

const MS_POR_DIA = 1000 * 60 * 60 * 24;

export class Compra {
  constructor(comprador, evento, tipoEntrada, cantidad) {
    this.id = null;
    this.comprador = comprador;
    this.evento = evento;
    this.tipoEntrada = tipoEntrada;
    this.cantidad = cantidad;
    tipoEntrada.descontarCupo(cantidad);
    this.total = tipoEntrada.precio * cantidad;
    this.estado = EstadoCompra.PENDIENTE;
    this.mensajes = [];
    this.historialEstados = [new CambioEstadoCompra(EstadoCompra.PENDIENTE, comprador)];
  }

  actualizarEstado(nuevoEstado, quien) {
    this.estado = nuevoEstado;
    this.historialEstados.push(new CambioEstadoCompra(nuevoEstado, quien));
  }

  agregarMensaje(usuario, texto) {
    this.mensajes.push(new Mensaje(usuario, texto));
  }

  esParticipante(usuario) {
    return usuario.id === this.comprador.id || usuario.id === this.evento.organizador.id;
  }

  puedeCancelarse(hoy = new Date()) {
    const estadosCancelables = [EstadoCompra.PENDIENTE, EstadoCompra.CONFIRMADA];
    return estadosCancelables.includes(this.estado) && this.evento.fecha > hoy;
  }

  diasParaElEvento(hoy = new Date()) {
    return Math.ceil((this.evento.fecha - hoy) / MS_POR_DIA);
  }

    cancelar(quien) {
    const estabaPaga = this.estado === EstadoCompra.CONFIRMADA;
    this.actualizarEstado(EstadoCompra.CANCELADA, quien);
    if (estabaPaga) {
      this.actualizarEstado(EstadoCompra.REEMBOLSADA, quien);
    }
    this.tipoEntrada.devolverCupo(this.cantidad);
  }
}