import React, { useState } from "react";
import Header from "./Header";
import HomePage from "./HomePage";
import ReportForm from "./ReportForm"; // Ensure these files exist
import HistoryPage from "./HistoryPage"; // Ensure these files exist
import AuthModal from "./components/AuthModal";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState("login");
  const [reports, setReports] = useState(
    JSON.parse(localStorage.getItem("report_history")) || []
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setCurrentPage("home");
  };

  const handleReportSubmit = (newReport) => {
    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    localStorage.setItem("report_history", JSON.stringify(updatedReports));
    setCurrentPage("history");
  };

  const handleNavigate = (page) => {
    if (page === "login") {
      setAuthType("login");
      setShowAuth(true);
    } else {
      setCurrentPage(page);
    }
  };

  const requiresAuthMessage = (pageName) => (
    <p
      style={{
        textAlign: "center",
        marginTop: 50,
        fontSize: "1.2em",
        color: "#0047AB",
      }}
    >
      Please log in to view the {pageName}.
    </p>
  );

  const renderContent = () => {
    if (currentPage === "home") {
      return <HomePage onStartForm={() => setCurrentPage("form")} />;
    }
    if (currentPage === "form") {
      return user ? (
        <ReportForm onSubmit={handleReportSubmit} />
      ) : (
        requiresAuthMessage("Submit Report form")
      );
    }
    if (currentPage === "history") {
      return user ? (
        <HistoryPage reports={reports} />
      ) : (
        requiresAuthMessage("History")
      );
    }
    return null;
  };

  return (
    <>
      <Header user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
      {showAuth && (
        <AuthModal
          type={authType}
          onClose={() => setShowAuth(false)}
          setUser={setUser}
          onToggleType={setAuthType}
        />
      )}
      {renderContent()}
    </>
  );
}

export default App;
