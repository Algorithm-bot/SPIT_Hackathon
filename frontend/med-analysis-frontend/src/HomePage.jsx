import React, { useState, useEffect, lazy } from "react";

// 1. Lazy Loading setup
const MedicalSvg = lazy(() => import("./components/MedicalSvg"));

const HomePage = ({ onStartForm }) => {
  const [isVisible, setIsVisible] = useState(false);

  // 2. Animation effect (fade-in)
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "30px",
        borderRadius: "10px",
        backgroundColor: "white",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        opacity: isVisible ? 1 : 0, // Fade-in Animation
        transition: "opacity 1s ease-in-out",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontFamily: "Inter",
        }}
      >
        <h2
          style={{
            color: "#0047AB",
            fontFamily: "Inter",
            fontSize: "2.1em",
            lineHeight: "1.4",
          }}
        >
          Empowering Health Through Data Analysis
        </h2>
      </div>

      <p style={{ fontSize: "1.1em", lineHeight: "1.6", fontFamily: "Inter" }}>
        Welcome to the <strong>Med-Analysis Portal</strong>, your digital
        solution for preliminary medical report evaluation. Securely submit your
        lab test results, and our system will provide an accurate assesment of
        potential disease correlations.
      </p>

      <p
        style={{ fontWeight: "bold", fontSize: "1.2rem", fontFamily: "Inter" }}
      >
        Key features:
      </p>
      <ul
        style={{
          marginLeft: "20px",
          fontSize: "1.0em",
          lineHeight: "1.6",
          fontFamily: "Inter",
          color: "#333",
        }}
      >
        <li style={{ textDecoration: "none" }}>
          Secure Share: Fill out the <strong>Mandatory test results </strong>in
          the report form.
        </li>
        <li>
          Data History: Access all of yours{" "}
          <strong>previous submissions</strong> and <strong>predicitons</strong>{" "}
          in the History.
        </li>
      </ul>

      <button
        onClick={onStartForm}
        style={{
          marginTop: "30px",
          padding: "12px 25px",
          fontSize: "1.1em",
          backgroundColor: "#007ACC",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          display: "block",
          width: "100%",
        }}
      >
        Start New Analysis
      </button>

      {/* 3. Lazy Loading Implementation */}
      <div
        style={{
          marginTop: "40px",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
        }}
      ></div>
    </div>
  );
};

export default HomePage;
