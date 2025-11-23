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
        {/* Gradients for the detailed illustration */}
        <linearGradient id="hairGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5D4037" />
          <stop offset="100%" stopColor="#3E2723" />
        </linearGradient>
        <linearGradient id="skinGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFECB3" />
          <stop offset="100%" stopColor="#FFDBAC" />
        </linearGradient>
        <linearGradient id="coatGradientDetailed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </linearGradient>
        <linearGradient id="tieGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="100%" stopColor="#1976D2" />
        </linearGradient>
      </defs>

      {/* Background circle with gradient */}
      <circle cx="200" cy="200" r="140" fill="url(#bgGradient)" opacity="0.15" />
      <circle cx="200" cy="200" r="120" fill="url(#bgGradient)" />

      {/* Main Group for the Detailed Doctor Illustration */}
      <g stroke="#3E2723" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Pants */}
        <path d="M170,320 L170,380 L230,380 L230,320 Z" fill="#795548" />
        <path d="M200,320 L200,380" fill="none" />

        {/* Lab Coat Back */}
        <path d="M140,200 Q140,180 160,180 L240,180 Q260,180 260,200 L270,320 Q270,340 250,340 L150,340 Q130,340 130,320 Z" fill="url(#coatGradientDetailed)" />

        {/* Shirt & Tie */}
        <path d="M160,180 L160,220 L200,240 L240,220 L240,180 Z" fill="#E3F2FD" />
        <path d="M185,180 L215,180 L205,200 L195,200 Z" fill="url(#tieGradient)" />
        <path d="M195,200 L205,200 L210,260 L200,270 L190,260 Z" fill="url(#tieGradient)" />

        {/* Head & Face */}
        <circle cx="200" cy="130" r="60" fill="url(#skinGradient)" />
        
        {/* Eyes */}
        <g fill="#3E2723">
          <circle cx="175" cy="130" r="8" />
          <circle cx="225" cy="130" r="8" />
        </g>
        <g fill="#FFFFFF" stroke="none">
          <circle cx="178" cy="128" r="3" />
          <circle cx="228" cy="128" r="3" />
        </g>
        
        {/* Glasses */}
        <g fill="none" strokeWidth="4">
          <circle cx="175" cy="130" r="15" />
          <circle cx="225" cy="130" r="15" />
          <line x1="190" y1="130" x2="210" y2="130" />
        </g>
        
        {/* Mouth */}
        <path d="M185,155 Q200,165 215,155" fill="none" strokeWidth="3" />

        {/* Hair */}
        <path d="M130,120 Q130,80 160,70 Q180,60 200,70 Q220,60 240,70 Q270,80 270,120 Q270,140 260,150 L260,120 C260,100 240,90 200,90 C160,90 140,100 140,120 L140,150 Q130,140 130,120 Z" fill="url(#hairGradient)" />
        
        {/* Lab Coat Front & Pockets */}
        <path d="M140,200 Q140,180 160,180 L185,180 L185,340 L150,340 Q130,340 130,320 L140,200 Z" fill="url(#coatGradientDetailed)" />
        <path d="M260,200 Q260,180 240,180 L215,180 L215,340 L250,340 Q270,340 270,320 L260,200 Z" fill="url(#coatGradientDetailed)" />
        <path d="M140,260 L175,260 L175,290 Q175,300 165,300 L150,300 Q140,300 140,290 Z" fill="#FFFFFF" />
        <path d="M225,260 L260,260 L260,290 Q260,300 250,300 L235,300 Q225,300 225,290 Z" fill="#FFFFFF" />

        {/* Stethoscope (Detailed) */}
        <path d="M160,180 C150,220 150,260 165,280" fill="none" strokeWidth="4" stroke="#455A64" />
        <path d="M240,180 C250,220 250,260 235,280" fill="none" strokeWidth="4" stroke="#455A64" />
        <circle cx="165" cy="280" r="8" fill="#B0BEC5" stroke="#455A64" />
        <circle cx="235" cy="280" r="8" fill="#B0BEC5" stroke="#455A64" />
      </g>

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