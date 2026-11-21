export class CambioEstadoCompra {
  constructor(estado, quien) {
    this.estado = estado;
    this.quien = quien;
    this.fechaHora = new Date();
  }
}