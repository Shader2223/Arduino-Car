import axios from "axios";
import { useState } from "react";
import { View } from "react-native";
import BackwardButton from "../components/backwardButton.jsx";
import LightButton from "../components/LightButton.jsx";
import SpeedClock from "../components/SpeedClock.jsx";
import SpeedSlider from "../components/SpeedSlider.jsx";
import TurnButton from "../components/TurnButton.jsx";
export default function ControlScreen() {
  const IP = "192.168.199.41";
  const [speed, setSpeed] = useState(0);
  const handleSpeed = async (val, status) => {
    setSpeed(val);
    try {
      //const respone = await axios(`http://${IP}/led`,)
      const respone = await axios.post(`http://${IP}/control`, {
        control: "f"
      });
      console.log("Đã gửi lệnh điều khiển");
      //const respone1 = await axios(`http://${IP}/led`,)
      const response1 = await axios.post(`http://${IP}/speed`, {
        speed: val
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error("Error sending speed command:", error);
    };
    if (val === 0) {
      const respone = await axios.post(`http://${IP}/control`, {
        control: "s"
      });
    }
    console.log("Tốc độ hiện tại:", val);

    // gửi tốc độ tới thiết bị IoT tại đây
  };
   const handleStop = async () => {
      try {
      //const respone = await axios(`http://${IP}/led`,)
      const respone = await axios.post(`http://${IP}/control`, {
        control: "s"
      });
      console.log("Đã gửi lệnh điều khiển");
      
    } catch (error) {
      console.error("Error sending speed command:", error);
    };

  };
   

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <SpeedSlider onSpeedChange={handleSpeed}  />
        </View>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <BackwardButton IP={IP}/>
        </View>
      </View>

      <View style={{ flex: 1, alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <SpeedClock speed={speed} />
        </View>

        {/* <View style={{ flex: 3, alignItems: "center", }}>
          <CameraStream />
        </View> */}

      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <LightButton IP={IP} />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <TurnButton IP = {IP}/>
        </View>
      </View>
    </View>
  );
}
