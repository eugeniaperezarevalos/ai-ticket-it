export class Evento {
  constructor(nombre, descripcion, categoria, fecha, tiposEntrada, multimedia, organizador) {
    this.id = null;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.fecha = fecha;
    this.tiposEntrada = tiposEntrada;
    this.tiposEntrada.forEach((tipo, i) => {
      tipo.id = String(i + 1);
    });
    this.multimedia = multimedia;
    this.organizador = organizador;
  }

  tuPrecioEstaEntre(min, max) {
    return this.tiposEntrada.some((t) => t.precio >= min && t.precio <= max);
  }

  buscarTipoEntrada(id) {
    return this.tiposEntrada.find((tipo) => tipo.id === String(id)) ?? null;
  }
}