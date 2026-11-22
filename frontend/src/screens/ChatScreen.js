import { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Alert } from "react-native";
import { API_URL } from "../api";

export default function ChatScreen({ compraId, usuarioId, titulo, onVolver }) {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");

  function cargarMensajes() {
    fetch(`${API_URL}/compras/${compraId}/mensajes?usuarioId=${usuarioId}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setMensajes(data);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    cargarMensajes();
    const intervalo = setInterval(cargarMensajes, 3000);
    return () => clearInterval(intervalo);
  }, [compraId, usuarioId]);

  function enviar() {
    fetch(`${API_URL}/compras/${compraId}/mensajes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: usuarioId, mensaje: texto }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          Alert.alert("No se pudo enviar", data.error);
        } else {
          setMensajes(data);
          setTexto("");
        }
      })
      .catch(() => Alert.alert("Error", "No se pudo conectar con el servidor"));
  }

  return (
    <KeyboardAvoidingView style={styles.contenedor} behavior="padding">
      <TouchableOpacity onPress={onVolver}>
        <Text style={styles.volver}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.titulo}>Mensajes · {titulo}</Text>

      <FlatList
        data={mensajes}
        keyExtractor={(_, i) => String(i)}
        ListEmptyComponent={<Text style={styles.vacio}>Todavía no hay mensajes</Text>}
        renderItem={({ item }) => {
          const propio = item.autorId === usuarioId;
          return (
            <View style={[styles.burbuja, propio ? styles.propio : styles.ajeno]}>
              {!propio && <Text style={styles.autor}>{item.autor}</Text>}
              <Text style={propio && styles.textoPropio}>{item.mensaje}</Text>
              <Text style={[styles.hora, propio && styles.textoPropio]}>
                {new Date(item.enviado).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.entrada}>
        <TextInput
          style={styles.input}
          placeholder="Escribí un mensaje..."
          value={texto}
          onChangeText={setTexto}
        />
        <TouchableOpacity style={styles.botonEnviar} onPress={enviar}>
          <Text style={styles.botonEnviarTexto}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#f2f2f2", paddingTop: 50, paddingHorizontal: 16 },
  volver: { color: "#007aff", fontSize: 16, marginBottom: 12 },
  titulo: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  vacio: { textAlign: "center", marginTop: 20, color: "#666" },
  burbuja: { maxWidth: "80%", padding: 10, borderRadius: 12, marginBottom: 8 },
  propio: { alignSelf: "flex-end", backgroundColor: "#007aff" },
  ajeno: { alignSelf: "flex-start", backgroundColor: "white" },
  autor: { fontWeight: "bold", marginBottom: 2 },
  textoPropio: { color: "white" },
  hora: { fontSize: 11, color: "#888", marginTop: 4, alignSelf: "flex-end" },
  entrada: { flexDirection: "row", paddingVertical: 10 },
  input: { flex: 1, backgroundColor: "white", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  botonEnviar: { backgroundColor: "#007aff", borderRadius: 20, paddingHorizontal: 16, justifyContent: "center", marginLeft: 8 },
  botonEnviarTexto: { color: "white", fontWeight: "bold" },
});