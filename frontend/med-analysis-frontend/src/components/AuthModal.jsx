import React, { useState } from "react";

const AuthModal = ({ type, onClose, setUser }) => {
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
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      backgroundColor: "white",
      padding: "30px",
      borderRadius: "10px",
      maxWidth: "400px",
      width: "90%",
      boxShadow: "0 5px 20px rgba(0, 0, 0, 0.4)",
      border: "2px solid #ADD8E6",
    },
    input: {
      width: "100%",
      padding: "10px",
      margin: "8px 0",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    button: {
      width: "100%",
      padding: "12px",
      marginTop: "15px",
      backgroundColor: "#007ACC",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  const validateAuth = () => {
    // Validation: Mandatory non-empty fields
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

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: "#0047AB" }}>
          {type === "login" ? "Login" : "Signup"}
        </h3>
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={modalStyles.input}
          />
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={modalStyles.input}
          />
          {error && <p style={{ color: "red", fontSize: "0.9em" }}>{error}</p>}
          <button type="submit" style={modalStyles.button}>
            {type === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
        <button
          onClick={onClose}
          style={{
            ...modalStyles.button,
            backgroundColor: "#ccc",
            marginTop: "10px",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
