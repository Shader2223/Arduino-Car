import "./CameraSpeed.scss";

export default function CameraSpeed({ speed, url }) {
  console.log(url)
  return (
    <div className="cameraContainer">
      {/* Video stream */}
      <div className="cameraStream">
        <img src={`http://${url}:81/stream`} alt="Camera Stream" />
      </div>

      {/* Đồng hồ tốc độ */}
      <div className="clockContainer">
        <div className="speedValue">
          <span>{speed}</span>
        </div>
      </div>
    </div>
  );
}
