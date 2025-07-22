import axios from "axios";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
export default function LightButton({ onCommand }) {
    const [ledOn, setLedOn] = useState(false); // mặc định LED đang tắt
    const handleLed = async () => {
        const newStatus = ledOn ? 0 : 1;

        try {
        await axios.post(`http://192.168.199.41/led`, {
            led: newStatus,
        });
        setLedOn(!ledOn); // cập nhật trạng thái
        } catch (error) {
        console.error("Error sending control command:", error);
        }
    };
    return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.triangleButton, styles.stop]} onPress={() => handleLed()}>
        <View style={styles.square} />
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
  
  square: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    backgroundColor: "#e74c3c",
  },
  stop: { backgroundColor: "#fff" },
});
