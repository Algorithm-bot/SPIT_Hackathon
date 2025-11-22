import React, { useState } from "react";
import Header from "./Header";
import HomePage from "./HomePage";
import ReportForm from "./ReportForm";
import HistoryPage from "./HistoryPage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  // Initialize reports state from local storage
  const [reports, setReports] = useState(
    JSON.parse(localStorage.getItem("report_history")) || []
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setCurrentPage("home");
  };

  const handleReportSubmit = (newReport) => {
    // Add new report to the top of the list
    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    // Persist reports to local storage
    localStorage.setItem("report_history", JSON.stringify(updatedReports));
    setCurrentPage("history"); // Navigate to history after submission
  };

  const renderContent = () => {
    if (currentPage === "home")
      return <HomePage onStartForm={() => setCurrentPage("form")} />;

    const requiresAuthMessage = (pageName) => (
      <p
        style={{
          textAlign: "center",
          marginTop: "50px",
          fontSize: "1.2em",
          color: "#0047AB",
        }}
      >
        Please log in to view the {pageName}.
      </p>
    );

    if (currentPage === "form") {
      return user ? (
        <ReportForm onReportSubmit={handleReportSubmit} />
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
  };

  return (
    <div
      className="app-container"
      style={{
        minHeight: "100vh",
        backgroundColor: "#F0F8FF" /* Very Light Blue */,
      }}
    >
      <Header
        user={user}
        setUser={setUser}
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
      />
      <main style={{ padding: "20px" }}>{renderContent()}</main>
    </div>
  );
}

export default App;
