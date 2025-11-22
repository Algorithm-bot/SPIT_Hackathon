import React, { useState } from "react";

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
]; // Total: 24 fields

const createInitialState = () =>
  fieldNames.reduce((acc, name) => ({ ...acc, [name]: "" }), {});

function ReportForm({ onReportSubmit }) {
  const [formData, setFormData] = useState(createInitialState());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Numeric-only validation: allow empty, digits, and single decimal
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: "Must be a numeric value." }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let newErrors = {};
    let isValid = true;

    for (const key of fieldNames) {
      // Mandatory and numeric validation
      if (formData[key].trim() === "") {
        newErrors[key] = "This field is mandatory.";
        isValid = false;
      } else if (!/^\d*\.?\d+$/.test(formData[key])) {
        newErrors[key] = "Must be a valid numeric value.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);

      const reportJson = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...formData,
      };

      console.log("--- JSON Report Generated (for Backend): ---");
      console.log(JSON.stringify(reportJson, null, 2));
      console.log("---------------------------------------------");

      setTimeout(() => {
        onReportSubmit(reportJson); // Send data to App.jsx for history storage
        alert("Data submitted successfully! Navigate to History.");
        setIsSubmitting(false);
        setFormData(createInitialState());
      }, 1500);
    } else {
      alert(
        "Please correct the mandatory fields and ensure all values are numeric."
      );
    }
  };

  const formatLabel = (name) =>
    name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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
      <h2>Patient Report Data Entry</h2>
      <p style={{ color: "#0047AB", fontWeight: "bold" }}>
        All 24 fields are mandatory and must contain only numeric values.
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
              placeholder={`Enter value for ${name}`}
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
