from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from scaling_bridge import get_model_input
from validator import validate_inputs
from explainability import get_feature_importance
from blockchain import (
    add_block, 
    verify_chain, 
    get_patient_history, 
    get_block_by_hash,
    get_chain_stats,
    determine_triage_level,
    get_chain
)
import joblib
import json
import numpy as np
import uuid
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.pdfgen import canvas
from io import BytesIO

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model + label encoder
model = joblib.load("model/best_model.pkl")
label_encoder = joblib.load("model/label1_encoder.pkl")

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
    patient_id: Optional[str] = Field(None, description="Optional patient identifier. If not provided, a unique ID will be generated.")

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
    
    # Extract patient_id if present (it's optional and not a clinical value)
    patient_id = raw_dict.pop("patient_id", None)
    
    # Print received raw clinical values
    print("\n📥 RECEIVED RAW CLINICAL VALUES:")
    print("-" * 80)
    for key, value in raw_dict.items():
        if value is not None:
            try:
                print(f"  {key:40s}: {value:>10.2f}")
            except (TypeError, ValueError):
                print(f"  {key:40s}: {value}")
        else:
            print(f"  {key:40s}: None")
    
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

        # Generate patient ID if not provided
        if not patient_id:
            patient_id = f"PAT_{uuid.uuid4().hex[:12].upper()}"
        
        # Determine triage level
        triage_level = determine_triage_level(prediction_label)
        
        # Blockchain logging - immutable record of AI prediction and triage
        blockchain_entry = add_block(patient_id, prediction_label, triage_level)
        
        print(f"\n🔗 BLOCKCHAIN ENTRY CREATED:")
        print(f"   Patient ID: {patient_id}")
        print(f"   Block Index: {blockchain_entry.get('index', 'N/A')}")
        print(f"   Hash: {blockchain_entry.get('hash', 'N/A')[:16]}...")
        print(f"   Previous Hash: {blockchain_entry.get('previous_hash', 'N/A')[:16]}...")
        print(f"   Triage Level: {triage_level}")
        print(f"   Timestamp: {datetime.fromtimestamp(blockchain_entry.get('timestamp', 0)).strftime('%Y-%m-%d %H:%M:%S')}")

        print("\n" + "="*80)
        print("✅ PREDICTION COMPLETE - Response sent to frontend")
        print("="*80 + "\n")

        return {
            "status": "success",
            "patient_id": patient_id,
            "prediction": prediction_label,
            "triage_level": triage_level,
            "probabilities": probabilities,
            "feature_importance": importance,
            "blockchain_entry": {
                "block_index": blockchain_entry.get("index"),
                "hash": blockchain_entry.get("hash"),
                "previous_hash": blockchain_entry.get("previous_hash"),
                "timestamp": blockchain_entry.get("timestamp"),
                "triage_level": blockchain_entry.get("triage_level")
            }
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

@app.get("/blockchain/verify")
def verify_blockchain():
    """
    Verify the integrity of the entire blockchain.
    Returns validation status and any errors found.
    """
    is_valid, errors = verify_chain()
    return {
        "status": "valid" if is_valid else "invalid",
        "is_valid": is_valid,
        "errors": errors,
        "message": "Blockchain is valid and immutable" if is_valid else "Blockchain integrity check failed"
    }

@app.get("/blockchain/stats")
def get_blockchain_stats():
    """
    Get statistics about the blockchain.
    Returns total blocks, patients, triage distribution, etc.
    """
    stats = get_chain_stats()
    return {
        "status": "success",
        "stats": stats
    }

@app.get("/blockchain/patient/{patient_id}")
def get_patient_blockchain_history(patient_id: str):
    """
    Retrieve all blockchain entries for a specific patient.
    Creates an auditable trail of all AI predictions for that patient.
    """
    history = get_patient_history(patient_id)
    if not history:
        raise HTTPException(status_code=404, detail=f"No blockchain entries found for patient {patient_id}")
    
    # Format timestamps for readability
    formatted_history = []
    for block in history:
        formatted_block = block.copy()
        formatted_block["timestamp_readable"] = datetime.fromtimestamp(block["timestamp"]).strftime('%Y-%m-%d %H:%M:%S')
        formatted_history.append(formatted_block)
    
    return {
        "status": "success",
        "patient_id": patient_id,
        "total_entries": len(history),
        "history": formatted_history
    }

@app.get("/blockchain/block/{block_hash}")
def get_block_by_hash_endpoint(block_hash: str):
    """
    Retrieve a specific block by its hash.
    Useful for verifying individual records.
    """
    block = get_block_by_hash(block_hash)
    if not block:
        raise HTTPException(status_code=404, detail=f"Block with hash {block_hash[:16]}... not found")
    
    formatted_block = block.copy()
    formatted_block["timestamp_readable"] = datetime.fromtimestamp(block["timestamp"]).strftime('%Y-%m-%d %H:%M:%S')
    
    return {
        "status": "success",
        "block": formatted_block
    }

@app.get("/blockchain/audit")
def audit_blockchain():
    """
    Comprehensive audit of the blockchain.
    Returns full chain with verification status.
    """
    chain = get_chain()
    is_valid, errors = verify_chain()
    stats = get_chain_stats()
    
    # Format chain for readability
    formatted_chain = []
    for block in chain:
        formatted_block = block.copy()
        formatted_block["timestamp_readable"] = datetime.fromtimestamp(block["timestamp"]).strftime('%Y-%m-%d %H:%M:%S')
        formatted_chain.append(formatted_block)
    
    return {
        "status": "success",
        "chain_valid": is_valid,
        "verification_errors": errors,
        "statistics": stats,
        "chain": formatted_chain
    }

class ReportData(BaseModel):
    report: Dict[str, Any]

@app.post("/report/download-pdf")
def download_report_pdf(data: ReportData):
    """
    Generate and download a PDF report with all patient data, prediction, and blockchain information.
    """
    try:
        report = data.report
        
        # Create a BytesIO buffer to hold the PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=30,
            alignment=1,  # Center alignment
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#764ba2'),
            spaceAfter=12,
            spaceBefore=12,
        )
        normal_style = styles['Normal']
        
        # Title
        elements.append(Paragraph("Medical Analysis Report", title_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Patient Information Section
        elements.append(Paragraph("Patient Information", heading_style))
        
        # Format timestamp
        timestamp = report.get("timestamp")
        if timestamp:
            if isinstance(timestamp, (int, float)):
                # If timestamp is in milliseconds, convert to seconds
                if timestamp > 1e10:
                    timestamp = timestamp / 1000
                date_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
            else:
                date_str = str(timestamp)
        else:
            date_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        patient_info_data = [
            ["Patient ID:", report.get("patient_id", "N/A")],
            ["Report ID:", str(report.get("id", "N/A"))],
            ["Date:", date_str],
        ]
        
        patient_table = Table(patient_info_data, colWidths=[2*inch, 4*inch])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(patient_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Prediction Results Section
        elements.append(Paragraph("Prediction Results", heading_style))
        
        prediction = report.get("prediction", "N/A")
        triage_level = report.get("triage_level", "N/A")
        confidence = report.get("probabilities", {}).get(prediction, 0) * 100 if report.get("probabilities") and prediction != "N/A" else 0
        
        prediction_data = [
            ["Predicted Disease:", prediction],
            ["Triage Level:", triage_level],
            ["Confidence:", f"{confidence:.2f}%"],
        ]
        
        prediction_table = Table(prediction_data, colWidths=[2*inch, 4*inch])
        prediction_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(prediction_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Clinical Values Section
        elements.append(Paragraph("Clinical Laboratory Values", heading_style))
        
        # Define all clinical parameters
        clinical_params = [
            "Glucose", "Cholesterol", "Hemoglobin", "Platelets", "White_Blood_Cells",
            "Red_Blood_Cells", "Hematocrit", "Mean_Corpuscular_Volume",
            "Mean_Corpuscular_Hemoglobin", "Mean_Corpuscular_Hemoglobin_Concentration",
            "Insulin", "BMI", "Systolic_Blood_Pressure", "Diastolic_Blood_Pressure",
            "Triglycerides", "HbA1c", "LDL_Cholesterol", "HDL_Cholesterol",
            "ALT", "AST", "Heart_Rate", "Creatinine", "Troponin", "C_reactive_Protein"
        ]
        
        # Prepare data for clinical values table
        clinical_data = [["Parameter", "Value"]]
        for param in clinical_params:
            # Try different key formats
            value = None
            for key_format in [param, param.lower(), param.replace("_", " ").lower()]:
                if key_format in report:
                    value = report[key_format]
                    break
            
            if value is not None:
                if isinstance(value, (int, float)):
                    clinical_data.append([param, f"{value:.2f}"])
                else:
                    clinical_data.append([param, str(value)])
            else:
                clinical_data.append([param, "N/A"])
        
        clinical_table = Table(clinical_data, colWidths=[3.5*inch, 2.5*inch])
        clinical_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
        ]))
        elements.append(clinical_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Probability Distribution Section
        if report.get("probabilities"):
            elements.append(Paragraph("Probability Distribution", heading_style))
            prob_data = [["Disease", "Probability (%)"]]
            sorted_probs = sorted(report["probabilities"].items(), key=lambda x: x[1], reverse=True)
            for disease, prob in sorted_probs:
                prob_data.append([disease, f"{prob * 100:.2f}%"])
            
            prob_table = Table(prob_data, colWidths=[3.5*inch, 2.5*inch])
            prob_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#764ba2')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
            ]))
            elements.append(prob_table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Feature Importance Section
        if report.get("feature_importance"):
            elements.append(Paragraph("Top Feature Importance", heading_style))
            feature_names = [
                "Glucose", "Cholesterol", "Hemoglobin", "Platelets", "White_Blood_Cells",
                "Red_Blood_Cells", "Hematocrit", "Mean_Corpuscular_Volume",
                "Mean_Corpuscular_Hemoglobin", "Mean_Corpuscular_Hemoglobin_Concentration",
                "Insulin", "BMI", "Systolic_Blood_Pressure", "Diastolic_Blood_Pressure",
                "Triglycerides", "HbA1c", "LDL_Cholesterol", "HDL_Cholesterol",
                "ALT", "AST", "Heart_Rate", "Creatinine", "Troponin", "C_reactive_Protein"
            ]
            
            importance = report["feature_importance"]
            if len(importance) == len(feature_names):
                feature_importance_pairs = list(zip(feature_names, importance))
                feature_importance_pairs.sort(key=lambda x: x[1], reverse=True)
                
                importance_data = [["Feature", "Importance Score"]]
                for feature, imp in feature_importance_pairs[:10]:  # Top 10
                    importance_data.append([feature, f"{imp:.4f}"])
                
                importance_table = Table(importance_data, colWidths=[3.5*inch, 2.5*inch])
                importance_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
                ]))
                elements.append(importance_table)
                elements.append(Spacer(1, 0.3*inch))
        
        # Blockchain Information Section
        if report.get("blockchain_entry"):
            elements.append(Paragraph("Blockchain Record", heading_style))
            
            blockchain = report["blockchain_entry"]
            timestamp_str = datetime.fromtimestamp(blockchain.get("timestamp", 0)).strftime('%Y-%m-%d %H:%M:%S') if blockchain.get("timestamp") else "N/A"
            
            blockchain_data = [
                ["Block Index:", str(blockchain.get("block_index", "N/A"))],
                ["Block Hash:", blockchain.get("hash", "N/A")],
                ["Previous Hash:", blockchain.get("previous_hash", "Genesis Block")],
                ["Timestamp:", timestamp_str],
                ["Triage Level:", blockchain.get("triage_level", "N/A")],
            ]
            
            blockchain_table = Table(blockchain_data, colWidths=[2*inch, 4*inch])
            blockchain_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#0047AB')),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
                ('TEXTCOLOR', (1, 0), (1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Courier'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            elements.append(blockchain_table)
            elements.append(Spacer(1, 0.2*inch))
            elements.append(Paragraph(
                "This prediction has been permanently recorded on the blockchain. "
                "The cryptographic hash ensures that this record cannot be altered without detection, "
                "providing a non-repudiable audit trail for medical decision-making.",
                normal_style
            ))
        
        # Build PDF
        doc.build(elements)
        
        # Get the value of the BytesIO buffer
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        # Generate filename
        patient_id = report.get("patient_id", "UNKNOWN")
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"Medical_Report_{patient_id}_{timestamp}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
