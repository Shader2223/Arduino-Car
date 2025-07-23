import { useState } from "react";
import "./InputUrl.scss";

export default function InputUrl({ setUrl }) {
  return (
    <div className="container">
      <input
        className="input"
        type="text"
        placeholder="0.0.0.0"
        onChange={(e) => {
          setUrl(e.target.value);
        }}
      ></input>
    </div>
  );
}
