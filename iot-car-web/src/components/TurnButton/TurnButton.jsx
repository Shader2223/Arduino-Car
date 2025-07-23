import { useEffect, useRef, useState } from "react";
import "./TurnButton.scss";
import axios from "axios";

export default function TurnButton({ onCommand, url }) {
  const [activeButton, setActiveButton] = useState(null);
  const intervalRef = useRef(null);
  const currentCommand = useRef(null);

  // Gửi lệnh điều khiển
  const sendControl = async (cmd) => {
    const mapped = {
      left: "l",
      right: "r",
      stop: "s",
    };

    try {
      await axios.post(`http://${url}/control`, {
        control: mapped[cmd],
      });

      if (cmd !== "stop") {
        await axios.post(`http://${url}/speed`, {
          speed: 50,
        });
      }
    } catch (error) {
      console.error("Gửi lệnh thất bại:", error.message);
    }
  };

  // Bắt đầu gửi lệnh liên tục
  const startSending = (cmd) => {
    stopSending(); // Đảm bảo không bị trùng interval
    currentCommand.current = cmd;
    sendControl(cmd);
    intervalRef.current = setInterval(() => {
      sendControl(cmd);
    }, 300); // gửi mỗi 300ms
  };

  // Dừng gửi lệnh
  const stopSending = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;

      if (currentCommand.current !== "stop") {
        sendControl("stop");
        onCommand?.("stop");
      }

      currentCommand.current = null;
      setActiveButton(null);
    }
  };

  // Xử lý nhấn và thả chuột
  const handleMouseDown = (cmd) => {
    setActiveButton(cmd);
    onCommand?.(cmd);
    startSending(cmd);
  };

  const handleMouseUp = () => {
    stopSending();
  };

  // Xử lý nhấn và thả phím
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))
        return;
      if (e.repeat) return;

      let cmd = null;
      if (e.key === "a" || e.key === "A") cmd = "left";
      else if (e.key === "d" || e.key === "D") cmd = "right";

      if (cmd) {
        setActiveButton(cmd);
        onCommand?.(cmd);
        startSending(cmd);
      }
    };

    const handleKeyUp = (e) => {
      if (["a", "A", "d", "D"].includes(e.key)) {
        stopSending();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onCommand, url]);

  return (
    <div className="turnContainer">
      <button
        className={`triangleButton left ${
          activeButton === "left" ? "active" : ""
        }`}
        onMouseDown={() => handleMouseDown("left")}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // đề phòng người dùng rê chuột ra ngoài
      >
        <div className="triangleLeft" />
      </button>
      <button
        className={`triangleButton stop ${
          activeButton === "stop" ? "active" : ""
        }`}
        onClick={() => {
          stopSending(); // Ngừng tất cả lệnh khi nhấn nút stop
        }}
      >
        <div className="square" />
      </button>
      <button
        className={`triangleButton right ${
          activeButton === "right" ? "active" : ""
        }`}
        onMouseDown={() => handleMouseDown("right")}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="triangleRight" />
      </button>
    </div>
  );
}
