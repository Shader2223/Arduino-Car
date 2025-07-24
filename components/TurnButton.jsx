import axios from "axios";
import { StyleSheet, TouchableOpacity, View } from "react-native";
export default function TurnButton({ IP }) {
  const handleControl = async (status) =>{
    try {
      // const response = await axios.post(`http://${IP}/control`,{
        const response = await axios.post(`http://${IP}/control`,{
        control: status
      });
        const response1 = await axios.post(`http://${IP}/speed`, {
        speed:100
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error("Error sending control command:", error);
    }
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.triangleButton, styles.left]} onPressIn={()=> handleControl("l")} onPressOut={()=> handleControl("s")}>
        <View style={styles.triangleLeft} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.triangleButton, styles.stop]} onPress={()=> handleControl("s")}>
        <View style={styles.square} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.triangleButton, styles.right]} onPressIn={()=> handleControl("r")} onPressOut={()=> handleControl("s")}>
        <View style={styles.triangleRight} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 30,
  },
  triangleButton: {
    width: 60,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  triangleLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 40,
    borderBottomWidth: 40,
    borderRightWidth: 40,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#007AFF",
  },
  triangleRight: {
    width: 0,
    height: 0,
    borderTopWidth: 40,
    borderBottomWidth: 40,
    borderLeftWidth: 40,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#007AFF",
  },
  square: {
    width: 50,
    height: 50,
    backgroundColor: "#e74c3c",
  },
  stop: { backgroundColor: "#fff" },
});
