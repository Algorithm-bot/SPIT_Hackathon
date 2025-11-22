import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#3A8DFF",
        color: "#fff",
        marginTop: 48,
        textAlign: "center",
        padding: "18px 0 12px",
        fontSize: ".97rem",
        letterSpacing: ".02em",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    >
      &copy; {new Date().getFullYear()} Med Predict AI. All rights reserved.
    </footer>
  );
}
