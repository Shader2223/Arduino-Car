import { StyleSheet, Text, View } from "react-native";

export default function SpeedClock({ speed }) {
  return (
    <View style={styles.container}>
      <View style={styles.Scontainer}>
        <Text style={{ fontSize: 24, color: "#333" }}>{speed}</Text>
      </View>
      {/* <View style={styles.Vcontainer}>
        <Text style={{ fontSize: 26, color: "#333" }}>km/h</Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    display: "flex",
    backgroundColor: "#ccc",
    padding: 20,
  },

  Scontainer: {
    flex: 3,
    alignItems: "center",
  },
  Vcontainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
