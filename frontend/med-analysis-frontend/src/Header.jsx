import React, { useState, useRef } from "react";
import "./components/ProfileDropdown.css";

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360},63%,72%)`;
};

function ProfileDropdown({ user, onHistory, onLogout }) {
  const [open, setOpen] = useState(false);
  const profileRef = useRef();

  return (
    <div className="profile-dropdown" ref={profileRef}>
      <div
        className="profile-circle"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: user ? stringToColor(user.email) : "#ccc",
          color: "#fff",
          width: 46,
          height: 46,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "1.3rem",
          cursor: "pointer",
          position: "relative",
          transition: "box-shadow .18s",
          boxShadow: open ? "0 4px 24px #3A8DFF55" : "none",
        }}
      >
        {user?.email?.[0]?.toUpperCase() || "?"}
        {open && (
          <div className="dropdown-list">
            <div className="dropdown-item" onClick={onHistory}>
              History
            </div>
            <div className="dropdown-item" onClick={onLogout}>
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default function Header({ user, onLogout, onNavigate }) {
  return (
    <header
      style={{
        display: "flex",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px 40px",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        onClick={() => onNavigate("home")}
        style={{
          cursor: "pointer",
          color: "#fff",
          fontWeight: 800,
          fontSize: "1.8rem",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ fontSize: "1.5em" }}>🏥</span>
        <span>Med Predict AI</span>
      </div>
      <nav style={{ display: "flex", gap: "10px" }}>
        <button 
          onClick={() => onNavigate("home")} 
          style={navBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Home
        </button>
        <button 
          onClick={() => onNavigate("form")} 
          style={navBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Submit Report
        </button>
      </nav>
      {user ? (
        <ProfileDropdown
          user={user}
          onHistory={() => onNavigate("history")}
          onLogout={onLogout}
        />
      ) : (
        <button 
          style={loginBtn} 
          onClick={() => onNavigate("login")}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(255,255,255,0.2)";
          }}
        >
          Login
        </button>
      )}
    </header>
  );
}

const navBtn = {
  background: "transparent",
  color: "#fff",
  border: "none",
  fontWeight: 600,
  fontSize: "1rem",
  padding: "10px 20px",
  borderRadius: "25px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
};

const loginBtn = {
  background: "#fff",
  color: "#667eea",
  fontWeight: 700,
  border: "none",
  borderRadius: "25px",
  padding: "12px 32px",
  fontSize: "1.05rem",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(255,255,255,0.2)",
};
