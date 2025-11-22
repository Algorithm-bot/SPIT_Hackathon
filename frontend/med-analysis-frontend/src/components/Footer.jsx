import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        marginTop: 80,
        textAlign: "center",
        padding: "30px 0 20px",
        fontSize: "1rem",
        letterSpacing: ".03em",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        width: "100%",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "8px" }}>
        &copy; {new Date().getFullYear()} Med Predict AI
      </div>
      <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
        All rights reserved. Team Vibe Coders
      </div>
    </footer>
  );
}
