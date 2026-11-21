export class Evento {
  constructor(nombre, descripcion, categoria, fecha, tiposEntrada, multimedia, organizador) {
    this.id = null;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.fecha = fecha;
    this.tiposEntrada = tiposEntrada;
    this.multimedia = multimedia;
    this.organizador = organizador;
  }

  tuPrecioEstaEntre(min, max) {
    return this.tiposEntrada.some((t) => t.precio >= min && t.precio <= max);
  }
}