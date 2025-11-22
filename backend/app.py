from fastapi import FastAPI
from pydantic import BaseModel
from scaling_bridge import scale_input
from validator import validate_inputs
from explainability import get_feature_importance
from blockchain import add_block
import joblib
import json
import numpy as np

app = FastAPI()

# Load model + scaler config
model = joblib.load("model/medi_guard_merged_model.pkl")
label_encoder = joblib.load("model/label_encoder.pkl")
scaler_config = json.load(open("model/scaler_improved.json"))

class RawInput(BaseModel):
    Glucose: float
    Cholesterol: float
    Hemoglobin: float
    Platelets: float
    White_Blood_Cells: float
    Red_Blood_Cells: float
    Hematocrit: float
    Mean_Corpuscular_Volume: float
    Mean_Corpuscular_Hemoglobin: float
    Mean_Corpuscular_Hemoglobin_Concentration: float
    Insulin: float
    BMI: float
    Systolic_Blood_Pressure: float
    Diastolic_Blood_Pressure: float
    Triglycerides: float
    HbA1c: float
    LDL_Cholesterol: float
    HDL_Cholesterol: float
    ALT: float
    AST: float
    Heart_Rate: float
    Creatinine: float
    Troponin: float
    C_reactive_Protein: float

@app.post("/predict")
def predict(data: RawInput):
    """
    Predict disease from raw clinical values.
    Accepts raw clinical values (e.g., Glucose: 120 mg/dL) and returns prediction.
    """
    raw_dict = data.dict()
    errors = validate_inputs(raw_dict)

    if errors:
        return {"status": "error", "errors": errors}

    try:
        # Scale raw clinical values to model input format
        scaled_array = scale_input(raw_dict, scaler_config)
        
        # Reshape to 2D array (one sample)
        scaled_2d = scaled_array.reshape(1, -1)
        
        # Make prediction
        prediction_encoded = model.predict(scaled_2d)[0]
        prediction_label = label_encoder.inverse_transform([prediction_encoded])[0]
        
        # Get prediction probabilities
        prediction_proba = model.predict_proba(scaled_2d)[0]
        probabilities = {
            label: float(prob) 
            for label, prob in zip(label_encoder.classes_, prediction_proba)
        }
        
        # Get feature importance
        importance = get_feature_importance(model)

        # Blockchain logging
        blockchain_entry = add_block("patient_1234", prediction_label)

        return {
            "status": "success",
            "prediction": prediction_label,
            "probabilities": probabilities,
            "feature_importance": importance,
            "blockchain_entry": blockchain_entry
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Prediction failed: {str(e)}"
        }
