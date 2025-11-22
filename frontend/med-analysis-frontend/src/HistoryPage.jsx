import React from "react";

const HistoryPage = ({ reports }) => {
  if (reports.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
        }}
      >
        <h2>No Reports Found</h2>
        <p>Submit a new analysis form to view your history here.</p>
      </div>
    );
  }

  // Display only key columns for table readability
  const displayKeys = ["glucose", "cholesterol", "hemoglobin", "BMI"];

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2>📋 Report Submission History</h2>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            fontSize: "0.9em",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#ADD8E6" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Date
              </th>
              {displayKeys.map((key) => (
                <th
                  key={key}
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    textTransform: "capitalize",
                  }}
                >
                  {key}
                </th>
              ))}
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>...</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px", border: "1px solid #eee" }}>
                  {report.id}
                </td>
                <td style={{ padding: "10px", border: "1px solid #eee" }}>
                  {new Date(report.timestamp).toLocaleString()}
                </td>
                {displayKeys.map((key) => (
                  <td
                    key={key}
                    style={{ padding: "10px", border: "1px solid #eee" }}
                  >
                    {report[key]}
                  </td>
                ))}
                <td style={{ padding: "10px", border: "1px solid #eee" }}>
                  ...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p
          style={{ marginTop: "10px", fontStyle: "italic", fontSize: "0.8em" }}
        >
          *Only key parameters are displayed here. Full report data is stored
          locally.*
        </p>
      </div>
    </div>
  );
};

export default HistoryPage;
