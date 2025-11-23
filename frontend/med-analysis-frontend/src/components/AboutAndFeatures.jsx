import React from "react";

const cards = [
  {
    title: "Fast Analysis",
    desc: "Instantly get AI-powered insights from your medical test data.",
  },
  {
    title: "Private & Secure",
    desc: "All your data is encrypted and stored only on your device.",
  },
  {
    title: "Actionable Results",
    desc: "See easy-to-understand correlations and next steps for your health.",
  },
];

export default function AboutAndFeatures() {
  return (
    <>
      <section
        style={{ 
          maxWidth: 1200, 
          margin: "60px auto 0", 
          textAlign: "center",
          padding: "0 40px",
        }}
      >
        <h2 
          style={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800, 
            fontSize: "2.5rem",
            marginBottom: "20px",
          }}
        >
          About Med Predict AI
        </h2>
        <p
          style={{
            fontSize: "1.15rem",
            color: "#4F6076",
            margin: "0 auto 50px",
            maxWidth: "700px",
            lineHeight: "1.7",
          }}
        >
          Med Predict AI is your intelligent health analysis assistant. Simply
          upload your latest medical test data and our AI will interpret results
          quickly and securely—giving you peace of mind and next actions.
        </p>
        <div
          style={{
            display: "flex",
            gap: 30,
            justifyContent: "center",
            margin: "50px 0 0",
            flexWrap: "wrap",
          }}
        >
          {cards.map(({ title, desc }, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.15)",
                minWidth: 280,
                maxWidth: 320,
                padding: "40px 30px",
                textAlign: "center",
                flex: "1 1 0%",
                transition: "all 0.3s ease",
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.15)";
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 16, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}>
                {["⚡", "🔒", "📊"][i]}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  marginBottom: 12,
                  color: "#2C3E50",
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: "1rem", color: "#4F6076", lineHeight: "1.6" }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
