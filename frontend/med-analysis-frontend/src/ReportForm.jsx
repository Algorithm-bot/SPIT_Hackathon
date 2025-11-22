import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import FeatureImportance from "./components/FeatureImportance";

// --- Constants (Data & Ranges) ---
const REALISTIC_RANGES = {
  glucose: { min: 30, max: 800, unit: "mg/dL" },
  cholesterol: { min: 50, max: 800, unit: "mg/dL" },
  hemoglobin: { min: 3, max: 25, unit: "g/dL" },
  platelets: { min: 10000, max: 1500000, unit: "cells/µL" },
  "white blood cells": { min: 500, max: 50000, unit: "cells/µL" },
  "red blood cells": { min: 1, max: 8, unit: "M/µL" },
  Hematocrit: { min: 10, max: 65, unit: "%" },
  "Mean Corpuscular Volume": { min: 50, max: 150, unit: "fL" },
  "Mean Corpuscular Hemoglobin": { min: 10, max: 50, unit: "pg" },
  "Mean Corpuscular Hemoglobin Concentration": {
    min: 20,
    max: 45,
    unit: "g/dL",
  },
  Insulin: { min: 1, max: 200, unit: "µIU/mL" },
  BMI: { min: 10, max: 70, unit: "kg/m²" },
  "Systolic Blood Pressure": { min: 50, max: 300, unit: "mmHg" },
  "Diastolic Blood Pressure": { min: 30, max: 200, unit: "mmHg" },
  Triglycerides: { min: 10, max: 2000, unit: "mg/dL" },
  HbA1c: { min: 3, max: 20, unit: "%" },
  "LDL Cholesterol": { min: 0, max: 600, unit: "mg/dL" },
  "HDL Cholesterol": { min: 5, max: 200, unit: "mg/dL" },
  ALT: { min: 1, max: 1000, unit: "U/L" },
  AST: { min: 1, max: 1000, unit: "U/L" },
  "Heart Rate": { min: 30, max: 250, unit: "beats/min" },
  Creatinine: { min: 0.1, max: 20, unit: "mg/dL" },
  Troponin: { min: 0, max: 500, unit: "ng/L" },
  "C-reactive Protein": { min: 0, max: 500, unit: "mg/L" },
};

