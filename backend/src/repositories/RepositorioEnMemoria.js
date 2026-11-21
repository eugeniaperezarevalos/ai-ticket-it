export class RepositorioEnMemoria {
  constructor() {
    this.items = [];
    this.proximoId = 1;
  }

  save(item) {
    if (item.id === null) {
      item.id = String(this.proximoId++);
      this.items.push(item);
    }
    return item;
  }

  findAll() {
    return this.items;
  }

  findById(id) {
    return this.items.find((item) => item.id === String(id)) ?? null;
  }
}