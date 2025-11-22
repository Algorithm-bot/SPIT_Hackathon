import React from "react";

// Feature names in the order they appear in the importance array
const FEATURE_NAMES = [
  "Glucose",
  "Cholesterol",
  "Hemoglobin",
  "Platelets",
  "White Blood Cells",
  "Red Blood Cells",
  "Hematocrit",
  "Mean Corpuscular Volume",
  "Mean Corpuscular Hemoglobin",
  "Mean Corpuscular Hemoglobin Concentration",
  "Insulin",
  "BMI",
  "Systolic Blood Pressure",
  "Diastolic Blood Pressure",
  "Triglycerides",
  "HbA1c",
  "LDL Cholesterol",
  "HDL Cholesterol",
  "ALT",
  "AST",
  "Heart Rate",
  "Creatinine",
  "Troponin",
  "C-reactive Protein",
];

// Risk indicators for high values (markers that indicate risk when elevated)
const HIGH_RISK_MARKERS = {
  "Glucose": "High glucose levels indicate diabetes risk",
  "Cholesterol": "Elevated cholesterol increases cardiovascular risk",
  "Troponin": "High troponin suggests heart muscle damage",
  "C-reactive Protein": "Elevated CRP indicates inflammation",
  "Creatinine": "High creatinine may indicate kidney dysfunction",
  "HbA1c": "Elevated HbA1c indicates poor blood sugar control",
  "LDL Cholesterol": "High LDL increases cardiovascular risk",
  "Systolic Blood Pressure": "High systolic pressure indicates hypertension",
  "Diastolic Blood Pressure": "High diastolic pressure indicates hypertension",
  "ALT": "Elevated ALT suggests liver damage",
  "AST": "Elevated AST suggests liver or heart damage",
  "Triglycerides": "High triglycerides increase cardiovascular risk",
  "Insulin": "High insulin may indicate insulin resistance",
  "BMI": "High BMI increases risk of multiple conditions",
};

// Risk indicators for low values
const LOW_RISK_MARKERS = {
  "Hemoglobin": "Low hemoglobin indicates anemia",
  "Red Blood Cells": "Low RBC count suggests anemia",
  "Hematocrit": "Low hematocrit indicates anemia",
  "Platelets": "Low platelet count increases bleeding risk",
  "White Blood Cells": "Low WBC count may indicate immune system issues",
  "HDL Cholesterol": "Low HDL increases cardiovascular risk",
};

// Map frontend field names to backend feature names
const FRONTEND_TO_BACKEND_MAP = {
  "glucose": "Glucose",
  "cholesterol": "Cholesterol",
  "hemoglobin": "Hemoglobin",
  "platelets": "Platelets",
  "white blood cells": "White Blood Cells",
  "red blood cells": "Red Blood Cells",
  "Hematocrit": "Hematocrit",
  "Mean Corpuscular Volume": "Mean Corpuscular Volume",
  "Mean Corpuscular Hemoglobin": "Mean Corpuscular Hemoglobin",
  "Mean Corpuscular Hemoglobin Concentration": "Mean Corpuscular Hemoglobin Concentration",
  "Insulin": "Insulin",
  "BMI": "BMI",
  "Systolic Blood Pressure": "Systolic Blood Pressure",
  "Diastolic Blood Pressure": "Diastolic Blood Pressure",
  "Triglycerides": "Triglycerides",
  "HbA1c": "HbA1c",
  "LDL Cholesterol": "LDL Cholesterol",
  "HDL Cholesterol": "HDL Cholesterol",
  "ALT": "ALT",
  "AST": "AST",
  "Heart Rate": "Heart Rate",
  "Creatinine": "Creatinine",
  "Troponin": "Troponin",
  "C-reactive Protein": "C-reactive Protein",
};

