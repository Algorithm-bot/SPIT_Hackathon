import React from "react";
import DoctorSVG from "./components/DoctorSVG";
import AboutAndFeatures from "./components/AboutAndFeatures";
import Footer from "./components/Footer";

export default function HomePage({ onStartForm }) {
  return (
    <div
      style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        paddingBottom: 60 
      }}
    >
      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 40px 40px 40px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ flex: "0 1 400px", marginRight: 40 }}>
          <DoctorSVG />
        </div>
        <div
          style={{
            flex: 1,
            maxWidth: 600,
            paddingLeft: 40,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
              padding: "40px",
              borderRadius: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <h1
              style={{
                fontSize: "3rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
                lineHeight: "1.2",
                marginBottom: "20px",
              }}
            >
              Empowering Health
              <br />
              Through AI-Powered
              <br />
              Medical Analysis
            </h1>
            <p
              style={{
                fontSize: "1.2rem",
                color: "#4F6076",
                marginBottom: "32px",
                lineHeight: "1.6",
              }}
            >
              Get instant, accurate disease predictions from your medical test data. 
              Powered by advanced machine learning and secured with blockchain technology.
            </p>
            <button
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                padding: "18px 48px",
                border: "none",
                borderRadius: "50px",
                fontSize: "1.2rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 6px 24px rgba(102, 126, 234, 0.4)",
              }}
              onClick={onStartForm}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(102, 126, 234, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(102, 126, 234, 0.4)";
              }}
            >
              🚀 Start Analysis
            </button>
          </div>
        </div>
      </section>
      <AboutAndFeatures />
      <Footer />
    </div>
  );
}
