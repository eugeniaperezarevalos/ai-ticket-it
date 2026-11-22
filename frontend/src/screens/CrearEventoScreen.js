import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView } from "react-native";
import { API_URL, ORGANIZADOR_ID } from "../api";

const TIPO_VACIO = { nombre: "", descripcion: "", precio: "", cupo: "" };

export default function CrearEventoScreen({ onVolver, onCreado }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("21:00");
  const [tipos, setTipos] = useState([{ ...TIPO_VACIO }]);

  useEffect(() => {
    fetch(`${API_URL}/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch(() => Alert.alert("Error", "No se pudieron cargar las categorías"));
  }, []);

  function actualizarTipo(indice, campo, valor) {
    setTipos(tipos.map((tipo, i) => (i === indice ? { ...tipo, [campo]: valor } : tipo)));
  }

  function agregarTipo() {
    setTipos([...tipos, { ...TIPO_VACIO }]);
  }

  function quitarTipo(indice) {
    setTipos(tipos.filter((_, i) => i !== indice));
  }

  function crear() {
    if (!categoriaId) {
      Alert.alert("Falta la categoría", "Elegí una categoría para el evento");
      return;
    }

    fetch(`${API_URL}/eventos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizadorId: ORGANIZADOR_ID,
        nombre: nombre,
        descripcion: descripcion,
        categoriaId: categoriaId,
        fecha: `${fecha}T${hora}`,
        tiposEntrada: tipos.map((tipo) => ({
          nombre: tipo.nombre,
          descripcion: tipo.descripcion,
          precio: Number(tipo.precio),
          cupo: Number(tipo.cupo),
        })),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          Alert.alert("No se pudo crear el evento", data.error);
        } else {
          Alert.alert("¡Evento creado!", data.nombre);
          onCreado();
        }
      })
      .catch(() => Alert.alert("Error", "No se pudo conectar con el servidor"));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView style={styles.contenedor} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={onVolver}>
          <Text style={styles.volver}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Crear evento</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej: Fiesta de Fin de Año" />

        <Text style={styles.label}>Descripción</Text>
        <TextInput style={[styles.input, { minHeight: 70 }]} value={descripcion} onChangeText={setDescripcion} multiline />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.fila}>
          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria.id}
              style={[styles.chip, categoriaId === categoria.id && styles.chipActivo]}
              onPress={() => setCategoriaId(categoria.id)}
            >
              <Text style={categoriaId === categoria.id ? styles.chipTextoActivo : null}>{categoria.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.fila}>
          <View style={{ flex: 2, marginRight: 8 }}>
            <Text style={styles.label}>Fecha (AAAA-MM-DD)</Text>
            <TextInput style={styles.input} value={fecha} onChangeText={setFecha} placeholder="2026-12-31" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Hora</Text>
            <TextInput style={styles.input} value={hora} onChangeText={setHora} placeholder="21:00" />
          </View>
        </View>

        <Text style={styles.seccion}>Tipos de entrada</Text>
        {tipos.map((tipo, indice) => (
          <View key={indice} style={styles.tipo}>
            <View style={styles.tipoEncabezado}>
              <Text style={styles.tipoTitulo}>Tipo {indice + 1}</Text>
              {tipos.length > 1 && (
                <TouchableOpacity onPress={() => quitarTipo(indice)}>
                  <Text style={styles.quitar}>Quitar</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nombre (General, Platea, VIP...)"
              value={tipo.nombre}
              onChangeText={(valor) => actualizarTipo(indice, "nombre", valor)}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción (opcional)"
              value={tipo.descripcion}
              onChangeText={(valor) => actualizarTipo(indice, "descripcion", valor)}
            />
            <View style={styles.fila}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Precio"
                keyboardType="numeric"
                value={tipo.precio}
                onChangeText={(valor) => actualizarTipo(indice, "precio", valor)}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Cupo"
                keyboardType="numeric"
                value={tipo.cupo}
                onChangeText={(valor) => actualizarTipo(indice, "cupo", valor)}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.botonSecundario} onPress={agregarTipo}>
          <Text style={styles.botonSecundarioTexto}>+ Agregar tipo de entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.boton} onPress={crear}>
          <Text style={styles.botonTexto}>Crear evento</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#f2f2f2", paddingTop: 50, paddingHorizontal: 16 },
  volver: { color: "#007aff", fontSize: 16, marginBottom: 12 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  label: { fontWeight: "bold", marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: "white", borderRadius: 8, padding: 10, marginBottom: 6 },
  fila: { flexDirection: "row", flexWrap: "wrap" },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "white", marginRight: 6, marginBottom: 6 },
  chipActivo: { backgroundColor: "#007aff" },
  chipTextoActivo: { color: "white", fontWeight: "bold" },
  seccion: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 8 },
  tipo: { backgroundColor: "#e9e9ee", borderRadius: 10, padding: 10, marginBottom: 10 },
  tipoEncabezado: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  tipoTitulo: { fontWeight: "bold" },
  quitar: { color: "#dc3545", fontWeight: "bold" },
  botonSecundario: { borderWidth: 1, borderColor: "#007aff", borderRadius: 8, padding: 12, alignItems: "center", marginTop: 4 },
  botonSecundarioTexto: { color: "#007aff", fontWeight: "bold" },
  boton: { backgroundColor: "#28a745", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 16 },
  botonTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
});