const FeatureImportance = ({ featureImportance, patientValues = {}, topN = 5 }) => {
  if (!featureImportance || featureImportance.length === 0) {
    return (
      <div style={{ padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
        <p style={{ color: "#666", fontStyle: "italic" }}>
          Feature importance data not available
        </p>
      </div>
    );
  }

  // Helper function to get patient value for a feature
  const getPatientValue = (backendFeatureName) => {
    // Try direct match first
    if (patientValues[backendFeatureName]) {
      return patientValues[backendFeatureName];
    }
    
    // Try finding in frontend field names
    for (const [frontendKey, backendValue] of Object.entries(FRONTEND_TO_BACKEND_MAP)) {
      if (backendValue === backendFeatureName && patientValues[frontendKey]) {
        return patientValues[frontendKey];
      }
    }
    
    // Try case-insensitive match
    const lowerBackend = backendFeatureName.toLowerCase();
    for (const [key, value] of Object.entries(patientValues)) {
      if (key.toLowerCase() === lowerBackend) {
        return value;
      }
    }
    
    return null;
  };

  // Map feature importance to feature names
  const featureData = FEATURE_NAMES.map((name, index) => ({
    name,
    importance: featureImportance[index] || 0,
    value: getPatientValue(name),
  }));

  // Sort by importance and get top N
  const topFeatures = featureData
    .sort((a, b) => b.importance - a.importance)
    .slice(0, topN);

  // Find the maximum importance for scaling
  const maxImportance = Math.max(...topFeatures.map((f) => f.importance));

  // Reference ranges for risk assessment (simplified - in production use clinical guidelines)
  const REFERENCE_RANGES = {
    "Glucose": { normal: [70, 100], high: 126 },
    "Troponin": { normal: [0, 0.04], high: 0.04 },
    "C-reactive Protein": { normal: [0, 3], high: 3 },
    "Creatinine": { normal: [0.6, 1.2], high: 1.2 },
    "HbA1c": { normal: [4, 5.7], high: 6.5 },
    "LDL Cholesterol": { normal: [0, 100], high: 160 },
    "Systolic Blood Pressure": { normal: [90, 120], high: 140 },
    "Diastolic Blood Pressure": { normal: [60, 80], high: 90 },
    "Hemoglobin": { normal: [12, 16], low: 12 },
    "Red Blood Cells": { normal: [4.5, 5.5], low: 4.5 },
    "Hematocrit": { normal: [36, 46], low: 36 },
    "Platelets": { normal: [150000, 450000], low: 150000 },
    "HDL Cholesterol": { normal: [40, 60], low: 40 },
  };

  // Get risk indicators for top features
  const getRiskIndicator = (featureName, value) => {
    if (value === null || value === undefined) return null;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    const range = REFERENCE_RANGES[featureName];
    const highRisk = HIGH_RISK_MARKERS[featureName];
    const lowRisk = LOW_RISK_MARKERS[featureName];

    if (range) {
      if (range.high !== undefined && numValue > range.high && highRisk) {
        return {
          type: "high",
          message: highRisk,
          severity: numValue > range.high * 1.5 ? "critical" : "warning",
        };
      }
      if (range.low !== undefined && numValue < range.low && lowRisk) {
        return {
          type: "low",
          message: lowRisk,
          severity: numValue < range.low * 0.7 ? "critical" : "warning",
        };
      }
    } else {
      // Fallback to general markers if no specific range
      if (highRisk) {
        return { type: "high", message: highRisk, severity: "info" };
      }
      if (lowRisk) {
        return { type: "low", message: lowRisk, severity: "info" };
      }
    }

    return null;
  };

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#0047AB" }}>
        🔍 Risk Indicators (Explainability)
      </h3>
      
      {/* Summary of top driving factors */}
      {topFeatures.length > 0 && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#e7f3ff",
            borderRadius: "6px",
            marginBottom: "20px",
            borderLeft: "4px solid #0047AB",
          }}
        >
          <strong style={{ color: "#0047AB" }}>Prediction Driven By:</strong>{" "}
          <span style={{ color: "#333" }}>
            {topFeatures
              .slice(0, 3)
              .map((f, idx) => {
                const riskIndicator = getRiskIndicator(f.name, f.value);
                const riskText =
                  riskIndicator?.type === "high"
                    ? "high"
                    : riskIndicator?.type === "low"
                    ? "low"
                    : "abnormal";
                return `${riskText} ${f.name}`;
              })
              .join(", ")}
            {topFeatures.length > 3 && " and others"}
          </span>
        </div>
      )}

      <p style={{ color: "#666", fontSize: "0.9em", marginBottom: "20px" }}>
        The following blood markers were the most influential in driving this prediction:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {topFeatures.map((feature, index) => {
          const percentage = (feature.importance / maxImportance) * 100;
          const riskIndicator = getRiskIndicator(feature.name, feature.value);

          return (
            <div
              key={feature.name}
              style={{
                padding: "12px",
                backgroundColor: "white",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "0.95em" }}>
                  {index + 1}. {feature.name}
                </span>
                <span
                  style={{
                    fontSize: "0.85em",
                    color: "#666",
                    fontFamily: "monospace",
                  }}
                >
                  {(feature.importance * 100).toFixed(2)}%
                </span>
              </div>

              {/* Bar Chart */}
              <div
                style={{
                  width: "100%",
                  height: "24px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    backgroundColor:
                      index === 0
                        ? "#ff4444"
                        : index === 1
                        ? "#ff8844"
                        : index === 2
                        ? "#ffaa44"
                        : "#44aaff",
                    transition: "width 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                  }}
                >
                  {percentage > 15 && (
                    <span
                      style={{
                        color: "white",
                        fontSize: "0.75em",
                        fontWeight: "bold",
                      }}
                    >
                      {feature.importance > 0.1
                        ? "High Impact"
                        : "Moderate Impact"}
                    </span>
                  )}
                </div>
              </div>

              {/* Risk Indicator Message */}
              {riskIndicator && feature.value !== null && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px",
                    backgroundColor:
                      riskIndicator.severity === "critical"
                        ? riskIndicator.type === "high"
                          ? "#f8d7da"
                          : "#d1ecf1"
                        : riskIndicator.type === "high"
                        ? "#fff3cd"
                        : "#d1ecf1",
                    borderRadius: "4px",
                    fontSize: "0.85em",
                    color:
                      riskIndicator.severity === "critical"
                        ? riskIndicator.type === "high"
                          ? "#721c24"
                          : "#0c5460"
                        : "#856404",
                    borderLeft: `3px solid ${
                      riskIndicator.severity === "critical"
                        ? riskIndicator.type === "high"
                          ? "#dc3545"
                          : "#0c5460"
                        : riskIndicator.type === "high"
                        ? "#ffc107"
                        : "#0c5460"
                    }`,
                  }}
                >
                  <strong>
                    {riskIndicator.severity === "critical" ? "🚨" : "⚠️"} Risk
                    Indicator:
                  </strong>{" "}
                  {riskIndicator.message}
                  {feature.value !== null && (
                    <span style={{ marginLeft: "8px", fontFamily: "monospace" }}>
                      (Value: {feature.value})
                    </span>
                  )}
                </div>
              )}

              {/* Patient Value Display */}
              {feature.value !== null && !riskIndicator && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "0.85em",
                    color: "#666",
                  }}
                >
                  Patient Value: <strong>{feature.value}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#e7f3ff",
          borderRadius: "4px",
          fontSize: "0.85em",
          color: "#004085",
        }}
      >
        <strong>💡 Interpretation:</strong> Features with higher importance
        values had a stronger influence on the AI's prediction. The top markers
        shown above were the primary drivers of the diagnostic decision.
      </div>
    </div>
  );
};

export default FeatureImportance;

