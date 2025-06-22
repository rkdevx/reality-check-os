import React from "react";

const OverlayScore = ({ score }) => {
  let color = score > 0.8 ? "green" : score > 0.5 ? "orange" : "red";
  return (
    <div style={{
      position: "fixed",
      top: 20, right: 20,
      padding: "8px 12px",
      background: color,
      color: "white",
      borderRadius: "6px",
      zIndex: 1000
    }}>
      Veracity Score: {Math.round(score * 100)}%
    </div>
  );
};

export default OverlayScore;
