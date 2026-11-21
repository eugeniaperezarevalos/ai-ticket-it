import { Usuario } from "../domain/Usuario.js";
import { Categoria } from "../domain/Categoria.js";
import { TipoEntrada } from "../domain/TipoEntrada.js";
import { Evento } from "../domain/Evento.js";
import { Compra } from "../domain/Compra.js";
import { Resenia } from "../domain/Resenia.js";
import { EstadoCompra } from "../domain/EstadoCompra.js";
import {
  usuarioRepository,
  categoriaRepository,
  eventoRepository,
  compraRepository,
  reseniaRepository,
} from "../repositories/index.js";

function diasDesdeHoy(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

export function cargarDatosDeEjemplo() {
  // Usuarios
  const lucia = usuarioRepository.save(new Usuario("Lucía", "Gómez"));      // compradora
  const martin = usuarioRepository.save(new Usuario("Martín", "Pérez"));    // organizador
  const sofia = usuarioRepository.save(new Usuario("Sofía", "Ruiz"));       // organizadora

  // Categorias
  const recitales = categoriaRepository.save(new Categoria("Recitales", "Música en vivo"));
  const teatro = categoriaRepository.save(new Categoria("Teatro", "Obras y musicales"));
  const standup = categoriaRepository.save(new Categoria("Stand-up", "Humor en vivo"));

  // Eventos
  const recital = eventoRepository.save(new Evento(
    "Noche de Rock Nacional", "Bandas tributo a los clásicos del rock argentino",
    recitales, diasDesdeHoy(15),
    [new TipoEntrada("General", "Campo", 20000, 100), new TipoEntrada("VIP", "Cerca del escenario", 45000, 10)],
    [], martin
  ));

  const obra = eventoRepository.save(new Evento(
    "La Casa de Bernarda Alba", "Clásico de Lorca en versión moderna",
    teatro, diasDesdeHoy(40),
    [new TipoEntrada("Platea", "Planta baja", 30000, 50), new TipoEntrada("Pullman", "Primer piso", 18000, 80)],
    [], sofia
  ));

  const show = eventoRepository.save(new Evento(
    "Stand-up en el Galpón", "Cuatro comediantes, una noche",
    standup, diasDesdeHoy(-10),   // ya pasó
    [new TipoEntrada("General", "Sin numerar", 12000, 60)],
    [], martin
  ));

  // Compras de Lucia, en distintos estados
  const c1 = compraRepository.save(new Compra(lucia, recital, recital.tiposEntrada[0], 2));
  c1.actualizarEstado(EstadoCompra.CONFIRMADA, lucia);

  compraRepository.save(new Compra(lucia, obra, obra.tiposEntrada[1], 1)); // queda PENDIENTE

  const c3 = compraRepository.save(new Compra(lucia, show, show.tiposEntrada[0], 3));
  c3.actualizarEstado(EstadoCompra.CONFIRMADA, lucia);
  c3.actualizarEstado(EstadoCompra.UTILIZADA, martin);

  // Reseña del evento que ya paso
  reseniaRepository.save(new Resenia(lucia, show, "¡Muy divertido, volvería!", 5));

  console.log(
    `Datos cargados: ${usuarioRepository.findAll().length} usuarios, ` +
    `${eventoRepository.findAll().length} eventos, ${compraRepository.findAll().length} compras`
  );
}