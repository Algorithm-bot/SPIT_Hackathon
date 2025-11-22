import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

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
          newReport.prediction = result.prediction;
          newReport.probabilities = result.probabilities;
          newReport.blockchain_entry = result.blockchain_entry;

          // Save to localStorage
          const existingReports =
            JSON.parse(localStorage.getItem("report_history")) || [];
          const updatedReports = [newReport, ...existingReports];
          localStorage.setItem("report_history", JSON.stringify(updatedReports));

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
        maxWidth: "800px",
        margin: "30px auto",
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Toaster position="top-right" reverseOrder={false} />

      <h2>🔬 Patient Report Data Entry</h2>
      <p style={{ color: "#0047AB", fontWeight: "bold" }}>
        All 24 fields are mandatory and must contain only numeric values within
        a realistic clinical range.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {fieldNames.map((name) => (
          <div key={name} style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor={name}
              style={{ marginBottom: "5px", fontWeight: "bold" }}
            >
              {formatLabel(name)}: <span style={{ color: "red" }}>*</span>
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
                padding: "8px",
                border: errors[name] ? "2px solid red" : "1px solid #ccc",
                borderRadius: "4px",
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
            marginTop: "20px",
            padding: "15px",
            backgroundColor: isSubmitting ? "#A0B0E0" : "#007ACC",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: "1.1em",
          }}
        >
          {isSubmitting ? "Analyzing..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

export default ReportForm;
