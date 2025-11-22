import React from "react";
import DoctorSVG from "./components/DoctorSVG";

const featureData = [
  {
    title: "AI-Powered Analysis",
    desc: "Rapid and reliable disease correlation powered by advanced AI.",
    color: "#3A8DFF",
  },
  {
    title: "Data Privacy First",
    desc: "Your medical data stays secure and encrypted throughout.",
    color: "#21C784",
  },
  {
    title: "Instant Access",
    desc: "Access all your previous analyses and predictions any time.",
    color: "#FFE066",
  },
];

export default function HomePage({ onStartForm }) {
  return (
    <div
      style={{
        fontFamily: "Inter, Segoe UI, Arial",
        background: "#F5FAFE",
        minHeight: "100vh",
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1200,
          margin: "40px auto 0",
          padding: 32,
          borderRadius: 22,
          background: "#fff",
          boxShadow: "0 8px 32px #3A8DFF12",
        }}
      >
        <div style={{ maxWidth: 440 }}>
          <h1
            style={{
              color: "#3A8DFF",
              fontSize: "2.7rem",
              fontWeight: 900,
              marginBottom: 14,
              lineHeight: 1.1,
            }}
          >
            Empowering health through data analysis{" "}
            <span style={{ color: "#21C784" }}>and AI</span>
          </h1>
          <p style={{ color: "#182E49", fontSize: "1.18em", marginBottom: 31 }}>
            Begin your journey towards smarter healthcare insights.
          </p>
          <button
            onClick={onStartForm}
            style={{
              background: "linear-gradient(90deg,#3A8DFF,#21C784)",
              color: "#fff",
              fontWeight: 700,
              letterSpacing: 0.2,
              fontSize: "1.14em",
              border: "none",
              borderRadius: 14,
              padding: "15px 36px",
              boxShadow: "0 4px 16px #3A8DFF44",
              cursor: "pointer",
              transition: ".15s transform",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Start Analysis
          </button>
        </div>
        <div>
          <DoctorSVG />
        </div>
      </div>

      {/* About Section */}
      <div
        style={{
          maxWidth: 950,
          margin: "48px auto 0",
          background: "#fff",
          borderRadius: 14,
          padding: "32px 42px",
          boxShadow: "0 4px 16px #21C78424",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            color: "#3A8DFF",
            fontWeight: 700,
            marginBottom: 15,
          }}
        >
          About Med Predict AI
        </h2>
        <p style={{ fontSize: "1.18em", color: "#4F6076" }}>
          Med Predict AI helps users bridge the gap between raw medical lab
          results and actionable healthcare advice. Upload your results and get
          instant, AI-driven insights, securely and privately.
        </p>
      </div>

      {/* Features Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 35,
          maxWidth: 1140,
          margin: "48px auto",
        }}
      >
        {featureData.map((f, i) => (
          <div
            key={i}
            style={{
              background: f.color + "20",
              padding: 32,
              borderRadius: 16,
              minWidth: 260,
              boxShadow: "0 4px 16px " + f.color + "22",
              flex: 1,
              margin: "0 8px",
            }}
          >
            <h3
              style={{
                color: f.color,
                fontSize: "1.27em",
                fontWeight: 700,
                marginBottom: 13,
              }}
            >
              {f.title}
            </h3>
            <p style={{ color: "#4F6076", fontSize: "1.1em" }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "#3A8DFF",
          color: "#fff",
          padding: "16px 0",
          textAlign: "center",
          borderRadius: "18px 18px 0 0",
          marginTop: 54,
          fontSize: "1.07em",
        }}
      >
        © {new Date().getFullYear()} Med Predict AI &middot; Empowering health
      </footer>
    </div>
  );
}
