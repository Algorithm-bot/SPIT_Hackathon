import React from "react";

const MedicalSvg = () => (
  <svg
    width="100%"
    height="150"
    viewBox="0 0 400 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="10"
      y="10"
      width="380"
      height="130"
      rx="10"
      fill="#E0FFFF"
      stroke="#007ACC"
      strokeWidth="2"
    />
    <circle cx="50" cy="75" r="30" fill="#007ACC" />
    <rect x="100" y="55" width="20" height="40" fill="#FFD700" />
    <rect x="130" y="65" width="250" height="20" fill="#A9A9A9" />
    <text x="100" y="72" fontSize="12" fill="white">
      Data
    </text>
    <text x="20" y="135" fontSize="16" fill="#0047AB">
      Analysis System Graphic
    </text>
  </svg>
);

export default MedicalSvg;
