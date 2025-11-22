import React, { useState } from "react";
import FeatureImportance from "./components/FeatureImportance";

const HistoryPage = ({ reports }) => {
  const [expandedReport, setExpandedReport] = useState(null);

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
        maxWidth: "1200px",
        margin: "40px auto",
        padding: "40px",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: "24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        border: "1px solid rgba(255,255,255,0.5)",
      }}
    >
      <h2 style={{
        fontSize: "2.2rem",
        fontWeight: 800,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "30px",
      }}>
        📋 Report Submission History
      </h2>
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
            <tr style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
            }}>
              <th style={{ padding: "15px", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600 }}>ID</th>
              <th style={{ padding: "15px", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600 }}>
                Date
              </th>
              <th style={{ padding: "15px", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600 }}>
                Patient ID
              </th>
              <th style={{ padding: "15px", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600 }}>
                Prediction
              </th>
              <th style={{ padding: "15px", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600 }}>
                Triage
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
              <th style={{ padding: "15px", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600 }}>Blockchain</th>
              <th style={{ padding: "15px", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <React.Fragment key={report.id}>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px", border: "1px solid #eee", fontFamily: "monospace", fontSize: "0.85em" }}>
                    {report.id}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #eee", fontSize: "0.85em" }}>
                    {new Date(report.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #eee", fontFamily: "monospace", fontSize: "0.85em" }}>
                    {report.patient_id || "N/A"}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #eee", fontWeight: "bold" }}>
                    {report.prediction || "N/A"}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #eee" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "0.85em",
                        fontWeight: "bold",
                        backgroundColor:
                          report.triage_level === "Critical"
                            ? "#ffcccc"
                            : report.triage_level === "High"
                            ? "#ffe6cc"
                            : report.triage_level === "Medium"
                            ? "#ffffcc"
                            : "#ccffcc",
                        color: "#333",
                      }}
                    >
                      {report.triage_level || "N/A"}
                    </span>
                  </td>
                  {displayKeys.map((key) => (
                    <td
                      key={key}
                      style={{ padding: "10px", border: "1px solid #eee" }}
                    >
                      {report[key] !== undefined && report[key] !== null
                        ? typeof report[key] === "number"
                          ? report[key].toLocaleString()
                          : report[key]
                        : "N/A"}
                    </td>
                  ))}
                  <td style={{ padding: "10px", border: "1px solid #eee" }}>
                    {report.blockchain_entry ? (
                      <div style={{ fontSize: "0.75em", fontFamily: "monospace" }}>
                        <div>Block: {report.blockchain_entry.block_index}</div>
                        <div style={{ color: "#666", marginTop: "3px" }}>
                          Hash: {report.blockchain_entry.hash?.substring(0, 12)}...
                        </div>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #eee" }}>
                    <button
                      onClick={() =>
                        setExpandedReport(
                          expandedReport === report.id ? null : report.id
                        )
                      }
                      style={{
                        padding: "8px 16px",
                        background: expandedReport === report.id 
                          ? "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)"
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                        fontWeight: 600,
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        if (expandedReport !== report.id) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
                      }}
                    >
                      {expandedReport === report.id ? " Hide Details" : " Show Details"}
                    </button>
                  </td>
                </tr>
                {expandedReport === report.id && (
                  <tr>
                    <td
                      colSpan={displayKeys.length + 7}
                      style={{
                        padding: "20px",
                        backgroundColor: "#f9f9f9",
                        border: "1px solid #ddd",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "15px",
                          marginBottom: "20px",
                        }}
                      >
                        <div>
                          <strong>Patient ID:</strong>{" "}
                          <span style={{ fontFamily: "monospace", color: "#0047AB" }}>
                            {report.patient_id || "N/A"}
                          </span>
                        </div>
                        <div>
                          <strong>Prediction:</strong>{" "}
                          <span
                            style={{
                              fontWeight: "bold",
                              color:
                                report.triage_level === "Critical"
                                  ? "#d32f2f"
                                  : report.triage_level === "High"
                                  ? "#f57c00"
                                  : report.triage_level === "Medium"
                                  ? "#fbc02d"
                                  : "#388e3c",
                            }}
                          >
                            {report.prediction || "N/A"}
                          </span>
                        </div>
                        <div>
                          <strong>Triage Level:</strong>{" "}
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              backgroundColor:
                                report.triage_level === "Critical"
                                  ? "#ffcccc"
                                  : report.triage_level === "High"
                                  ? "#ffe6cc"
                                  : report.triage_level === "Medium"
                                  ? "#ffffcc"
                                  : "#ccffcc",
                              fontWeight: "bold",
                            }}
                          >
                            {report.triage_level || "N/A"}
                          </span>
                        </div>
                        <div>
                          <strong>Confidence:</strong>{" "}
                          {report.probabilities &&
                            report.probabilities[report.prediction] ? (
                              <span>
                                {(report.probabilities[report.prediction] * 100).toFixed(1)}%
                              </span>
                            ) : (
                              "N/A"
                            )}
                        </div>
                        <div>
                          <strong>Date:</strong>{" "}
                          {new Date(report.timestamp).toLocaleString()}
                        </div>
                        <div>
                          <strong>Blockchain Status:</strong>{" "}
                          {report.blockchain_entry ? (
                            <span
                              style={{
                                color: "#2e7d32",
                                fontWeight: "bold",
                              }}
                            >
                              ✓ Recorded
                            </span>
                          ) : (
                            <span style={{ color: "#d32f2f" }}>✗ Not Available</span>
                          )}
                        </div>
                      </div>

                      {/* Blockchain Data Section */}
                      {report.blockchain_entry && (
                        <div
                          style={{
                            marginBottom: "20px",
                            padding: "20px",
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            border: "2px solid #0047AB",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <h3
                            style={{
                              marginTop: 0,
                              marginBottom: "15px",
                              color: "#0047AB",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            🔗 Blockchain Record
                            <span
                              style={{
                                fontSize: "0.7em",
                                fontWeight: "normal",
                                color: "#666",
                                marginLeft: "auto",
                              }}
                            >
                              Immutable & Auditable
                            </span>
                          </h3>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "15px",
                            }}
                          >
                            <div
                              style={{
                                padding: "12px",
                                backgroundColor: "#f0f7ff",
                                borderRadius: "6px",
                                border: "1px solid #cce5ff",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.85em",
                                  color: "#666",
                                  marginBottom: "4px",
                                }}
                              >
                                Block Index
                              </div>
                              <div
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: "1.1em",
                                  fontWeight: "bold",
                                  color: "#0047AB",
                                }}
                              >
                                #{report.blockchain_entry.block_index ?? "N/A"}
                              </div>
                            </div>

                            <div
                              style={{
                                padding: "12px",
                                backgroundColor: "#f0f7ff",
                                borderRadius: "6px",
                                border: "1px solid #cce5ff",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.85em",
                                  color: "#666",
                                  marginBottom: "4px",
                                }}
                              >
                                Timestamp
                              </div>
                              <div
                                style={{
                                  fontSize: "0.95em",
                                  fontWeight: "500",
                                  color: "#333",
                                }}
                              >
                                {report.blockchain_entry.timestamp
                                  ? new Date(
                                      report.blockchain_entry.timestamp * 1000
                                    ).toLocaleString()
                                  : "N/A"}
                              </div>
                            </div>

                            <div
                              style={{
                                gridColumn: "1 / -1",
                                padding: "12px",
                                backgroundColor: "#fff9e6",
                                borderRadius: "6px",
                                border: "1px solid #ffd700",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.85em",
                                  color: "#666",
                                  marginBottom: "6px",
                                }}
                              >
                                Current Block Hash
                              </div>
                              <div
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: "0.9em",
                                  wordBreak: "break-all",
                                  color: "#856404",
                                  backgroundColor: "#fff",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  border: "1px solid #ffd700",
                                }}
                              >
                                {report.blockchain_entry.hash || "N/A"}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75em",
                                  color: "#666",
                                  marginTop: "6px",
                                  fontStyle: "italic",
                                }}
                              >
                                This hash uniquely identifies this block and ensures data integrity
                              </div>
                            </div>

                            <div
                              style={{
                                gridColumn: "1 / -1",
                                padding: "12px",
                                backgroundColor: "#f0f7ff",
                                borderRadius: "6px",
                                border: "1px solid #cce5ff",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.85em",
                                  color: "#666",
                                  marginBottom: "6px",
                                }}
                              >
                                Previous Block Hash
                              </div>
                              <div
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: "0.85em",
                                  wordBreak: "break-all",
                                  color: "#0047AB",
                                  backgroundColor: "#fff",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  border: "1px solid #cce5ff",
                                }}
                              >
                                {report.blockchain_entry.previous_hash || "Genesis Block"}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75em",
                                  color: "#666",
                                  marginTop: "6px",
                                  fontStyle: "italic",
                                }}
                              >
                                Links this block to the previous block in the chain
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop: "15px",
                              padding: "12px",
                              backgroundColor: "#e8f5e9",
                              borderRadius: "6px",
                              border: "1px solid #4caf50",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                              }}
                            >
                              <span style={{ fontSize: "1.2em" }}>✓</span>
                              <strong style={{ color: "#2e7d32" }}>
                                Immutable Record
                              </strong>
                            </div>
                            <div
                              style={{
                                fontSize: "0.85em",
                                color: "#555",
                                lineHeight: "1.5",
                              }}
                            >
                              This prediction has been permanently recorded on the blockchain.
                              The cryptographic hash ensures that this record cannot be altered
                              without detection, providing a non-repudiable audit trail for
                              medical decision-making.
                            </div>
                          </div>
                        </div>
                      )}

                      {!report.blockchain_entry && (
                        <div
                          style={{
                            marginBottom: "20px",
                            padding: "15px",
                            backgroundColor: "#fff3cd",
                            borderRadius: "8px",
                            border: "1px solid #ffc107",
                            textAlign: "center",
                            color: "#856404",
                          }}
                        >
                          ⚠️ Blockchain data not available for this report
                        </div>
                      )}

                      {/* Feature Importance */}
                      {report.feature_importance && (
                        <FeatureImportance
                          featureImportance={report.feature_importance}
                          patientValues={report}
                          topN={5}
                        />
                      )}

                      {!report.feature_importance && (
                        <div
                          style={{
                            padding: "15px",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "8px",
                            textAlign: "center",
                            color: "#666",
                            fontStyle: "italic",
                          }}
                        >
                          Feature importance data not available for this report
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <p
          style={{ marginTop: "10px", fontStyle: "italic", fontSize: "0.8em" }}
        >
          *Only key parameters are displayed here. Full report data is stored
          locally. All predictions are immutably logged on the blockchain for audit purposes.*
        </p>
      </div>
    </div>
  );
};

export default HistoryPage;
