import joblib
import json
import numpy as np
import pandas as pd
import os

# Clinical value ranges for min-max normalization (raw values to 0-1)
# These are typical ranges found in clinical practice
CLINICAL_RANGES = {
    "Glucose": (50, 500),  # mg/dL (normal: 70-100, diabetic can be 200+)
    "Cholesterol": (100, 400),  # mg/dL (normal: <200)
    "Hemoglobin": (5, 20),  # g/dL (normal: 12-16 for women, 14-18 for men)
    "Platelets": (50000, 600000),  # per microliter (normal: 150,000-450,000)
    "White_Blood_Cells": (2000, 30000),  # per microliter (normal: 4,000-11,000)
    "Red_Blood_Cells": (2, 8),  # million cells per microliter (normal: 4.5-5.5)
    "Hematocrit": (20, 60),  # % (normal: 36-48 for women, 40-52 for men)
    "Mean_Corpuscular_Volume": (60, 120),  # fL (normal: 80-100)
    "Mean_Corpuscular_Hemoglobin": (15, 40),  # pg (normal: 27-31)
    "Mean_Corpuscular_Hemoglobin_Concentration": (25, 40),  # g/dL (normal: 32-36)
    "Insulin": (2, 50),  # μU/mL (normal: 2-25)
    "BMI": (15, 50),  # kg/m² (normal: 18.5-24.9)
    "Systolic_Blood_Pressure": (80, 200),  # mmHg (normal: <120)
    "Diastolic_Blood_Pressure": (40, 120),  # mmHg (normal: <80)
    "Triglycerides": (50, 1000),  # mg/dL (normal: <150)
    "HbA1c": (3, 15),  # % (normal: <5.7, diabetic: >6.5)
    "LDL_Cholesterol": (50, 300),  # mg/dL (normal: <100)
    "HDL_Cholesterol": (20, 100),  # mg/dL (normal: >40 for men, >50 for women)
    "ALT": (5, 200),  # U/L (normal: 7-56)
    "AST": (5, 200),  # U/L (normal: 10-40)
    "Heart_Rate": (40, 150),  # bpm (normal: 60-100)
    "Creatinine": (0.5, 10),  # mg/dL (normal: 0.6-1.2)
    "Troponin": (0, 50),  # ng/mL (normal: <0.04)
    "C_reactive_Protein": (0, 50)  # mg/L (normal: <3)
}

def normalize_to_0_1(value, min_val, max_val):
    """
    Normalize a raw clinical value to 0-1 range using min-max scaling.
    Clips values outside the range to [0, 1].
    """
    try:
        normalized = (value - min_val) / (max_val - min_val)
        # Clip to [0, 1] to handle outliers
        return max(0.0, min(1.0, normalized))
    except ZeroDivisionError:
        return 0.0

def scale_input(raw_data, scaler_config=None):
    """
    Convert raw clinical values (e.g., 120 mg/dL) to the format expected by the model.
    
    Process:
    1. Normalize raw values to 0-1 range using clinical ranges
    2. Create feature engineering (ratios, etc.)
    3. Apply feature selector
    4. Apply StandardScaler transformation
    
    Args:
        raw_data: dict with raw clinical values (e.g., {"Glucose": 120.0, ...})
        scaler_config: optional scaler config dict (if None, loads from file)
    
    Returns:
        numpy array ready for model prediction
    """
    try:
        # Load scaler components
        scaler_path = "model/scaler_improved.pkl"
        feature_selector_path = "model/feature_selector.pkl"
        scaler_json_path = "model/scaler_improved.json"
        
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler not found at {scaler_path}")
        
        scaler_improved = joblib.load(scaler_path)
        feature_selector = joblib.load(feature_selector_path)
        
        if scaler_config is None:
            scaler_data = json.load(open(scaler_json_path))
        else:
            scaler_data = scaler_config
        
        selected_features = scaler_data["selected_features"]
        
        # Step 1: Normalize raw values to 0-1 range using clinical ranges
        normalized_data = {}
        for key, value in raw_data.items():
            if key in CLINICAL_RANGES:
                min_val, max_val = CLINICAL_RANGES[key]
                normalized_data[key] = normalize_to_0_1(value, min_val, max_val)
            else:
                # If key not in ranges, assume it's already normalized or use value as-is
                normalized_data[key] = value
        
        # Step 2: Create DataFrame with normalized values
        # Ensure all base features are present (fill missing with 0.5 as default normalized value)
        all_base_features = list(CLINICAL_RANGES.keys())
        for feature in all_base_features:
            if feature not in normalized_data:
                normalized_data[feature] = 0.5  # Default to middle of normalized range
        
        X = pd.DataFrame([normalized_data])
        
        # Step 3: Add engineered features (these should be calculated on normalized values)
        # These engineered features are needed by the feature selector
        if 'HDL_Cholesterol' in X.columns and 'LDL_Cholesterol' in X.columns:
            # Calculate ratio on normalized values
            X['HDL_LDL_Ratio'] = X['HDL_Cholesterol'] / (X['LDL_Cholesterol'] + 1e-6)
        else:
            X['HDL_LDL_Ratio'] = 0.0
        
        if 'Systolic_Blood_Pressure' in X.columns and 'Diastolic_Blood_Pressure' in X.columns:
            # Pulse pressure on normalized values
            X['Pulse_Pressure'] = X['Systolic_Blood_Pressure'] - X['Diastolic_Blood_Pressure']
        else:
            X['Pulse_Pressure'] = 0.0
        
        if 'Mean_Corpuscular_Hemoglobin' in X.columns and 'Mean_Corpuscular_Volume' in X.columns:
            # MCH/MCV ratio on normalized values
            X['MCH_MCV_Ratio'] = X['Mean_Corpuscular_Hemoglobin'] / (X['Mean_Corpuscular_Volume'] + 1e-6)
        else:
            X['MCH_MCV_Ratio'] = 0.0
        
        # Step 4: Ensure all selected features exist (fill missing with 0)
        for feature in selected_features:
            if feature not in X.columns:
                X[feature] = 0.0
        
        # Step 5: Select features using feature selector
        X_selected = feature_selector.transform(X)
        
        # Step 6: Apply StandardScaler transformation
        X_scaled = scaler_improved.transform(X_selected)
        
        # Return as numpy array for model prediction
        return X_scaled[0]
        
    except FileNotFoundError as e:
        raise FileNotFoundError(f"Required model files not found: {e}")
    except Exception as e:
        # Fallback: try old min/max scaling if available
        if scaler_config and "min" in scaler_config and "max" in scaler_config:
            scaled = {}
            for key, value in raw_data.items():
                if key in scaler_config["min"] and key in scaler_config["max"]:
                    min_v = scaler_config["min"][key]
                    max_v = scaler_config["max"][key]
                    scaled[key] = normalize_to_0_1(value, min_v, max_v)
                else:
                    scaled[key] = value
            return np.array(list(scaled.values()))
        else:
            raise ValueError(f"Scaling failed: {e}")
