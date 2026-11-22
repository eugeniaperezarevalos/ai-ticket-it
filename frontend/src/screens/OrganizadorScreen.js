import { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { API_URL, ORGANIZADOR_ID } from "../api";
import ComprasEventoScreen from "./ComprasEventoScreen";
import CrearEventoScreen from "./CrearEventoScreen";

export default function OrganizadorScreen() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [creando, setCreando] = useState(false);

  function cargarEventos() {
    fetch(`${API_URL}/usuarios/${ORGANIZADOR_ID}/eventos`)
      .then((res) => res.json())
      .then((data) => setEventos(data))
      .catch(() => setError("No se pudo conectar con el servidor"))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarEventos();
  }, []);

  if (creando) {
    return (
      <CrearEventoScreen
        onVolver={() => setCreando(false)}
        onCreado={() => {
          setCreando(false);
          cargarEventos();
        }}
      />
    );
  }

  if (eventoSeleccionado) {
    return <ComprasEventoScreen evento={eventoSeleccionado} onVolver={() => setEventoSeleccionado(null)} />;
  }
  if (cargando) {
    return <ActivityIndicator style={styles.centro} size="large" />;
  }
  if (error) {
    return <Text style={styles.centro}>{error}</Text>;
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mis eventos</Text>
      <Text style={styles.subtitulo}>Panel del organizador</Text>
      <TouchableOpacity style={styles.botonCrear} onPress={() => setCreando(true)}>
        <Text style={styles.botonCrearTexto}>+ Crear evento</Text>
      </TouchableOpacity>
      <FlatList
        data={eventos}
        keyExtractor={(evento) => evento.id}
        ListEmptyComponent={<Text style={styles.subtitulo}>Todavía no creaste eventos</Text>}
        renderItem={({ item }) => {
          const finalizado = new Date(item.fecha) < new Date();
          return (
            <TouchableOpacity style={styles.tarjeta} onPress={() => setEventoSeleccionado(item)}>
              <Text style={styles.evento}>{item.nombre}</Text>
              <Text style={styles.detalle}>
                {item.categoria} · {new Date(item.fecha).toLocaleDateString("es-AR")}
                {finalizado ? " · Finalizado" : ""}
              </Text>
              <Text style={styles.verCompras}>Ver compras ›</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#f2f2f2", paddingTop: 50, paddingHorizontal: 16 },
  centro: { flex: 1, textAlign: "center", textAlignVertical: "center" },
  titulo: { fontSize: 24, fontWeight: "bold" },
  subtitulo: { color: "#555", marginBottom: 16 },
  tarjeta: { backgroundColor: "white", padding: 16, borderRadius: 10, marginBottom: 12 },
  evento: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  detalle: { color: "#555" },
  verCompras: { color: "#007aff", marginTop: 8, fontWeight: "bold" },
  botonCrear: { backgroundColor: "#28a745", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  botonCrearTexto: { color: "white", fontWeight: "bold" },
});