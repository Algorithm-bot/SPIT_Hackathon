import React from "react";
import DoctorSVG from "./components/DoctorSVG";
import AboutAndFeatures from "./components/AboutAndFeatures";
import Footer from "./components/Footer";

export default function HomePage({ onStartForm }) {
  return (
    <div
      style={{ minHeight: "100vh", background: "#F5FAFE", paddingBottom: 60 }}
    >
      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 0 24px 0",
        }}
      >
        <div
          style={{
            flex: 1,
            maxWidth: 550,
            textAlign: "right",
            paddingRight: 36,
          }}
        >
          <h1
            style={{
              fontSize: "2.7rem",
              fontWeight: 800,
              color: "#182E49",
              margin: 0,
            }}
          >
            Empowering Health
            <br />
            Through Data Analysis & AI
          </h1>
          <button
            style={{
              marginTop: 28,
              background: "linear-gradient(90deg,#3A8DFF,#21C784)",
              color: "#fff",
              padding: "15px 38px",
              border: "none",
              borderRadius: 50,
              fontSize: "1.2rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "box-shadow .22s",
              boxShadow: "0 3px 16px #21C78444",
            }}
            onClick={onStartForm}
          >
            Start Analysis
          </button>
        </div>
        <div style={{ flex: "0 1 320px", marginLeft: 24 }}>
          <DoctorSVG />
        </div>
      </section>
      <AboutAndFeatures />
      <Footer />
    </div>
  );
}
