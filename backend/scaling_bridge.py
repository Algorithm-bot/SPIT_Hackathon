import joblib
import json
import numpy as np
import pandas as pd

def scale_value(value, min_val, max_val):
    try:
        return (value - min_val) / (max_val - min_val)
    except ZeroDivisionError:
        return 0.0

def scale_input(raw_data, scaler):
    """
    Scale input data. Supports both old (min/max) and new (StandardScaler) formats.
    """
    # Try to load improved scaler first
    try:
        scaler_improved = joblib.load("model/scaler_improved.pkl")
        feature_selector = joblib.load("model/feature_selector.pkl")
        scaler_data = json.load(open("model/scaler_improved.json"))
        selected_features = scaler_data["selected_features"]
        
        # Create feature vector with engineering
        X = pd.DataFrame([raw_data])
        
        # Add engineered features
        if 'HDL_Cholesterol' in X.columns and 'LDL_Cholesterol' in X.columns:
            X['HDL_LDL_Ratio'] = X['HDL_Cholesterol'] / (X['LDL_Cholesterol'] + 1e-6)
        if 'Systolic_Blood_Pressure' in X.columns and 'Diastolic_Blood_Pressure' in X.columns:
            X['Pulse_Pressure'] = X['Systolic_Blood_Pressure'] - X['Diastolic_Blood_Pressure']
        if 'Mean_Corpuscular_Hemoglobin' in X.columns and 'Mean_Corpuscular_Volume' in X.columns:
            X['MCH_MCV_Ratio'] = X['Mean_Corpuscular_Hemoglobin'] / (X['Mean_Corpuscular_Volume'] + 1e-6)
        
        # Select features and scale
        X_selected = feature_selector.transform(X)
        X_scaled = scaler_improved.transform(X_selected)
        
        # Return as dict for backward compatibility
        scaled = {feat: val for feat, val in zip(selected_features, X_scaled[0])}
        return scaled
        
    except (FileNotFoundError, KeyError):
        # Fallback to old min/max scaling
        scaled = {}
        for key, value in raw_data.items():
            min_v = scaler["min"][key]
            max_v = scaler["max"][key]
            scaled[key] = scale_value(value, min_v, max_v)
        return scaled
