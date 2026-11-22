import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { API_URL, ORGANIZADOR_ID } from "../api";
import { COLORES_ESTADO } from "../estados";
import ChatScreen from "./ChatScreen";

export default function ComprasEventoScreen({ evento, onVolver }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [compraChat, setCompraChat] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/eventos/${evento.id}/compras?usuarioId=${ORGANIZADOR_ID}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
        } else {
          setDatos(data);
        }
      })
      .catch(() => setError("No se pudo conectar con el servidor"));
  }, [evento.id]);

  if (compraChat) {
    return (
      <ChatScreen
        compraId={compraChat.id}
        usuarioId={ORGANIZADOR_ID}
        titulo={compraChat.comprador}
        onVolver={() => setCompraChat(null)}
      />
    );
  }

  if (error) {
    return <Text style={styles.centro}>{error}</Text>;
  }
  if (!datos) {
    return <ActivityIndicator style={styles.centro} size="large" />;
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ paddingBottom: 30 }}>
      <TouchableOpacity onPress={onVolver}>
        <Text style={styles.volver}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.titulo}>{datos.evento}</Text>

      <Text style={styles.seccion}>Entradas disponibles</Text>
      <View style={styles.fila}>
        {datos.disponiblesPorTipo.map((tipo) => (
          <View key={tipo.tipo} style={styles.disponible}>
            <Text style={styles.disponibleNumero}>{tipo.disponibles}</Text>
            <Text style={styles.detalle}>{tipo.tipo}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.seccion}>Compras ({datos.compras.length})</Text>
      {datos.compras.length === 0 && <Text style={styles.detalle}>Todavía no hay compras</Text>}
      {datos.compras.map((compra) => (
        <View key={compra.id} style={styles.tarjeta}>
          <Text style={styles.comprador}>{compra.comprador}</Text>
          <Text>{compra.cantidad} x {compra.tipoEntrada} — ${compra.total}</Text>
          <Text style={[styles.estado, { backgroundColor: COLORES_ESTADO[compra.estado] }]}>
            {compra.estado}
          </Text>
          <TouchableOpacity style={styles.botonChat} onPress={() => setCompraChat(compra)}>
            <Text style={styles.botonChatTexto}>Mensajes</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#f2f2f2", paddingTop: 50, paddingHorizontal: 16 },
  centro: { flex: 1, textAlign: "center", textAlignVertical: "center" },
  volver: { color: "#007aff", fontSize: 16, marginBottom: 12 },
  titulo: { fontSize: 24, fontWeight: "bold" },
  seccion: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 8 },
  fila: { flexDirection: "row", flexWrap: "wrap" },
  disponible: { backgroundColor: "white", borderRadius: 10, padding: 14, marginRight: 10, marginBottom: 10, alignItems: "center", minWidth: 90 },
  disponibleNumero: { fontSize: 28, fontWeight: "bold" },
  detalle: { color: "#555" },
  tarjeta: { backgroundColor: "white", padding: 16, borderRadius: 10, marginBottom: 12 },
  comprador: { fontSize: 17, fontWeight: "bold", marginBottom: 4 },
  estado: { alignSelf: "flex-start", color: "white", fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 8 },
  botonChat: { marginTop: 12, backgroundColor: "#007aff", padding: 10, borderRadius: 8, alignItems: "center" },
  botonChatTexto: { color: "white", fontWeight: "bold" },
});