const fieldNames = [
  "glucose",
  "cholesterol",
  "hemoglobin",
  "platelets",
  "white blood cells",
  "red blood cells",
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

const createInitialState = () =>
  fieldNames.reduce((acc, name) => ({ ...acc, [name]: "" }), {});

// Helper function to format field labels
const formatLabel = (name) =>
  name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// Map frontend field names to backend API field names
const mapToBackendFormat = (frontendData) => {
  const fieldMapping = {
    "glucose": "Glucose",
    "cholesterol": "Cholesterol",
    "hemoglobin": "Hemoglobin",
    "platelets": "Platelets",
    "white blood cells": "White_Blood_Cells",
    "red blood cells": "Red_Blood_Cells",
    "Hematocrit": "Hematocrit",
    "Mean Corpuscular Volume": "Mean_Corpuscular_Volume",
    "Mean Corpuscular Hemoglobin": "Mean_Corpuscular_Hemoglobin",
    "Mean Corpuscular Hemoglobin Concentration": "Mean_Corpuscular_Hemoglobin_Concentration",
    "Insulin": "Insulin",
    "BMI": "BMI",
    "Systolic Blood Pressure": "Systolic_Blood_Pressure",
    "Diastolic Blood Pressure": "Diastolic_Blood_Pressure",
    "Triglycerides": "Triglycerides",
    "HbA1c": "HbA1c",
    "LDL Cholesterol": "LDL_Cholesterol",
    "HDL Cholesterol": "HDL_Cholesterol",
    "ALT": "ALT",
    "AST": "AST",
    "Heart Rate": "Heart_Rate",
    "Creatinine": "Creatinine",
    "Troponin": "Troponin",
    "C-reactive Protein": "C_reactive_Protein",
  };

  const backendData = {};
  for (const [frontendKey, value] of Object.entries(frontendData)) {
    const backendKey = fieldMapping[frontendKey];
    if (backendKey) {
      // Convert string value to float
      backendData[backendKey] = parseFloat(value);
    }
  }
  return backendData;
};

// --- ReportForm Component ---

function ReportForm() {
  // Removed onReportSubmit prop
  const [formData, setFormData] = useState(createInitialState());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Handles input change and basic numeric validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: "Must be a numeric value." }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setFormData({ ...formData, [name]: value });
  };

  // Validates mandatory fields and checks against realistic ranges
  const validate = () => {
    let newErrors = {};
    let isValid = true;
    let firstErrorMsg = "";

    for (const key of fieldNames) {
      const value = formData[key].trim();
      const numValue = parseFloat(value);
      const range = REALISTIC_RANGES[key];

      // 1. Mandatory and Numeric Validation
      if (value === "" || !/^\d*\.?\d+$/.test(value)) {
        newErrors[key] = "Required and must be numeric.";
        isValid = false;
        if (!firstErrorMsg)
          firstErrorMsg = `"${formatLabel(
            key
          )}" is mandatory or not a valid number.`;
      }
      // 2. Realistic Range Check
      else if (range && (numValue < range.min || numValue > range.max)) {
        newErrors[
          key
        ] = `Value outside range (${range.min} - ${range.max} ${range.unit}).`;
        isValid = false;
        if (!firstErrorMsg)
          firstErrorMsg = `"${formatLabel(
            key
          )}" is outside the realistic range.`;
      }
    }

    setErrors(newErrors);

    if (!isValid) {
      toast.error(`Validation Failed: ${firstErrorMsg}`, { duration: 4000 });
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);

      const newReport = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...formData,
      };

      console.log("--- JSON Report Generated (for Backend): ---", newReport);

      try {
        // Map frontend field names to backend format
        const backendData = mapToBackendFormat(formData);
        // Patient ID will be auto-generated by the backend
        console.log("--- Mapped to Backend Format: ---", backendData);

        // Call backend API
        const API_URL = "http://localhost:8000/predict";
        
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backendData),
        });

        const result = await response.json();

        if (result.status === "success") {
          // Add prediction result to report
          newReport.patient_id = result.patient_id;
          newReport.prediction = result.prediction;
          newReport.triage_level = result.triage_level;
          newReport.probabilities = result.probabilities;
          newReport.feature_importance = result.feature_importance;
          newReport.blockchain_entry = result.blockchain_entry;

          // Save to localStorage
          const existingReports =
            JSON.parse(localStorage.getItem("report_history")) || [];
          const updatedReports = [newReport, ...existingReports];
          localStorage.setItem("report_history", JSON.stringify(updatedReports));

          // Store result for display
          setLastResult({
            ...result,
            patientValues: formData,
          });

          toast.success(
            `Report submitted! Predicted Disease: ${result.prediction}`,
            { duration: 5000 }
          );
          
          console.log("✅ Prediction Result:", result);
        } else {
          // Handle errors from backend
          const errorMsg = result.errors 
            ? result.errors.join(", ") 
            : result.message || "Unknown error";
          toast.error(`Prediction failed: ${errorMsg}`, { duration: 5000 });
          console.error("❌ Prediction Error:", result);
        }
      } catch (error) {
        console.error("❌ Network Error:", error);
        toast.error(
          `Failed to connect to backend. Make sure the server is running on http://localhost:8000`,
          { duration: 5000 }
        );
      } finally {
        setIsSubmitting(false);
        setFormData(createInitialState());
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "40px",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: "24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        border: "1px solid rgba(255,255,255,0.5)",
      }}
    >
      <Toaster position="top-right" reverseOrder={false} />

      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ 
          fontSize: "2.2rem",
          fontWeight: 800,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "12px",
        }}>
          🔬 Patient Report Data Entry
        </h2>
        <p style={{ 
          color: "#4F6076", 
          fontSize: "1.05rem",
          lineHeight: "1.6",
        }}>
          All 24 fields are mandatory and must contain only numeric values within
          a realistic clinical range. A unique Patient ID will be automatically generated for each submission.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {fieldNames.map((name) => (
          <div key={name} style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor={name}
              style={{ 
                marginBottom: "8px", 
                fontWeight: 600,
                color: "#2C3E50",
                fontSize: "0.95rem",
              }}
            >
              {formatLabel(name)}: <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="text"
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              placeholder={`Range: ${REALISTIC_RANGES[name].min} - ${REALISTIC_RANGES[name].max} ${REALISTIC_RANGES[name].unit}`}
              required
              style={{
                padding: "12px 16px",
                border: errors[name] ? "2px solid #e74c3c" : "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                backgroundColor: "#fff",
              }}
              onFocus={(e) => {
                if (!errors[name]) {
                  e.currentTarget.style.borderColor = "#667eea";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }
              }}
              onBlur={(e) => {
                if (!errors[name]) {
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            />
            {errors[name] && (
              <span
                style={{ color: "red", fontSize: "0.9em", marginTop: "3px" }}
              >
                {errors[name]}
              </span>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            gridColumn: "1 / -1",
            marginTop: "30px",
            padding: "18px 32px",
            background: isSubmitting 
              ? "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "50px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: "1.15rem",
            fontWeight: 700,
            transition: "all 0.3s ease",
            boxShadow: isSubmitting 
              ? "0 4px 15px rgba(149, 165, 166, 0.3)"
              : "0 6px 24px rgba(102, 126, 234, 0.4)",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(102, 126, 234, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(102, 126, 234, 0.4)";
            }
          }}
        >
          {isSubmitting ? "⏳ Analyzing..." : "🚀 Submit Report"}
        </button>
      </form>

      {/* Display Results with Feature Importance */}
      {lastResult && (
        <div
          style={{
            marginTop: "40px",
            padding: "30px",
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
            borderRadius: "20px",
            border: "2px solid rgba(102, 126, 234, 0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: "20px",
            fontSize: "1.8rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            📊 Prediction Results
          </h3>
          
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
              <span style={{ fontFamily: "monospace" }}>
                {lastResult.patient_id}
              </span>
            </div>
            <div>
              <strong>Prediction:</strong>{" "}
              <span
                style={{
                  fontWeight: "bold",
                  color:
                    lastResult.triage_level === "Critical"
                      ? "#d32f2f"
                      : lastResult.triage_level === "High"
                      ? "#f57c00"
                      : lastResult.triage_level === "Medium"
                      ? "#fbc02d"
                      : "#388e3c",
                }}
              >
                {lastResult.prediction}
              </span>
            </div>
            <div>
              <strong>Triage Level:</strong>{" "}
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor:
                    lastResult.triage_level === "Critical"
                      ? "#ffcccc"
                      : lastResult.triage_level === "High"
                      ? "#ffe6cc"
                      : lastResult.triage_level === "Medium"
                      ? "#ffffcc"
                      : "#ccffcc",
                  fontWeight: "bold",
                }}
              >
                {lastResult.triage_level}
              </span>
            </div>
            <div>
              <strong>Confidence:</strong>{" "}
              {lastResult.probabilities &&
                lastResult.probabilities[lastResult.prediction] && (
                  <span>
                    {(
                      lastResult.probabilities[lastResult.prediction] * 100
                    ).toFixed(1)}
                    %
                  </span>
                )}
            </div>
          </div>

          {/* Feature Importance Component */}
          {lastResult.feature_importance && (
            <FeatureImportance
              featureImportance={lastResult.feature_importance}
              patientValues={lastResult.patientValues}
              topN={5}
            />
          )}

          <div style={{ marginTop: "15px", textAlign: "right" }}>
            <button
              onClick={() => setLastResult(null)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportForm;
