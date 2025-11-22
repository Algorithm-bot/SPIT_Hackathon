import React, { useState, useRef, useEffect } from "react";

function ProfileDropdown({ onHistory, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  return (
    <div style={{ position: "relative", marginLeft: 20 }} ref={ref}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "linear-gradient(45deg, #3A8DFF 56%, #21C784 120%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 800,
          fontSize: 22,
          cursor: "pointer",
          border: "3px solid #fff",
          boxShadow: "0 2px 8px #21C78433",
        }}
        onClick={() => setOpen(!open)}
        title="Profile and history"
      >
        {/* Fallback initial or SVG profile */}
        <span>A</span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 50,
            background: "#fff",
            boxShadow: "0 4px 24px #3A8DFF33",
            borderRadius: 14,
            color: "#182E49",
            padding: "18px 24px",
            minWidth: 180,
            zIndex: 1000,
          }}
        >
          <button
            onClick={onHistory}
            style={{
              border: "none",
              background: "none",
              color: "#3A8DFF",
              fontWeight: 600,
              fontSize: "1em",
              cursor: "pointer",
              marginBottom: 9,
            }}
          >
            History
          </button>
          <br />
          <button
            onClick={onLogout}
            style={{
              border: "none",
              background: "none",
              color: "#e55151",
              fontWeight: 500,
              fontSize: "1em",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({ user, onLogout, onNavigate }) {
  return (
    <header
      style={{
        background: "linear-gradient(90deg,#3A8DFF,#21C784)",
        padding: "1.5rem 3rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: "0 0 20px 20px",
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          color: "#fff",
          fontWeight: 800,
          cursor: "pointer",
        }}
        onClick={() => onNavigate("home")}
      >
        Med Predict AI
      </div>
      <nav>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            margin: "0 1.1rem",
            fontSize: "1.07em",
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => onNavigate("home")}
        >
          Home
        </button>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            margin: "0 1.1rem",
            fontSize: "1.07em",
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => onNavigate("form")}
        >
          Submit Report
        </button>
      </nav>
      <div>
        {user ? (
          <ProfileDropdown
            onHistory={() => onNavigate("history")}
            onLogout={onLogout}
          />
        ) : (
          <button
            onClick={() => onNavigate("login")}
            style={{
              marginLeft: 20,
              background: "#fff",
              color: "#3A8DFF",
              border: "none",
              borderRadius: 14,
              padding: "10px 22px",
              fontWeight: 600,
              fontSize: "1.07em",
              cursor: "pointer",
              boxShadow: "0 2px 7px #3A8DFF24",
            }}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
