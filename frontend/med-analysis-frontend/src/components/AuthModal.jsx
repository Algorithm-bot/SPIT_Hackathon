import React, { useState } from "react";

const AuthModal = ({ type, onClose, setUser, onToggleType }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1100,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      background: "#fff",
      padding: "36px 32px 26px",
      borderRadius: "22px",
      maxWidth: "370px",
      width: "90%",
      boxShadow: "0 10px 36px #3a8dff21",
      border: "2px solid #3A8DFF",
      position: "relative",
      textAlign: "center",
    },
    input: {
      width: "100%",
      padding: "13px",
      margin: "9px 0 18px",
      border: "1.5px solid #99c9ff",
      borderRadius: "7px",
      fontSize: "1rem",
      outline: "none",
      transition: "border .2s",
    },
    button: {
      width: "100%",
      padding: "14px",
      marginTop: "10px",
      background: "linear-gradient(90deg,#3A8DFF,#21C784)",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontWeight: 700,
      fontSize: "1.1rem",
      cursor: "pointer",
      boxShadow: "0 3px 14px #21C78433",
    },
    close: {
      background: "#eee",
      color: "#3A8DFF",
      border: "none",
      borderRadius: "8px",
      width: "100%",
      padding: "11px",
      marginTop: "13px",
      cursor: "pointer",
      fontWeight: 500,
    },
    toggleLink: {
      marginTop: "18px",
      color: "#3A8DFF",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: ".97rem",
    },
  };

  const validateAuth = () => {
    if (email.trim() === "" || password.trim() === "") {
      setError("Both email and password are mandatory.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAuth()) return;
    let users = JSON.parse(localStorage.getItem("med_users")) || [];
    if (type === "signup") {
      if (users.find((u) => u.email === email)) {
        setError("User already exists. Please log in.");
        return;
      }
      users.push({ email, password });
      localStorage.setItem("med_users", JSON.stringify(users));
      alert("Signup successful! You can now log in.");
      onClose();
    } else if (type === "login") {
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );
      if (foundUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({ email: foundUser.email })
        );
        setUser({ email: foundUser.email });
        alert("Login successful!");
        onClose();
      } else {
        setError("Invalid email or password.");
      }
    }
  };

  // handle click outside modal to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div style={modalStyles.overlay} onClick={handleOverlayClick}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <h3
          style={{
            color: "#3A8DFF",
            marginBottom: 15,
            fontWeight: 800,
            fontSize: "1.45rem",
          }}
        >
          {type === "login"
            ? "Login to Med Predict AI"
            : "Sign Up for Med Predict AI"}
        </h3>
        {error && (
          <div
            style={{
              background: "#ffefef",
              color: "#a32424",
              borderRadius: "7px",
              padding: "8px 0",
              marginBottom: 8,
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            type="email"
            value={email}
            placeholder="Email"
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            style={modalStyles.input}
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={modalStyles.input}
          />
          <button type="submit" style={modalStyles.button}>
            {type === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
        <button onClick={onClose} style={modalStyles.close}>
          Close
        </button>
        <div
          style={modalStyles.toggleLink}
          onClick={() =>
            onToggleType && onToggleType(type === "login" ? "signup" : "login")
          }
        >
          {type === "login"
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
