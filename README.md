# AI Ticket It

Plataforma de venta de entradas para eventos: los organizadores publican eventos con distintos tipos de entrada y los compradores buscan, compran, chatean con el organizador y califican la experiencia.

Trabajo Práctico Individual de Desarrollo con IA, Desarrollo de Software, UTN FRBA, 2C 2026.

## Tecnologías

- **Back-End:** Node.js + Express, arquitectura en capas (routes → controllers → services → repositories → domain), persistencia en memoria.
- **Front-End:** React Native con Expo, ejecutado en un celular con Expo Go.

## Cómo ejecutarlo

Requisitos: Node.js 20 o superior y la app **Expo Go** en el celular. La compu y el celular tienen que estar en la misma red WiFi.

### 1. Back-End

```bash
cd backend
npm install
npm run dev
```

El servidor queda escuchando en `http://localhost:3000`. Al arrancar se cargan datos de ejemplo (`src/data/seed.js`). Como la persistencia es en memoria, **cada reinicio vuelve a los datos iniciales**.

### 2. Front-End

1. En `frontend/src/api.js`, reemplazar la IP de `API_URL` por la IP local de la compu (se ve con `ipconfig` en Windows).
2. Ejecutar:

```bash
cd frontend
npm install
npx expo start
```

3. Escanear el código QR con Expo Go.

> Si el celular no se conecta, verificar que Windows tenga la red WiFi marcada como **privada** y que el firewall permita Node.js.

## Estructura

```
backend/src/
├── domain/          Entidades y reglas de negocio (Compra, Evento, TipoEntrada, ...)
├── repositories/    Repositorio genérico en memoria
├── services/        Lógica de cada caso de uso y validaciones
├── controllers/     Reciben la request y devuelven la respuesta
├── routes/          Endpoints
├── errors/          AppError (errores con código HTTP)
└── data/seed.js     Datos de ejemplo

frontend/
├── App.js           Menú inferior y navegación entre pestañas
└── src/
    ├── api.js       URL del back y usuarios de la demo
    ├── estados.js   Colores por estado de compra
    └── screens/     Una pantalla por archivo
```

## Usuarios de la demo

No hay login. La app tiene tres pestañas:

| Pestaña | Usuario |
|---|---|
| Eventos / Mis compras | Lucía Gómez (id 1), compradora |
| Organizador | Martín Pérez (id 2), organizador |

Sofía Ruiz (id 3) es otra organizadora del seed.

## Casos de uso implementados

| Caso de uso | Pantalla | Endpoint |
|---|---|---|
| Ver mis compras con su estado y días restantes | Mis compras | `GET /usuarios/:id/compras` |
| Organizador: compras de un evento y entradas disponibles | Organizador → evento | `GET /eventos/:id/compras` |
| Buscar eventos por texto o categoría | Eventos | `GET /eventos?texto=&categoriaId=` |
| Crear evento con tipos de entrada | Organizador → Crear evento | `POST /eventos` |
| Chat de la compra (comprador y organizador) | Mensajes | `GET` y `POST /compras/:id/mensajes` |
| Cancelar compra con reembolso | Mis compras | `POST /compras/:id/cancelar` |
| Calificar evento después de usar la entrada | Mis compras → Calificar | `POST /compras/:id/resenia` |
| Ver reseñas del organizador | Detalle del evento | `GET /eventos/:id` |
| Ordenar por precio, fecha o puntaje | Eventos | `GET /eventos?orden=` |
| Comprar sin superar el cupo | Detalle del evento | `POST /compras` |

## Decisiones de diseño

- **Reglas de negocio en el dominio:** `Compra.puedeCancelarse()`, `Compra.cancelar()`, `TipoEntrada.hayCupoPara()`. El cupo se descuenta en el constructor de `Compra` y se devuelve al cancelar, así no se puede crear una compra sin reservar el cupo.
- **Cancelación:** si la compra estaba PENDIENTE (no pagada) queda CANCELADA. Si estaba CONFIRMADA (pagada) pasa a CANCELADA y luego a REEMBOLSADA. No se puede cancelar si está UTILIZADA o si el evento ya ocurrió.
- **El back es la fuente de verdad:** devuelve `puedeCancelarse` y `puedeReseniar`, y el front solo muestra u oculta los botones. Todas las validaciones se hacen en el back aunque el front también limite algunas cosas (por ejemplo, la cantidad máxima).
- **Códigos HTTP:** 400 para datos mal formados, 403 para acciones de otro usuario, 404 para recursos inexistentes, 422 para reglas de negocio incumplidas.
- **DTOs:** las respuestas incluyen solo lo que necesita cada pantalla, sin exponer las entidades completas.
- **Historial de estados:** cada cambio de estado de una compra queda registrado (`CambioEstadoCompra`). Se omitió la referencia a la compra que aparece en el diagrama para evitar una referencia circular al convertir a JSON.
- **Precio de un evento para ordenar:** el del tipo de entrada más barato ("desde $X").
- **Puntaje del organizador:** promedio de las reseñas de todos sus eventos. Se permite una reseña por comprador y evento.
- **Fechas:** se envían como hora local (`2026-12-20T21:00`, sin `Z`) para evitar que el evento aparezca un día antes por la diferencia con UTC.
- **Chat:** se actualiza consultando al back cada 3 segundos (*polling*), en lugar de WebSockets, por simplicidad.
- **Navegación:** con estado de React (`useState`) en lugar de una librería de navegación, porque la app tiene pocas pantallas.
