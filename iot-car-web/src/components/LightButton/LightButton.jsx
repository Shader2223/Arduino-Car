import { useEffect, useState } from "react";
import "./LightButton.scss";
import axios from "axios";

export default function LightButton({ onCommand, url }) {
  const [active, setActive] = useState(false);
  const [ledOn, setLedOn] = useState(false);

  console.log(url);
  const handleLed = async () => {
    const newStatus = ledOn ? 0 : 1;

    try {
      await axios.post(`http://${url}/led`, {
        led: newStatus,
      });
      setLedOn(!ledOn); // cập nhật trạng thái
    } catch (error) {
      console.error("Error sending control command:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))
        return;
      if (e.repeat) return;

      if (e.key.toLowerCase() === "l") {
        setActive(true);
        onCommand?.("light");
        handleLed();
      }
    };

    const handleKeyUp = () => {
      setActive(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onCommand, ledOn]);

  const handleClick = () => {
    setActive(true);
    onCommand?.("light");
    handleLed();
    setTimeout(() => setActive(false), 150);
  };

  return (
    <div className="lightContainer">
      <button
        className={`lightButton ${active ? "active" : ""}`}
        onClick={handleClick}
      >
        <div className="lightIcon" />
      </button>
    </div>
  );
}
