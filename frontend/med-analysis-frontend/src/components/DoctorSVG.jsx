import React from "react";

const DoctorSVG = () => (
  <svg
    width="260"
    height="260"
    viewBox="0 0 512 512"
    style={{ animation: "floatY 4s ease-in-out infinite" }}
  >
    <circle cx="256" cy="256" r="120" fill="#3A8DFF" />
    <ellipse cx="256" cy="230" rx="58" ry="80" fill="#FFF" />
    {/* You can replace with a detailed SVG (e.g., OpenDoodles doctor) */}
    <style>
      {`
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
      `}
    </style>
  </svg>
);

export default DoctorSVG;
