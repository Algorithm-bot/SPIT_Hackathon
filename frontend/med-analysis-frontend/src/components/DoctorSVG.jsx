import React from "react";

const DoctorSVG = () => (
  <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <svg
      width="320"
      height="320"
      viewBox="0 0 400 400"
      style={{ 
        animation: "floatY 4s ease-in-out infinite",
        filter: "drop-shadow(0 10px 30px rgba(58, 141, 255, 0.3))"
      }}
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3A8DFF" />
          <stop offset="100%" stopColor="#21C784" />
        </linearGradient>
        <linearGradient id="coatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0F7FF" />
        </linearGradient>
      </defs>
      
      {/* Background circle with gradient */}
      <circle cx="200" cy="200" r="140" fill="url(#bgGradient)" opacity="0.15" />
      <circle cx="200" cy="200" r="120" fill="url(#bgGradient)" />
      
      {/* Doctor's coat */}
      <path
        d="M 140 180 Q 140 160 160 160 L 240 160 Q 260 160 260 180 L 260 320 L 140 320 Z"
        fill="url(#coatGradient)"
      />
      
      {/* Stethoscope */}
      <path
        d="M 180 200 Q 160 190 150 210 Q 145 220 150 230 Q 155 240 165 235 Q 170 232 168 228 Q 166 224 170 220 Q 175 215 180 220"
        stroke="#3A8DFF"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="150" cy="230" r="8" fill="#3A8DFF" />
      <circle cx="180" cy="220" r="6" fill="#3A8DFF" />
      
      {/* Head */}
      <circle cx="200" cy="140" r="50" fill="#FFDBAC" />
      
      {/* Hair */}
      <path
        d="M 150 120 Q 150 100 170 100 Q 190 95 200 100 Q 210 95 230 100 Q 250 100 250 120 Q 250 130 240 125 Q 230 120 220 125 Q 210 120 200 125 Q 190 120 180 125 Q 170 120 160 125 Q 150 130 150 120"
        fill="#2C3E50"
      />
      
      {/* Face features */}
      <circle cx="185" cy="135" r="3" fill="#2C3E50" />
      <circle cx="215" cy="135" r="3" fill="#2C3E50" />
      <path
        d="M 185 150 Q 200 160 215 150"
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Medical cross badge */}
      <rect x="190" y="190" width="20" height="20" rx="4" fill="#FF4444" />
      <rect x="197" y="185" width="6" height="30" fill="#FFFFFF" />
      <rect x="185" y="197" width="30" height="6" fill="#FFFFFF" />
      
      {/* Animation */}
      <style>
        {`
          @keyframes floatY {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
          }
        `}
      </style>
    </svg>
  </div>
);

export default DoctorSVG;
