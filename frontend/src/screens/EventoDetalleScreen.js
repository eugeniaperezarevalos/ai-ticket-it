import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { API_URL, USUARIO_ID } from "../api";

export default function EventoDetalleScreen({ eventoId, onVolver }) {
  const [evento, setEvento] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState(null);

  function cargarEvento() {
    fetch(`${API_URL}/eventos/${eventoId}`)
      .then((res) => res.json())
      .then((data) => setEvento(data))
      .catch(() => setError("No se pudo conectar con el servidor"));
  }

  useEffect(() => {
    cargarEvento();
  }, [eventoId]);

  function seleccionarTipo(tipo) {
    setTipoSeleccionado(tipo);
    setCantidad(1);
  }

  function comprar() {
    fetch(`${API_URL}/compras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compradorId: USUARIO_ID,
        eventoId: eventoId,
        tipoEntradaId: tipoSeleccionado.id,
        cantidad: cantidad,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          Alert.alert("No se pudo comprar", data.error);
        } else {
          Alert.alert(
            "¡Compra realizada!",
            `${data.cantidad} x ${data.tipoEntrada} — $${data.total}\nEstado: ${data.estado}`
          );
          setTipoSeleccionado(null);
          setCantidad(1);
          cargarEvento();
        }
      })
      .catch(() => Alert.alert("Error", "No se pudo conectar con el servidor"));
  }

  if (error) {
    return <Text style={styles.centro}>{error}</Text>;
  }
  if (!evento) {
    return <ActivityIndicator style={styles.centro} size="large" />;
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ paddingBottom: 30 }}>
      <TouchableOpacity onPress={onVolver}>
        <Text style={styles.volver}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>{evento.nombre}</Text>
      <Text style={styles.detalle}>
        {evento.categoria} · {new Date(evento.fecha).toLocaleDateString("es-AR")}
      </Text>
      <Text style={styles.descripcion}>{evento.descripcion}</Text>
      <Text style={styles.detalle}>
        Organiza: {evento.organizador} ·{" "}
        {evento.puntajeOrganizador !== null ? `★ ${evento.puntajeOrganizador.toFixed(1)}` : "Sin reseñas"}
      </Text>

      <Text style={styles.seccion}>Entradas</Text>
      {evento.tiposEntrada.map((tipo) => {
        const seleccionado = tipoSeleccionado?.id === tipo.id;
        const agotado = tipo.disponibles === 0;
        return (
          <TouchableOpacity
            key={tipo.id}
            style={[styles.tipo, seleccionado && styles.tipoSeleccionado, agotado && styles.tipoAgotado]}
            onPress={() => seleccionarTipo(tipo)}
            disabled={agotado}
          >
            <Text style={styles.tipoNombre}>{tipo.nombre} — ${tipo.precio}</Text>
            <Text style={styles.detalle}>{tipo.descripcion}</Text>
            <Text style={styles.detalle}>{agotado ? "Agotado" : `Quedan ${tipo.disponibles}`}</Text>
          </TouchableOpacity>
        );
      })}

      {tipoSeleccionado && (
        <View style={styles.compra}>
          <View style={styles.cantidadFila}>
            <TouchableOpacity
              style={styles.botonCantidad}
              onPress={() => setCantidad(cantidad - 1)}
              disabled={cantidad <= 1}
            >
              <Text style={styles.botonCantidadTexto}>−</Text>
            </TouchableOpacity>
            <Text style={styles.cantidad}>{cantidad}</Text>
            <TouchableOpacity
              style={styles.botonCantidad}
              onPress={() => setCantidad(cantidad + 1)}
              disabled={cantidad >= tipoSeleccionado.disponibles}
            >
              <Text style={styles.botonCantidadTexto}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.total}>Total: ${tipoSeleccionado.precio * cantidad}</Text>
          <TouchableOpacity style={styles.botonComprar} onPress={comprar}>
            <Text style={styles.botonComprarTexto}>Comprar</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.seccion}>Reseñas del organizador</Text>
      {evento.reseniasOrganizador.length === 0 ? (
        <Text style={styles.detalle}>Todavía no tiene reseñas</Text>
      ) : (
        evento.reseniasOrganizador.map((resenia, i) => (
          <View key={i} style={styles.resenia}>
            <Text style={styles.tipoNombre}>★ {resenia.puntuacion} — {resenia.evento}</Text>
            <Text>"{resenia.detalle}"</Text>
            <Text style={styles.detalle}>— {resenia.comprador}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#f2f2f2", paddingTop: 50, paddingHorizontal: 16 },
  centro: { flex: 1, textAlign: "center", textAlignVertical: "center" },
  volver: { color: "#007aff", fontSize: 16, marginBottom: 12 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  descripcion: { marginVertical: 8, fontSize: 15 },
  detalle: { color: "#555", marginTop: 2 },
  seccion: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 8 },
  tipo: { backgroundColor: "white", padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 2, borderColor: "transparent" },
  tipoSeleccionado: { borderColor: "#007aff" },
  tipoAgotado: { opacity: 0.5 },
  tipoNombre: { fontWeight: "bold", fontSize: 16 },
  compra: { backgroundColor: "white", padding: 14, borderRadius: 10, marginTop: 4, alignItems: "center" },
  cantidadFila: { flexDirection: "row", alignItems: "center" },
  botonCantidad: { backgroundColor: "#e5e5e5", width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  botonCantidadTexto: { fontSize: 22, fontWeight: "bold" },
  cantidad: { fontSize: 20, marginHorizontal: 20 },
  total: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  botonComprar: { backgroundColor: "#28a745", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8 },
  botonComprarTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
  resenia: { backgroundColor: "white", padding: 12, borderRadius: 10, marginBottom: 8 },
});