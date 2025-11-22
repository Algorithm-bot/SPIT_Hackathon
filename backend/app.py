from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scaling_bridge import get_model_input
from validator import validate_inputs
from explainability import get_feature_importance
from blockchain import add_block
import joblib
import json
import numpy as np
from datetime import datetime

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model + label encoder
model = joblib.load("model/medi_guard_merged_model.pkl")
label_encoder = joblib.load("model/label_encoder.pkl")

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
    print("\n" + "="*80)
    print(f"🩺 NEW PREDICTION REQUEST - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    raw_dict = data.dict()
    
    # Print received raw clinical values
    print("\n📥 RECEIVED RAW CLINICAL VALUES:")
    print("-" * 80)
    for key, value in raw_dict.items():
        print(f"  {key:40s}: {value:>10.2f}")
    
    errors = validate_inputs(raw_dict)

    if errors:
        print("\n❌ VALIDATION ERRORS:")
        for error in errors:
            print(f"  - {error}")
        print("="*80 + "\n")
        return {"status": "error", "errors": errors}

    try:
        print("\n🔄 NORMALIZING RAW VALUES TO MODEL INPUT FORMAT...")
        print("-" * 80)
        
        # Normalize raw clinical values to model input format (0-1 range)
        # get_model_input returns shape (1, 24) already
        scaled_2d = get_model_input(raw_dict, model_type="xgboost")
        
        print(f"✅ Normalization completed. Output shape: {scaled_2d.shape}")
        print(f"   Normalized value range: [{scaled_2d.min():.4f}, {scaled_2d.max():.4f}]")
        print(f"   First 5 normalized values: {scaled_2d[0][:5]}")
        print(f"   Total features: {scaled_2d.shape[1]} (expected: 24)")
        
        print("\n🤖 RUNNING ML MODEL PREDICTION...")
        print("-" * 80)
        
        # Make prediction
        prediction_encoded = model.predict(scaled_2d)[0]
        prediction_label = label_encoder.inverse_transform([prediction_encoded])[0]
        
        # Get prediction probabilities
        prediction_proba = model.predict_proba(scaled_2d)[0]
        probabilities = {
            label: float(prob) 
            for label, prob in zip(label_encoder.classes_, prediction_proba)
        }
        
        # Print prediction results
        print(f"🎯 PREDICTED DISEASE: {prediction_label}")
        print("\n📊 PREDICTION PROBABILITIES:")
        sorted_probs = sorted(probabilities.items(), key=lambda x: x[1], reverse=True)
        for disease, prob in sorted_probs:
            bar_length = int(prob * 50)
            bar = "█" * bar_length
            print(f"  {disease:30s}: {prob*100:>6.2f}% {bar}")
        
        # Get feature importance
        importance = get_feature_importance(model)
        if importance:
            print("\n🔍 TOP 5 MOST IMPORTANT FEATURES:")
            # Expected feature order from scaling_bridge
            feature_names = [
                "Glucose", "Cholesterol", "Hemoglobin", "Platelets", "White_Blood_Cells",
                "Red_Blood_Cells", "Hematocrit", "Mean_Corpuscular_Volume",
                "Mean_Corpuscular_Hemoglobin", "Mean_Corpuscular_Hemoglobin_Concentration",
                "Insulin", "BMI", "Systolic_Blood_Pressure", "Diastolic_Blood_Pressure",
                "Triglycerides", "HbA1c", "LDL_Cholesterol", "HDL_Cholesterol",
                "ALT", "AST", "Heart_Rate", "Creatinine", "Troponin", "C_reactive_Protein"
            ]
            if len(importance) == len(feature_names):
                feature_importance_pairs = list(zip(feature_names, importance))
                feature_importance_pairs.sort(key=lambda x: x[1], reverse=True)
                for i, (feature, imp) in enumerate(feature_importance_pairs[:5], 1):
                    print(f"  {i}. {feature:40s}: {imp:.4f}")

        # Blockchain logging
        blockchain_entry = add_block("patient_1234", prediction_label)
        print(f"\n🔗 BLOCKCHAIN ENTRY CREATED:")
        print(f"   Hash: {blockchain_entry.get('hash', 'N/A')[:16]}...")
        print(f"   Timestamp: {datetime.fromtimestamp(blockchain_entry.get('timestamp', 0)).strftime('%Y-%m-%d %H:%M:%S')}")

        print("\n" + "="*80)
        print("✅ PREDICTION COMPLETE - Response sent to frontend")
        print("="*80 + "\n")

        return {
            "status": "success",
            "prediction": prediction_label,
            "probabilities": probabilities,
            "feature_importance": importance,
            "blockchain_entry": blockchain_entry
        }
    except Exception as e:
        print(f"\n❌ PREDICTION ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        print("="*80 + "\n")
        return {
            "status": "error",
            "message": f"Prediction failed: {str(e)}"
        }
