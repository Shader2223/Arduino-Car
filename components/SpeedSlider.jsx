import { useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";

const SLIDER_HEIGHT = 200;
const SLIDER_WIDTH = 40;
const MAX_SPEED = 225;

export default function SpeedSlider({ onSpeedChange }) {
  const sliderY = useRef(new Animated.Value(SLIDER_HEIGHT)).current;
  const [speed, setSpeed] = useState(0);
  const trackRef = useRef(null);
  const sliderTop = useRef(0);

  const updateSpeedFromY = (y) => {
    const clampedY = Math.max(0, Math.min(SLIDER_HEIGHT, y));
    const calculatedSpeed = Math.round(
      ((SLIDER_HEIGHT - clampedY) / SLIDER_HEIGHT) * MAX_SPEED
    );
    setSpeed(calculatedSpeed);
    onSpeedChange?.(calculatedSpeed);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gesture) => {
        trackRef.current?.measure((fx, fy, width, height, px, py) => {
          sliderTop.current = py;
        });
      },
      onPanResponderMove: (_, gesture) => {
        const newY = gesture.moveY - sliderTop.current;
        sliderY.setValue(newY);
        updateSpeedFromY(newY);
      },
      onPanResponderRelease: () => {
        // Animate về vị trí đáy (0 km/h)
        Animated.timing(sliderY, {
          toValue: SLIDER_HEIGHT,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          setSpeed(0);
          onSpeedChange?.(0);
        });
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View
        ref={trackRef}
        style={styles.sliderTrack}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.sliderHandle,
            {
              top: sliderY.interpolate({
                inputRange: [0, SLIDER_HEIGHT],
                outputRange: [0, SLIDER_HEIGHT - 20], // Trừ chiều cao của handle để không bị lố
                extrapolate: "clamp", // Đảm bảo không vượt quá
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    margin: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    backgroundColor: "#ccc",
    borderRadius: 6,
    position: "relative",
    overflow: "hidden",
  },
  sliderHandle: {
    width: SLIDER_WIDTH,
    height: 20,
    backgroundColor: "#007AFF",
    position: "absolute",
    borderRadius: 5,
  },
});
