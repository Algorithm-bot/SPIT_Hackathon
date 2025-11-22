import React, { useState } from "react";
import AuthModal from "./components/AuthModal";

const Header = ({ user, setUser, onLogout, onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const buttonStyle = {
    margin: "0 10px",
    padding: "8px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#007ACC",
    color: "white",
    fontSize: "1em",
    fontFamily: "Roboto",
  };

  const navButtonStyle = {
    ...buttonStyle,
    backgroundColor: "transparent",
    color: "#0047AB",
    fontWeight: "bold",
    fontFamily: "Roboto",
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 40px",
        backgroundColor: "#ADD8E6" /* Light Blue Header */,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        onClick={() => onNavigate("home")}
        style={{ cursor: "pointer", color: "#0047AB", fontFamily: "Roboto" }}
      >
        Med Predict AI
      </h1>
      <nav>
        <button onClick={() => onNavigate("home")} style={navButtonStyle}>
          Home
        </button>
        <button onClick={() => onNavigate("form")} style={navButtonStyle}>
          Submit Report
        </button>
        {user && (
          <button onClick={() => onNavigate("history")} style={navButtonStyle}>
            History
          </button>
        )}
      </nav>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: "15px", color: "#0047AB" }}>
              Welcome, **{user.email}**!
            </span>
            <button onClick={onLogout} style={buttonStyle}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => openModal("login")}
              style={{ ...buttonStyle, marginRight: "10px" }}
            >
              Login
            </button>
            <button onClick={() => openModal("signup")} style={buttonStyle}>
              Signup
            </button>
          </>
        )}
      </div>
      {isModalOpen && (
        <AuthModal
          type={modalType}
          onClose={() => setIsModalOpen(false)}
          setUser={setUser}
        />
      )}
    </header>
  );
};

export default Header;
