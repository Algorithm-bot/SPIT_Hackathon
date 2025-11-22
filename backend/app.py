from fastapi import FastAPI
from pydantic import BaseModel
from scaling_bridge import scale_input
from validator import validate_inputs
from explainability import get_feature_importance
from blockchain import add_block
import joblib
import json

app = FastAPI()

# Load model + scaler
model = joblib.load("model/medi_guard_merged_model.pkl")
scaler = json.load(open("model/scaler_improved.json"))

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

    raw_dict = data.dict()
    errors = validate_inputs(raw_dict)

    if errors:
        return {"status": "error", "errors": errors}

    scaled = scale_input(raw_dict, scaler)
    prediction = model.predict([list(scaled.values())])[0]

    importance = get_feature_importance(model)

    # Blockchain logging
    blockchain_entry = add_block("patient_1234", prediction)

    return {
        "prediction": prediction,
        "feature_importance": importance,
        "blockchain_entry": blockchain_entry
    }
