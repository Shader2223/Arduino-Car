import { useEffect, useState } from "react";
import "./BackwardButton.scss";

export default function BackwardButton({ onCommand, url, setUrl }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))
        return;
      if (e.repeat) return;

      if (e.key.toLowerCase() === "s") {
        setActive(true);
        onCommand?.("backward");
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
  }, [onCommand]);

  const handleClick = () => {
    setActive(true);
    onCommand?.("backward");
    setTimeout(() => setActive(false), 150);
  };

  return (
    <div className="backwardContainer">
      <button
        className={`triangleButton back ${active ? "active" : ""}`}
        onClick={handleClick}
      >
        <div className="triangleBack" />
      </button>
    </div>
  );
}
