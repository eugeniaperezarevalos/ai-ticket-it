import { eventoRepository, categoriaRepository, reseniaRepository, usuarioRepository, compraRepository } from "../repositories/index.js";
import { AppError } from "../errors/AppError.js";
import { Evento } from "../domain/Evento.js";
import { TipoEntrada } from "../domain/TipoEntrada.js";

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

  eventosDeOrganizador(organizadorId) {
    const organizador = usuarioRepository.findById(organizadorId);
    if (!organizador) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return eventoRepository
      .findAll()
      .filter((evento) => evento.organizador.id === organizador.id)
      .map(aDTOResumen);
  },

  comprasDeEvento(eventoId, usuarioId) {
    const evento = eventoRepository.findById(eventoId);
    if (!evento) {
      throw new AppError("Evento no encontrado", 404);
    }
    if (evento.organizador.id !== String(usuarioId)) {
      throw new AppError("Solo el organizador puede ver las compras del evento", 403);
    }

    return {
      evento: evento.nombre,
      disponiblesPorTipo: evento.tiposEntrada.map((tipo) => ({
        tipo: tipo.nombre,
        disponibles: tipo.cupo,
      })),
      compras: compraRepository
        .findAll()
        .filter((compra) => compra.evento.id === evento.id)
        .map((compra) => ({
          id: compra.id,
          comprador: `${compra.comprador.nombre} ${compra.comprador.apellido}`,
          tipoEntrada: compra.tipoEntrada.nombre,
          cantidad: compra.cantidad,
          total: compra.total,
          estado: compra.estado,
        })),
    };
  },

  crear({ organizadorId, nombre, descripcion, categoriaId, fecha, tiposEntrada, multimedia }) {
    if (!nombre || nombre.trim() === "") {
      throw new AppError("El nombre es obligatorio", 400);
    }

    const fechaEvento = new Date(fecha);
    if (!fecha || isNaN(fechaEvento.getTime())) {
      throw new AppError("La fecha no es válida", 400);
    }
    if (fechaEvento <= new Date()) {
      throw new AppError("La fecha del evento tiene que ser futura", 422);
    }

    if (!Array.isArray(tiposEntrada) || tiposEntrada.length === 0) {
      throw new AppError("El evento tiene que tener al menos un tipo de entrada", 400);
    }
    for (const tipo of tiposEntrada) {
      if (!tipo.nombre || tipo.nombre.trim() === "") {
        throw new AppError("Cada tipo de entrada necesita un nombre", 400);
      }
      if (typeof tipo.precio !== "number" || tipo.precio <= 0) {
        throw new AppError(`El precio de "${tipo.nombre}" tiene que ser mayor a 0`, 400);
      }
      if (!Number.isInteger(tipo.cupo) || tipo.cupo <= 0) {
        throw new AppError(`El cupo de "${tipo.nombre}" tiene que ser un número entero mayor a 0`, 400);
      }
    }
    const nombresTipos = tiposEntrada.map((tipo) => tipo.nombre.trim().toLowerCase());
    if (new Set(nombresTipos).size !== nombresTipos.length) {
      throw new AppError("No puede haber dos tipos de entrada con el mismo nombre", 400);
    }

    const organizador = usuarioRepository.findById(organizadorId);
    if (!organizador) {
      throw new AppError("Organizador no encontrado", 404);
    }
    const categoria = categoriaRepository.findById(categoriaId);
    if (!categoria) {
      throw new AppError("Categoría no encontrada", 404);
    }

    const evento = eventoRepository.save(
      new Evento(
        nombre.trim(),
        (descripcion ?? "").trim(),
        categoria,
        fechaEvento,
        tiposEntrada.map(
          (tipo) => new TipoEntrada(tipo.nombre.trim(), (tipo.descripcion ?? "").trim(), tipo.precio, tipo.cupo)
        ),
        multimedia ?? [],
        organizador
      )
    );
    return aDTODetalle(evento);
  },
};