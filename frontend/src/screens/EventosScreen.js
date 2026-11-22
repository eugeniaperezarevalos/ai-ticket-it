import { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { API_URL } from "../api";
import EventoDetalleScreen from "./EventoDetalleScreen";

const ORDENES = [
  { valor: null, etiqueta: "Ninguno" },
  { valor: "precio", etiqueta: "Precio" },
  { valor: "fecha", etiqueta: "Fecha" },
  { valor: "puntaje", etiqueta: "Puntaje" },
];

function Chip({ etiqueta, activo, onPress }) {
  return (
    <TouchableOpacity style={[styles.chip, activo && styles.chipActivo]} onPress={onPress}>
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{etiqueta}</Text>
    </TouchableOpacity>
  );
}

export default function EventosScreen() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [texto, setTexto] = useState("");
  const [categoriaId, setCategoriaId] = useState(null);
  const [orden, setOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch(() => setError("No se pudo conectar con el servidor"));
  }, []);

  useEffect(() => {
    const filtros = [];
    if (texto) filtros.push(`texto=${encodeURIComponent(texto)}`);
    if (categoriaId) filtros.push(`categoriaId=${categoriaId}`);
    if (orden) filtros.push(`orden=${orden}`);

    fetch(`${API_URL}/eventos?${filtros.join("&")}`)
      .then((res) => res.json())
      .then((data) => {
        setEventos(data);
        setError(null);
      })
      .catch(() => setError("No se pudo conectar con el servidor"))
      .finally(() => setCargando(false));
  }, [texto, categoriaId, orden]);

  if (eventoSeleccionado) {
    return (
      <EventoDetalleScreen
        eventoId={eventoSeleccionado}
        onVolver={() => setEventoSeleccionado(null)}
      />
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Eventos</Text>

      <TextInput
        style={styles.buscador}
        placeholder="Buscar eventos..."
        value={texto}
        onChangeText={setTexto}
      />

      <View style={styles.fila}>
        <Chip etiqueta="Todas" activo={categoriaId === null} onPress={() => setCategoriaId(null)} />
        {categorias.map((categoria) => (
          <Chip
            key={categoria.id}
            etiqueta={categoria.nombre}
            activo={categoriaId === categoria.id}
            onPress={() => setCategoriaId(categoria.id)}
          />
        ))}
      </View>

      <View style={styles.fila}>
        <Text style={styles.ordenarLabel}>Ordenar por:</Text>
        {ORDENES.map((opcion) => (
          <Chip
            key={opcion.etiqueta}
            etiqueta={opcion.etiqueta}
            activo={orden === opcion.valor}
            onPress={() => setOrden(opcion.valor)}
          />
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(evento) => evento.id}
          ListEmptyComponent={<Text style={styles.vacio}>No se encontraron eventos</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.tarjeta} onPress={() => setEventoSeleccionado(item.id)}>
              <Text style={styles.evento}>{item.nombre}</Text>
              <Text style={styles.detalle}>
                {item.categoria} · {new Date(item.fecha).toLocaleDateString("es-AR")}
              </Text>
              <Text style={styles.precio}>Desde ${item.precioDesde}</Text>
              <Text style={styles.detalle}>
                Organiza: {item.organizador} ·{" "}
                {item.puntajeOrganizador !== null ? `★ ${item.puntajeOrganizador.toFixed(1)}` : "Sin reseñas"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#f2f2f2", paddingTop: 50, paddingHorizontal: 16 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  buscador: { backgroundColor: "white", borderRadius: 10, padding: 12, marginBottom: 10 },
  fila: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginBottom: 8 },
  ordenarLabel: { marginRight: 6, color: "#555" },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "white", marginRight: 6, marginBottom: 6 },
  chipActivo: { backgroundColor: "#007aff" },
  chipTexto: { color: "#333" },
  chipTextoActivo: { color: "white", fontWeight: "bold" },
  error: { color: "#dc3545", marginBottom: 8 },
  vacio: { textAlign: "center", marginTop: 20, color: "#666" },
  tarjeta: { backgroundColor: "white", padding: 16, borderRadius: 10, marginBottom: 12 },
  evento: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  detalle: { color: "#555", marginTop: 2 },
  precio: { fontWeight: "bold", marginTop: 4 },
});