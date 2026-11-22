import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import EventosScreen from "./src/screens/EventosScreen";
import MisComprasScreen from "./src/screens/MisComprasScreen";
import OrganizadorScreen from "./src/screens/OrganizadorScreen";

export default function App() {
  const [pantalla, setPantalla] = useState("eventos");

  return (
    <View style={styles.app}>
      <View style={styles.contenido}>
        {pantalla === "eventos" && <EventosScreen />}
        {pantalla === "compras" && <MisComprasScreen />}
        {pantalla === "organizador" && <OrganizadorScreen />}
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.opcion} onPress={() => setPantalla("eventos")}>
          <Text style={[styles.opcionTexto, pantalla === "eventos" && styles.opcionActiva]}>Eventos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.opcion} onPress={() => setPantalla("compras")}>
          <Text style={[styles.opcionTexto, pantalla === "compras" && styles.opcionActiva]}>Mis compras</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.opcion} onPress={() => setPantalla("organizador")}>
          <Text style={[styles.opcionTexto, pantalla === "organizador" && styles.opcionActiva]}>Organizador</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#f2f2f2" },
  contenido: { flex: 1 },
  menu: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#ddd", paddingBottom: 24 },
  opcion: { flex: 1, alignItems: "center", paddingVertical: 14 },
  opcionTexto: { fontSize: 16, color: "#666" },
  opcionActiva: { color: "#007aff", fontWeight: "bold" },
});