import joblib
import numpy as np
import os

# ---------------------------------------------------------
# 1. SETUP PATHS & LOAD SCALER
# ---------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCALER_PATH = os.path.join(BASE_DIR, "model", "standard_scaler.pkl")

saved_scaler = None

# Try to load the scaler
try:
    if os.path.exists(SCALER_PATH):
        saved_scaler = joblib.load(SCALER_PATH)
    else:
        # Check parent directory fallback
        PARENT_PATH = os.path.join(BASE_DIR, "..", "model", "standard_scaler.pkl")
        if os.path.exists(PARENT_PATH):
            saved_scaler = joblib.load(PARENT_PATH)
            SCALER_PATH = PARENT_PATH
        else:
            print("⚠️ WARNING: Scaler not found. KNN predictions will fail.")
except Exception as e:
    print(f"Error loading scaler: {e}")

# ---------------------------------------------------------
# 2. DEFINE CLINICAL RANGES (REQUIRED FOR NORMALIZATION)
# ---------------------------------------------------------
# These match the Min/Max used to create your 0-1 training data.
CLINICAL_RANGES = {
    'Glucose': (70, 140),  # mg/dL
            'Cholesterol': (125, 200),  # mg/dL
            'Hemoglobin': (12, 18),  # g/dL
            'Platelets': (150000, 450000),  # per microliter of blood
            'White Blood Cells': (4000, 11000),  # per cubic millimeter of blood
            'Red Blood Cells': (4.0, 6.1),  # million cells per microliter of blood
            'Hematocrit': (36, 54),  # percentage
            'Mean Corpuscular Volume': (80, 100),  # femtoliters
            'Mean Corpuscular Hemoglobin': (27, 33),  # picograms
            'Mean Corpuscular Hemoglobin Concentration': (32, 36),  # grams per deciliter
            'Insulin': (2, 25),  # microU/mL
            'BMI': (18.5, 30),  # kg/m^2
            'Systolic Blood Pressure': (90, 140),  # mmHg
            'Diastolic Blood Pressure': (60, 90),  # mmHg
            'Triglycerides': (50, 200),  # mg/dL
            'HbA1c': (4, 6.5),  # percentage
            'LDL Cholesterol': (50, 130),  # mg/dL
            'HDL Cholesterol': (40, 80),  # mg/dL
            'ALT': (7, 56),  # U/L
            'AST': (10, 40),  # U/L
            'Heart Rate': (60, 100),  # beats per minute
            'Creatinine': (0.6, 1.3),  # mg/dL
            'Troponin': (0, 0.04),  # ng/mL
            'C-reactive Protein': (0, 10),  # mg/L
            
}

def get_clinical_key(feature_name):
    """Convert feature name with underscores to space-separated format for CLINICAL_RANGES."""
    # Map underscore names to space-separated names
    return feature_name.replace('_', ' ')

def normalize_value(key, value):
    """Converts raw value (e.g. 105) to 0-1 range based on clinical limits."""
    # Convert key to match CLINICAL_RANGES format
    clinical_key = get_clinical_key(key)
    
    if clinical_key not in CLINICAL_RANGES:
        return value # Fallback
        
    min_val, max_val = CLINICAL_RANGES[clinical_key]
    
    # Formula: (x - min) / (max - min)
    normalized = (value - min_val) / (max_val - min_val)
    
    # Clip to ensure it stays between 0 and 1
    return max(0.0, min(1.0, normalized))

# ---------------------------------------------------------
# 3. MAIN PROCESSING FUNCTION
# ---------------------------------------------------------

def get_model_input(raw_data, model_type="xgboost"):
    """
    Args:
        raw_data: dict of RAW clinical values {"Glucose": 105, ...}
        model_type: "xgboost" or "knn"
    """
    
    EXPECTED_FEATURES_ORDER = [
        "Glucose", "Cholesterol", "Hemoglobin", "Platelets", "White_Blood_Cells",
        "Red_Blood_Cells", "Hematocrit", "Mean_Corpuscular_Volume",
        "Mean_Corpuscular_Hemoglobin", "Mean_Corpuscular_Hemoglobin_Concentration",
        "Insulin", "BMI", "Systolic_Blood_Pressure", "Diastolic_Blood_Pressure",
        "Triglycerides", "HbA1c", "LDL_Cholesterol", "HDL_Cholesterol",
        "ALT", "AST", "Heart_Rate", "Creatinine", "Troponin", "C_reactive_Protein"
    ]
    
    # 1. Normalize Raw Values -> 0-1 Range
    normalized_features = []
    print("\n--- Normalization Values ---")
    for feature in EXPECTED_FEATURES_ORDER:
        raw_val = float(raw_data.get(feature, 0))
        norm_val = normalize_value(feature, raw_val)
        normalized_features.append(norm_val)
        # Get clinical range for display
        clinical_key = get_clinical_key(feature)
        if clinical_key in CLINICAL_RANGES:
            min_val, max_val = CLINICAL_RANGES[clinical_key]
            print(f"{feature:35s} | Raw: {raw_val:10.4f} | Range: [{min_val:6.2f}, {max_val:6.2f}] | Normalized: {norm_val:.6f}")
        else:
            print(f"{feature:35s} | Raw: {raw_val:10.4f} | Range: [N/A] | Normalized: {norm_val:.6f}")
    print("--- End Normalization Values ---\n")
    
    # Reshape for model (1 sample, 24 features)
    # This 'X_normalized' now matches the format of your train.csv
    X_normalized = np.array(normalized_features).reshape(1, -1)

    # 2. Return based on Model Requirement
    if model_type == "xgboost":
        # XGBoost was trained on the 0-1 CSV data directly.
        return X_normalized
        
    elif model_type == "knn":
        # KNN was trained on StandardScaled version of the 0-1 data.
        if saved_scaler is None:
            raise ValueError("Scaler not loaded.")
            
        # Transform the 0-1 data into Standard Scale
        X_scaled = saved_scaler.transform(X_normalized)
        return X_scaled
        
    else:
        raise ValueError(f"Unknown model type: {model_type}")

# --- Test Block ---
if __name__ == "__main__":
    print("--- Testing Normalization Logic ---")
    test_data = {"Glucose": 105, "Cholesterol": 200}
    
    # Manually check calculation for Glucose (Range 50-500)
    # (105 - 50) / (500 - 50) = 55 / 450 = 0.122
    
    output = get_model_input(test_data, "xgboost")
    print(f"Raw Glucose: {test_data['Glucose']}")
    print(f"Normalized Input to Model: {output[0][0]:.4f}") 
    
    if 0.12 < output[0][0] < 0.13:
        print("✅ Correct! 105 converted to approx 0.12")
    else:
        print("❌ Incorrect normalization.")