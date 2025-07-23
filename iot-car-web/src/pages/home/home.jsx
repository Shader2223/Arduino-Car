import { useState } from "react";
import BackwardButton from "../../components/BackwardButton/BackwardButton";
import CameraSpeed from "../../components/CameraSpeed/CameraSpeed";
import LightButton from "../../components/LightButton/LightButton";
import SpeedSlider from "../../components/SpeedSlider/SpeedSlider";
import TurnButton from "../../components/TurnButton/TurnButton";

import "./home.scss"; // import file scss

const Home = () => {
  const url = "172.20.10.8";

  const [speed, setSpeed] = useState(0);

  const handleSpeedChange = (val) => {
    console.log("Tốc độ hiện tại:", val);
    setSpeed(val);
  };

  console.log(url);
  return (
    <div className="home">
      {/* Left Column */}
      <div className="column left">
        <div className="sliderSection">
          <SpeedSlider onSpeedChange={handleSpeedChange} url={url} />
        </div>
        <div className="backwardSection">
          <BackwardButton url={url} />
        </div>
      </div>

      {/* Center Column */}
      <div className="column center">
        <CameraSpeed speed={speed} url={url} />
      </div>

      {/* Right Column */}
      <div className="column right">
        <div className="lightTurnSection">
          <LightButton url={url} />
          <TurnButton url={url} />
        </div>
      </div>
    </div>
  );
};

export default Home;
