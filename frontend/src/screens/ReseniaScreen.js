import { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { API_URL, USUARIO_ID } from "../api";

export default function ReseniaScreen({ compra, onVolver, onEnviada }) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [detalle, setDetalle] = useState("");

  function enviar() {
    fetch(`${API_URL}/compras/${compra.id}/resenia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: USUARIO_ID, puntuacion: puntuacion, detalle: detalle }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          Alert.alert("No se pudo enviar", data.error);
        } else {
          Alert.alert("¡Gracias!", "Tu reseña fue publicada");
          onEnviada();
        }
      })
      .catch(() => Alert.alert("Error", "No se pudo conectar con el servidor"));
  }

  return (
    <View style={styles.contenedor}>
      <TouchableOpacity onPress={onVolver}>
        <Text style={styles.volver}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Calificar evento</Text>
      <Text style={styles.evento}>{compra.evento.nombre}</Text>

      <View style={styles.estrellas}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setPuntuacion(n)}>
            <Text style={[styles.estrella, n <= puntuacion && styles.estrellaActiva]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Contá cómo fue tu experiencia..."
        value={detalle}
        onChangeText={setDetalle}
        multiline
      />

      <TouchableOpacity
        style={[styles.boton, puntuacion === 0 && styles.botonDeshabilitado]}
        onPress={enviar}
        disabled={puntuacion === 0}
      >
        <Text style={styles.botonTexto}>Enviar reseña</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#f2f2f2", paddingTop: 50, paddingHorizontal: 16 },
  volver: { color: "#007aff", fontSize: 16, marginBottom: 12 },
  titulo: { fontSize: 24, fontWeight: "bold" },
  evento: { fontSize: 18, color: "#555", marginTop: 4, marginBottom: 20 },
  estrellas: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  estrella: { fontSize: 44, color: "#ccc", marginHorizontal: 4 },
  estrellaActiva: { color: "#f5b301" },
  input: { backgroundColor: "white", borderRadius: 10, padding: 12, minHeight: 100, textAlignVertical: "top" },
  boton: { backgroundColor: "#28a745", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 16 },
  botonDeshabilitado: { opacity: 0.4 },
  botonTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
});