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
        background: "linear-gradient(90deg,#3A8DFF,#21C784)",
        padding: "20px 40px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        onClick={() => onNavigate("home")}
        style={{
          cursor: "pointer",
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.7rem",
        }}
      >
        Med Predict AI
      </div>
      <nav>
        <button onClick={() => onNavigate("home")} style={navBtn}>
          Home
        </button>
        <button onClick={() => onNavigate("form")} style={navBtn}>
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
        <button style={loginBtn} onClick={() => onNavigate("login")}>
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
  fontWeight: 500,
  fontSize: "1rem",
  margin: "0 0.9rem",
  padding: "8px 18px",
  borderRadius: "18px",
  cursor: "pointer",
};
const loginBtn = {
  background: "#fff",
  color: "#3A8DFF",
  fontWeight: 600,
  border: "none",
  borderRadius: "22px",
  padding: "10px 28px",
  fontSize: "1.1rem",
  cursor: "pointer",
};
