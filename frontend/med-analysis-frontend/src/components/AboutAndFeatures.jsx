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
        style={{ maxWidth: 900, margin: "36px auto 0", textAlign: "center" }}
      >
        <h2 style={{ color: "#3A8DFF", fontWeight: 700, fontSize: "2.1rem" }}>
          About Med Predict AI
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#4F6076",
            margin: "12px 0 30px",
          }}
        >
          Med Predict AI is your intelligent health analysis assistant. Simply
          upload your latest medical test data and our AI will interpret results
          quickly and securely—giving you peace of mind and next actions.
        </p>
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            margin: "36px 0 0",
          }}
        >
          {cards.map(({ title, desc }, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 6px 24px #3a8dff22",
                minWidth: 220,
                padding: "28px 20px",
                textAlign: "center",
                flex: "1 1 0%",
                transition: "transform 0.17s",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 42, marginBottom: 12 }}>
                {["⚡", "🔒", "📊"][i]}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  marginBottom: 6,
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: ".98rem", color: "#4F6076" }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
