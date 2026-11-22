import { eventoRepository, categoriaRepository, reseniaRepository } from "../repositories/index.js";
import { AppError } from "../errors/AppError.js";

function precioMinimo(evento) {
  return Math.min(...evento.tiposEntrada.map((tipo) => tipo.precio));
}

function reseniasDeOrganizador(organizadorId) {
  return reseniaRepository
    .findAll()
    .filter((resenia) => resenia.evento.organizador.id === organizadorId);
}

function puntajeDeOrganizador(organizadorId) {
  const resenias = reseniasDeOrganizador(organizadorId);
  if (resenias.length === 0) {
    return null;
  }
  const suma = resenias.reduce((total, resenia) => total + resenia.puntuacion, 0);
  return suma / resenias.length;
}

function aDTOResumen(evento) {
  return {
    id: evento.id,
    nombre: evento.nombre,
    categoria: evento.categoria.nombre,
    fecha: evento.fecha,
    precioDesde: precioMinimo(evento),
    organizador: `${evento.organizador.nombre} ${evento.organizador.apellido}`,
    puntajeOrganizador: puntajeDeOrganizador(evento.organizador.id),
  };
}

function aDTODetalle(evento) {
  return {
    ...aDTOResumen(evento),
    descripcion: evento.descripcion,
    multimedia: evento.multimedia,
    tiposEntrada: evento.tiposEntrada.map((tipo) => ({
      id: tipo.id,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      precio: tipo.precio,
      disponibles: tipo.cupo,
    })),
    reseniasOrganizador: reseniasDeOrganizador(evento.organizador.id).map((resenia) => ({
      evento: resenia.evento.nombre,
      comprador: resenia.comprador.nombre,
      puntuacion: resenia.puntuacion,
      detalle: resenia.detalle,
    })),
  };
}

const CRITERIOS_ORDEN = {
  precio: (a, b) => a.precioDesde - b.precioDesde,
  fecha: (a, b) => new Date(a.fecha) - new Date(b.fecha),
  puntaje: (a, b) => (b.puntajeOrganizador ?? 0) - (a.puntajeOrganizador ?? 0),
};

export const eventoService = {
  buscar({ texto, categoriaId, orden }) {
    if (orden && !CRITERIOS_ORDEN[orden]) {
      throw new AppError("Orden inválido. Usá: precio, fecha o puntaje", 400);
    }

    let eventos = eventoRepository.findAll().filter((evento) => evento.fecha > new Date());

    if (texto) {
      const buscado = texto.toLowerCase();
      eventos = eventos.filter(
        (evento) =>
          evento.nombre.toLowerCase().includes(buscado) ||
          evento.descripcion.toLowerCase().includes(buscado)
      );
    }

    if (categoriaId) {
      eventos = eventos.filter((evento) => evento.categoria.id === String(categoriaId));
    }

    const resultado = eventos.map(aDTOResumen);
    if (orden) {
      resultado.sort(CRITERIOS_ORDEN[orden]);
    }
    return resultado;
  },

  detalle(eventoId) {
    const evento = eventoRepository.findById(eventoId);
    if (!evento) {
      throw new AppError("Evento no encontrado", 404);
    }
    return aDTODetalle(evento);
  },

  categorias() {
    return categoriaRepository.findAll();
  },
};