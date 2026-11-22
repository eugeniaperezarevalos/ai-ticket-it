import { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "./src/api";

const USUARIO_ID = "1"; // Lucía, la compradora del seed

const COLORES_ESTADO = {
  PENDIENTE: "#f0ad4e",
  CONFIRMADA: "#28a745",
  UTILIZADA: "#6c757d",
  CANCELADA: "#dc3545",
  REEMBOLSADA: "#17a2b8",
};

export default function App() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/usuarios/${USUARIO_ID}/compras`)
      .then((res) => res.json())
      .then((data) => setCompras(data))
      .catch(() => setError("No se pudo conectar con el servidor"))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <ActivityIndicator style={styles.centro} size="large" />;
  }
  if (error) {
    return <Text style={styles.centro}>{error}</Text>;
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mis compras</Text>
      <FlatList
        data={compras}
        keyExtractor={(compra) => compra.id}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.evento}>{item.evento.nombre}</Text>
            <Text>{item.cantidad} x {item.tipoEntrada} — ${item.total}</Text>
            <Text style={[styles.estado, { backgroundColor: COLORES_ESTADO[item.estado] }]}>
              {item.estado}
            </Text>
            {item.diasParaElEvento !== null && (
              <Text style={styles.dias}>Faltan {item.diasParaElEvento} días</Text>
            )}
          </View>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#f2f2f2", paddingTop: 50, paddingHorizontal: 16 },
  centro: { flex: 1, textAlign: "center", textAlignVertical: "center" },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  tarjeta: { backgroundColor: "white", padding: 16, borderRadius: 10, marginBottom: 12 },
  evento: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  estado: { alignSelf: "flex-start", color: "white", fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 8 },
  dias: { marginTop: 6, fontStyle: "italic" },
});