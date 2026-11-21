export class TipoEntrada {
  constructor(nombre, descripcion, precio, cupo) {
    this.id = null;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.cupo = cupo;
  }

  hayCupoPara(cantidad) {
    return cantidad > 0 && cantidad <= this.cupo;
  }
}