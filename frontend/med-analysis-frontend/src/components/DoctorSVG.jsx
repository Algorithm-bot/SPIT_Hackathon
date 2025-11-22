import React from "react";

const DoctorSVG = () => (
  <svg
    width="240"
    height="220"
    viewBox="0 0 240 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Example SVG: Replace with detailed animated SVG as needed */}
    <circle cx="120" cy="110" r="100" fill="#3A8DFF">
      <animate
        attributeName="r"
        values="95;105;95"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    <ellipse cx="120" cy="130" rx="50" ry="65" fill="#fff" />
    <ellipse cx="120" cy="85" rx="32" ry="30" fill="#ffe066" />
    <rect x="105" y="145" width="30" height="45" rx="12" fill="#21C784" />
    <ellipse cx="120" cy="110" rx="16" ry="14" fill="#fff" />
    {/* Face, mask, stethoscope can be added for realism */}
  </svg>
);

export default DoctorSVG;
