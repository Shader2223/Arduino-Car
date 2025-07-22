import axios from "axios";
import { StyleSheet, TouchableOpacity, View } from "react-native";
export default function ackwardButton({ onCommand }) {
  const handleControl = async (status) =>{
    try {
      // const response = await axios.post(`http://${IP}/control`,{
        const response = await axios.post(`http://192.168.199.41/control`,{
        control: status
      });
        const response1 = await axios.post(`http://192.168.199.41/speed`, {
        speed:70
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
      <TouchableOpacity style={[styles.triangleButton, styles.back]} onPressIn={()=> handleControl("b")} onPressOut={()=> handleControl("s")}>
        <View style={styles.triangleBack} />
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

  triangleBack: {
    width: 0,
    height: 0,
    borderLeftWidth: 40,
    borderRightWidth: 40,
    borderTopWidth: 40,
    borderBottomWidth: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#007AFF",
  },
});
