import { useRef, useEffect, useState } from "react";
import "./SpeedSlider.scss";
import axios from "axios";
const SLIDER_HEIGHT = 200;
const MAX_SPEED = 225;

export default function SpeedSlider({ onSpeedChange, url }) {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderY, setSliderY] = useState(SLIDER_HEIGHT);
  const [speed, setSpeed] = useState(0);
  const [isHoldingW, setIsHoldingW] = useState(false);
  const speedRef = useRef(speed);

  const trackRef = useRef(null);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  ///////////////return to 0 when release W////////////////////////

  const animateToZero = () => {
    const duration = 300; // ms
    const startTime = performance.now();
    const startY = sliderY;
    const startSpeed = speed;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newY = startY + (SLIDER_HEIGHT - startY) * progress;
      const newSpeed = Math.round(startSpeed * (1 - progress));

      setSliderY(newY);
      setSpeed(newSpeed);
      onSpeedChange?.(newSpeed);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  ///////////////////handle holding w////////////////////////
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "w" || e.key === "W") {
        setIsHoldingW(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "w" || e.key === "W") {
        setIsHoldingW(false);
        animateToZero();
        if (url) {
          axios
            .post(`http://${url}/control`, { control: "s" })
            .catch(console.error);
          axios.post(`http://${url}/speed`, { speed: 0 }).catch(console.error);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  ///////////////////////////////////////////
  useEffect(() => {
    let interval;
    if (isHoldingW) {
      interval = setInterval(() => {
        const newSpeed = Math.min(MAX_SPEED, speedRef.current + 1);
        const newY = SLIDER_HEIGHT - (newSpeed / MAX_SPEED) * SLIDER_HEIGHT;
        setSliderY(newY);
        setSpeed(newSpeed);
        onSpeedChange?.(newSpeed);

        // GỬI TỐC ĐỘ TỚI XE IOT Ở ĐÂY
        if (url) {
          axios
            .post(`http://${url}/control`, { control: "f" })
            .catch(console.error);
          axios
            .post(`http://${url}/speed`, { speed: newSpeed })
            .catch(console.error);
        }
      }, 50); // tốc độ gửi (ms)
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isHoldingW, url, onSpeedChange]);

  ////////////////////////////////////////////
  const updateSpeedFromY = (y) => {
    const clampedY = Math.max(0, Math.min(SLIDER_HEIGHT, y));
    const calculatedSpeed = Math.round(
      ((SLIDER_HEIGHT - clampedY) / SLIDER_HEIGHT) * MAX_SPEED
    );
    setSliderY(clampedY);
    setSpeed(calculatedSpeed);
    onSpeedChange?.(calculatedSpeed);
  };
  ///////////Handle mouse action////////////////
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const trackTop = trackRef.current.getBoundingClientRect().top;
    updateSpeedFromY(e.clientY - trackTop);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const trackTop = trackRef.current.getBoundingClientRect().top;
    updateSpeedFromY(e.clientY - trackTop);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setSliderY(SLIDER_HEIGHT);
    setSpeed(0);
    onSpeedChange?.(0);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="speedSlider">
      <p className="speedLabel">{speed}</p>
      <div className="sliderTrack" ref={trackRef} onMouseDown={handleMouseDown}>
        <div
          className="sliderHandle"
          style={{ top: `${sliderY - 10}px` }} // handle height = 20px
        />
      </div>
    </div>
  );
}
