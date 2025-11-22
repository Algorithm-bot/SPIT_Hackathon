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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);

      const newReport = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...formData,
      };

      console.log("--- JSON Report Generated (for Backend): ---", newReport);

      // Simulate Backend Call and Storage
      setTimeout(() => {
        // 🔑 1. FETCH existing history from localStorage
        const existingReports =
          JSON.parse(localStorage.getItem("report_history")) || [];

        // 🔑 2. CREATE the updated list (new report first)
        const updatedReports = [newReport, ...existingReports];

        // 🔑 3. STORE the updated list back into localStorage
        localStorage.setItem("report_history", JSON.stringify(updatedReports));

        toast.success("Report submitted successfully and saved to history!", {
          duration: 3000,
        });
        setIsSubmitting(false);
        setFormData(createInitialState());
      }, 1500);
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
