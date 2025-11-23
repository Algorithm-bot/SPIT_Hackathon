# Medi-Guard: Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Backend Components](#backend-components)
6. [Frontend Components](#frontend-components)
7. [Machine Learning Model](#machine-learning-model)
8. [Blockchain Implementation](#blockchain-implementation)
9. [API Documentation](#api-documentation)
10. [Data Flow](#data-flow)
11. [Installation & Setup](#installation--setup)
12. [Usage Guide](#usage-guide)
13. [Technical Details](#technical-details)
14. [Security & Privacy](#security--privacy)
15. [Future Enhancements](#future-enhancements)

---

## Project Overview

**Medi-Guard** is an AI-powered medical analysis system that predicts diseases from clinical laboratory values. The system combines machine learning, blockchain technology, and modern web development to provide accurate, secure, and auditable medical predictions.

### Key Features
- **AI-Powered Disease Prediction**: Uses XGBoost machine learning model to predict diseases from 24 clinical parameters
- **Blockchain-Based Audit Trail**: Immutable record of all predictions using blockchain technology
- **Triage Level Assignment**: Automatically categorizes predictions into Critical, High, Medium, or Low priority
- **Feature Importance Analysis**: Explains which clinical parameters most influenced the prediction
- **PDF Report Generation**: Comprehensive downloadable reports with all clinical data and predictions
- **Patient History Tracking**: Maintains complete history of all predictions per patient
- **Modern Web Interface**: Responsive React-based frontend with intuitive user experience

### Supported Diseases
The model can predict various diseases including:
- Heart Disease
- Diabetes
- Hypertension
- Anemia
- Thalassemia
- Chronic Kidney Disease
- Liver Disease
- Healthy/Normal status

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ HomePage │  │ReportForm│  │HistoryPage│  │  Header  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │              │             │         │
│       └─────────────┴──────────────┴─────────────┘         │
│                          │                                  │
│                          │ HTTP/REST API                    │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Backend (FastAPI + Python)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   app.py     │  │  validator   │  │scaling_bridge│    │
│  │  (API Core)  │  │   (Input     │  │ (Normalize   │    │
│  │              │  │  Validation) │  │   Values)    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │             │
│         └─────────────────┴─────────────────┘             │
│                          │                                  │
│         ┌────────────────┴────────────────┐                │
│         │                                  │                │
│  ┌──────▼──────┐                  ┌───────▼──────┐          │
│  │   XGBoost   │                  │  Blockchain  │          │
│  │    Model    │                  │   (chain.json│          │
│  │             │                  │    + logic)  │          │
│  └─────────────┘                  └──────────────┘          │
│         │                                  │                │
│         └────────────────┬─────────────────┘                │
│                          │                                  │
│                  ┌───────▼────────┐                         │
│                  │  PDF Generator │                         │
│                  │   (ReportLab)  │                         │
│                  └────────────────┘                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Python 3.x**: Programming language
- **XGBoost**: Gradient boosting machine learning library
- **scikit-learn**: Machine learning utilities (LabelEncoder, StandardScaler)
- **pandas & numpy**: Data manipulation and numerical computing
- **joblib**: Model serialization and loading
- **ReportLab**: PDF generation
- **uvicorn**: ASGI server for FastAPI

### Frontend
- **React 19.2.0**: UI library
- **Vite**: Build tool and development server
- **react-hot-toast**: Toast notifications
- **CSS3**: Styling with modern gradients and animations

### Data Storage
- **JSON Files**: Blockchain data (`chain.json`)
- **LocalStorage**: Frontend report history
- **Pickle Files**: Trained models and scalers

---

## Project Structure

```
SPIT_Hackathon/
│
├── backend/
│   ├── app.py                 # Main FastAPI application
│   ├── train.py               # Model training script
│   ├── scaling_bridge.py      # Data normalization module
│   ├── validator.py           # Input validation module
│   ├── blockchain.py          # Blockchain implementation
│   ├── explainability.py      # Feature importance extraction
│   ├── run_server.py          # Server startup script
│   ├── requirements.txt       # Python dependencies
│   ├── features.json          # Feature definitions
│   ├── chain.json             # Blockchain data file
│   │
│   ├── data/
│   │   ├── train.csv          # Training dataset
│   │   ├── test.csv           # Test dataset
│   │   └── new_train.csv      # Additional training data
│   │
│   └── model/
│       ├── best_model.pkl     # Trained XGBoost model
│       ├── label1_encoder.pkl # Label encoder for diseases
│       ├── standard_scaler.pkl # Standard scaler (for KNN)
│       └── [other model files]
│
└── frontend/
    └── med-analysis-frontend/
        ├── package.json       # Node.js dependencies
        ├── vite.config.js     # Vite configuration
        ├── index.html         # HTML entry point
        │
        └── src/
            ├── main.jsx       # React entry point
            ├── App.jsx        # Main app component
            ├── HomePage.jsx   # Landing page
            ├── ReportForm.jsx # Medical form component
            ├── HistoryPage.jsx # Report history viewer
            ├── Header.jsx     # Navigation header
            │
            └── components/
                ├── AuthModal.jsx
                ├── FeatureImportance.jsx
                ├── AboutAndFeatures.jsx
                ├── Footer.jsx
                └── [other components]
```

---

## Backend Components

### 1. `app.py` - Main FastAPI Application

**Purpose**: Core API server handling all HTTP requests and orchestrating the prediction pipeline.

**Key Functions**:
- **`POST /predict`**: Main prediction endpoint
  - Accepts 24 clinical parameters
  - Validates inputs
  - Normalizes data
  - Runs ML model prediction
  - Creates blockchain entry
  - Returns prediction with probabilities and feature importance

- **`GET /blockchain/verify`**: Verifies blockchain integrity
- **`GET /blockchain/stats`**: Returns blockchain statistics
- **`GET /blockchain/patient/{patient_id}`**: Retrieves patient history
- **`GET /blockchain/block/{block_hash}`**: Retrieves block by hash
- **`GET /blockchain/audit`**: Comprehensive blockchain audit
- **`POST /report/download-pdf`**: Generates and downloads PDF report

**Data Models**:
```python
class RawInput(BaseModel):
    Glucose: float
    Cholesterol: float
    Hemoglobin: float
    # ... 24 total clinical parameters
    patient_id: Optional[str]  # Auto-generated if not provided
```

**CORS Configuration**: Allows requests from frontend development servers (ports 5173, 5174, 3000)

---

### 2. `scaling_bridge.py` - Data Normalization Module

**Purpose**: Converts raw clinical values to normalized format required by the ML model.

**Key Functions**:
- **`get_model_input(raw_data, model_type="xgboost")`**: 
  - Converts raw clinical values (e.g., Glucose: 120 mg/dL) to 0-1 normalized range
  - Returns numpy array shaped (1, 24) for model input

**Clinical Ranges**:
The module uses predefined clinical ranges for normalization:
```python
CLINICAL_RANGES = {
    'Glucose': (70, 140),  # mg/dL
    'Cholesterol': (125, 200),  # mg/dL
    'Hemoglobin': (12, 18),  # g/dL
    # ... 24 total ranges
}
```

**Normalization Formula**:
```
normalized_value = (raw_value - min_range) / (max_range - min_range)
Clipped to [0.0, 1.0]
```

**Feature Order**: Maintains strict order of 24 features matching training data:
1. Glucose
2. Cholesterol
3. Hemoglobin
4. Platelets
5. White_Blood_Cells
6. Red_Blood_Cells
7. Hematocrit
8. Mean_Corpuscular_Volume
9. Mean_Corpuscular_Hemoglobin
10. Mean_Corpuscular_Hemoglobin_Concentration
11. Insulin
12. BMI
13. Systolic_Blood_Pressure
14. Diastolic_Blood_Pressure
15. Triglycerides
16. HbA1c
17. LDL_Cholesterol
18. HDL_Cholesterol
19. ALT
20. AST
21. Heart_Rate
22. Creatinine
23. Troponin
24. C_reactive_Protein

---

### 3. `validator.py` - Input Validation Module

**Purpose**: Validates all input clinical values before processing.

**Validation Rules**:
- All fields must be present (not None)
- All values must be numeric (int or float)
- All values must be non-negative

**Returns**: List of error messages (empty list if validation passes)

---

### 4. `blockchain.py` - Blockchain Implementation

**Purpose**: Provides immutable, auditable record of all predictions using blockchain technology.

**Key Concepts**:
- **Block Structure**: Each block contains:
  - `index`: Sequential block number
  - `patient_id`: Patient identifier
  - `prediction`: Disease prediction
  - `triage_level`: Priority level (Critical/High/Medium/Low)
  - `timestamp`: Unix timestamp
  - `previous_hash`: Hash of previous block (creates chain)
  - `hash`: SHA-256 hash of current block data
  - `nonce`: Currently unused (for future proof-of-work)

- **Genesis Block**: First block with index 0 and previous_hash of 64 zeros

**Key Functions**:
- **`add_block(patient_id, prediction, triage_level)`**: 
  - Creates new block
  - Links to previous block via previous_hash
  - Calculates SHA-256 hash
  - Saves to `chain.json`

- **`verify_chain()`**: 
  - Validates entire blockchain integrity
  - Checks hash links between blocks
  - Verifies block hashes haven't been tampered with
  - Returns (is_valid, errors)

- **`get_patient_history(patient_id)`**: Retrieves all blocks for a patient
- **`get_block_by_hash(block_hash)`**: Retrieves specific block
- **`get_chain_stats()`**: Returns statistics (total blocks, patients, triage distribution)
- **`determine_triage_level(prediction)`**: Maps disease to triage level

**Triage Level Mapping**:
```python
TRIAGE_LEVELS = {
    "Critical": ["Heart Disease", "Heart Di", "Diabetes", "Hypertension"],
    "High": ["Anemia", "Thalassemia", "Thalasse"],
    "Medium": ["Chronic Kidney Disease", "Liver Disease"],
    "Low": ["Healthy", "Normal"]
}
```

**Hash Calculation**: Uses SHA-256 on JSON-serialized block data (sorted keys for consistency)

**Data Persistence**: Blockchain stored in `chain.json` file (JSON format)

---

### 5. `explainability.py` - Feature Importance Module

**Purpose**: Extracts feature importance from trained model for explainability.

**Function**:
- **`get_feature_importance(model)`**: 
  - Extracts `feature_importances_` from XGBoost model
  - Returns list of 24 importance scores (one per feature)
  - Used to show which clinical parameters most influenced prediction

---

### 6. `train.py` - Model Training Script

**Purpose**: Trains the XGBoost model on training data.

**Process**:
1. **Load Data**: Combines `train.csv` and `test.csv`
2. **Prepare Features**: Separates features (X) and target (y = Disease)
3. **Encode Labels**: Uses LabelEncoder to convert disease names to numbers
4. **Train-Test Split**: 80% training, 20% testing (stratified)
5. **Train Model**: XGBoost with:
   - `n_estimators=2000`
   - `max_depth=7`
   - `learning_rate=0.05`
   - `early_stopping_rounds=50`
   - `eval_metric="mlogloss"`
6. **Evaluate**: Calculates accuracy and classification report
7. **Save**: Saves model and label encoder to `model/` directory

**Model Hyperparameters**:
- Early stopping prevents overfitting
- Stratified split maintains class distribution
- Evaluation on test set provides unbiased performance estimate

---

## Frontend Components

### 1. `App.jsx` - Main Application Component

**Purpose**: Root component managing application state and routing.

**State Management**:
- `currentPage`: Current view (home/form/history)
- `user`: Authenticated user (from localStorage)
- `showAuth`: Auth modal visibility
- `reports`: Array of all reports (from localStorage)

**Key Functions**:
- `handleReportSubmit()`: Adds new report to history
- `handleLogout()`: Clears user session
- `handleNavigate()`: Switches between pages

**Routing Logic**: Simple conditional rendering based on `currentPage` state

---

### 2. `HomePage.jsx` - Landing Page

**Purpose**: Welcome page with project introduction and call-to-action.

**Features**:
- Hero section with gradient text
- Doctor illustration (SVG component)
- "Start Analysis" button
- About and Features section
- Footer

---

### 3. `ReportForm.jsx` - Medical Data Entry Form

**Purpose**: Form for entering 24 clinical parameters and submitting for prediction.

**Key Features**:
- **24 Input Fields**: One for each clinical parameter
- **Real-time Validation**: 
  - Checks numeric format
  - Validates against realistic clinical ranges
  - Shows error messages per field
- **Field Mapping**: Converts frontend field names (e.g., "glucose") to backend format (e.g., "Glucose")
- **API Integration**: Calls `/predict` endpoint
- **Result Display**: Shows prediction, triage level, probabilities, feature importance
- **Feature Importance Visualization**: Uses `FeatureImportance` component

**Realistic Ranges**:
Each field has min/max validation based on clinical norms:
```javascript
REALISTIC_RANGES = {
  glucose: { min: 30, max: 800, unit: "mg/dL" },
  cholesterol: { min: 50, max: 800, unit: "mg/dL" },
  // ... 24 total ranges
}
```

**Form Submission Flow**:
1. Validate all fields
2. Map frontend format to backend format
3. POST to `http://localhost:8000/predict`
4. Display results with feature importance
5. Save to localStorage
6. Navigate to history page

---

### 4. `HistoryPage.jsx` - Report History Viewer

**Purpose**: Displays all submitted reports in a table with expandable details.

**Features**:
- **Table View**: Shows key information (ID, Date, Patient ID, Prediction, Triage)
- **Expandable Rows**: Click "Show Details" to see full report
- **Blockchain Display**: Shows blockchain entry details (hash, block index, timestamp)
- **PDF Download**: Button to download complete PDF report
- **Feature Importance**: Displays top features for each report

**Table Columns**:
- Report ID
- Date/Time
- Patient ID
- Predicted Disease
- Triage Level (color-coded)
- Key Clinical Values (Glucose, Cholesterol, Hemoglobin, BMI)
- Blockchain Status
- Actions (Show/Hide Details)

**Expanded View Shows**:
- Full patient information
- Complete prediction details
- All probabilities
- Blockchain record (hash, previous hash, block index)
- Feature importance chart
- PDF download button

---

### 5. `Header.jsx` - Navigation Header

**Purpose**: Top navigation bar with menu items and user authentication.

**Features**:
- Logo/Brand name
- Navigation links (Home, Submit Report, History)
- User profile dropdown (if logged in)
- Login/Logout functionality

---

### 6. `components/FeatureImportance.jsx` - Feature Visualization

**Purpose**: Visualizes which clinical parameters most influenced the prediction.

**Display**:
- Bar chart or list showing top N features
- Importance scores
- Patient's actual values for those features
- Color-coded by importance level

---

### 7. `components/AuthModal.jsx` - Authentication Modal

**Purpose**: Login/signup modal for user authentication.

**Note**: Currently uses localStorage for simple authentication (not production-ready)

---

## Machine Learning Model

### Model Type
**XGBoost Classifier** (Extreme Gradient Boosting)

### Training Data
- **Source**: `data/train.csv` + `data/test.csv` (combined)
- **Features**: 24 normalized clinical parameters (0-1 range)
- **Target**: Disease name (categorical)

### Model Architecture
```python
XGBClassifier(
    n_estimators=2000,        # Maximum trees
    max_depth=7,              # Tree depth
    learning_rate=0.05,     # Learning rate
    subsample=0.9,            # Row sampling
    colsample_bytree=0.9,     # Column sampling
    eval_metric="mlogloss",   # Multi-class log loss
    early_stopping_rounds=50  # Early stopping
)
```

### Training Process
1. **Data Loading**: Combines train and test CSV files
2. **Label Encoding**: Converts disease names to numeric labels
3. **Train-Test Split**: 80/20 stratified split
4. **Training**: Fits model with early stopping on validation set
5. **Evaluation**: Calculates accuracy and classification metrics
6. **Saving**: Serializes model and encoder using joblib

### Model Input Format
- **Shape**: (1, 24) numpy array
- **Type**: float32
- **Range**: 0.0 to 1.0 (normalized)
- **Feature Order**: Strict order matching training data

### Model Output
- **Prediction**: Disease name (via label encoder inverse transform)
- **Probabilities**: Dictionary mapping disease names to confidence scores (0-1)
- **Feature Importance**: Array of 24 importance scores

### Model Files
- `model/best_model.pkl`: Trained XGBoost model
- `model/label1_encoder.pkl`: LabelEncoder for disease names
- `model/standard_scaler.pkl`: StandardScaler (for KNN model, not used in XGBoost)

---

## Blockchain Implementation

### Purpose
Provides immutable, auditable record of all AI predictions for:
- **Medical Audit**: Non-repudiable record of predictions
- **Regulatory Compliance**: Tamper-proof history
- **Patient Tracking**: Complete history per patient
- **Data Integrity**: Cryptographic verification

### Block Structure
```json
{
  "index": 1,
  "patient_id": "PAT_ABC123DEF456",
  "prediction": "Diabetes",
  "triage_level": "Critical",
  "timestamp": 1703123456.789,
  "previous_hash": "abc123...",
  "hash": "def456...",
  "nonce": 0
}
```

### Hash Algorithm
- **Algorithm**: SHA-256
- **Input**: JSON-serialized block data (sorted keys)
- **Output**: 64-character hexadecimal hash

### Chain Linking
Each block's `previous_hash` links to the previous block's `hash`, creating an immutable chain. If any block is modified, its hash changes, breaking the chain.

### Verification Process
1. Check genesis block (index 0, previous_hash = 64 zeros)
2. For each subsequent block:
   - Verify index sequence
   - Verify previous_hash matches previous block's hash
   - Recalculate block hash and compare with stored hash
3. Return validation status and any errors

### Triage Level Assignment
Automatically assigns triage level based on predicted disease:
- **Critical**: Heart Disease, Diabetes, Hypertension
- **High**: Anemia, Thalassemia
- **Medium**: Chronic Kidney Disease, Liver Disease
- **Low**: Healthy, Normal

### Data Persistence
- **File**: `backend/chain.json`
- **Format**: JSON array of blocks
- **Backup**: Consider regular backups for production use

### Migration Support
Includes migration logic to upgrade old blockchain format to new format with proper linking.

---

## API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. POST `/predict`
**Purpose**: Predict disease from clinical values

**Request Body**:
```json
{
  "Glucose": 120.5,
  "Cholesterol": 200.0,
  "Hemoglobin": 14.2,
  "Platelets": 250000,
  "White_Blood_Cells": 7000,
  "Red_Blood_Cells": 4.5,
  "Hematocrit": 42.0,
  "Mean_Corpuscular_Volume": 90.0,
  "Mean_Corpuscular_Hemoglobin": 30.0,
  "Mean_Corpuscular_Hemoglobin_Concentration": 34.0,
  "Insulin": 10.0,
  "BMI": 25.0,
  "Systolic_Blood_Pressure": 120.0,
  "Diastolic_Blood_Pressure": 80.0,
  "Triglycerides": 150.0,
  "HbA1c": 5.5,
  "LDL_Cholesterol": 100.0,
  "HDL_Cholesterol": 60.0,
  "ALT": 25.0,
  "AST": 30.0,
  "Heart_Rate": 75.0,
  "Creatinine": 1.0,
  "Troponin": 0.01,
  "C_reactive_Protein": 2.0,
  "patient_id": "PAT_ABC123"  // Optional
}
```

**Response (Success)**:
```json
{
  "status": "success",
  "patient_id": "PAT_ABC123DEF456",
  "prediction": "Diabetes",
  "triage_level": "Critical",
  "probabilities": {
    "Diabetes": 0.85,
    "Heart Disease": 0.10,
    "Healthy": 0.05
  },
  "feature_importance": [0.05, 0.08, 0.12, ...],  // 24 values
  "blockchain_entry": {
    "block_index": 5,
    "hash": "abc123...",
    "previous_hash": "def456...",
    "timestamp": 1703123456.789,
    "triage_level": "Critical"
  }
}
```

**Response (Error)**:
```json
{
  "status": "error",
  "errors": ["Glucose is missing.", "Cholesterol must be a number."]
}
```

---

#### 2. GET `/blockchain/verify`
**Purpose**: Verify blockchain integrity

**Response**:
```json
{
  "status": "valid",
  "is_valid": true,
  "errors": [],
  "message": "Blockchain is valid and immutable"
}
```

---

#### 3. GET `/blockchain/stats`
**Purpose**: Get blockchain statistics

**Response**:
```json
{
  "status": "success",
  "stats": {
    "total_blocks": 100,
    "total_patients": 50,
    "chain_valid": true,
    "triage_distribution": {
      "Critical": 20,
      "High": 15,
      "Medium": 10,
      "Low": 5
    },
    "last_block_timestamp": 1703123456.789
  }
}
```

---

#### 4. GET `/blockchain/patient/{patient_id}`
**Purpose**: Get all blockchain entries for a patient

**Response**:
```json
{
  "status": "success",
  "patient_id": "PAT_ABC123",
  "total_entries": 3,
  "history": [
    {
      "index": 1,
      "patient_id": "PAT_ABC123",
      "prediction": "Diabetes",
      "triage_level": "Critical",
      "timestamp": 1703123456.789,
      "timestamp_readable": "2023-12-21 10:30:56",
      "hash": "abc123...",
      "previous_hash": "def456..."
    }
    // ... more entries
  ]
}
```

---

#### 5. GET `/blockchain/block/{block_hash}`
**Purpose**: Get specific block by hash

**Response**:
```json
{
  "status": "success",
  "block": {
    "index": 5,
    "patient_id": "PAT_ABC123",
    "prediction": "Diabetes",
    "triage_level": "Critical",
    "timestamp": 1703123456.789,
    "timestamp_readable": "2023-12-21 10:30:56",
    "hash": "abc123...",
    "previous_hash": "def456..."
  }
}
```

---

#### 6. GET `/blockchain/audit`
**Purpose**: Comprehensive blockchain audit

**Response**:
```json
{
  "status": "success",
  "chain_valid": true,
  "verification_errors": [],
  "statistics": { /* same as /blockchain/stats */ },
  "chain": [ /* full chain array */ ]
}
```

---

#### 7. POST `/report/download-pdf`
**Purpose**: Generate and download PDF report

**Request Body**:
```json
{
  "report": {
    "patient_id": "PAT_ABC123",
    "prediction": "Diabetes",
    "triage_level": "Critical",
    "probabilities": { /* ... */ },
    "feature_importance": [ /* ... */ ],
    "blockchain_entry": { /* ... */ },
    "Glucose": 120.5,
    // ... all clinical values
  }
}
```

**Response**: PDF file (binary)

---

## Data Flow

### Prediction Flow
```
1. User enters clinical values in frontend form
   ↓
2. Frontend validates inputs (numeric, ranges)
   ↓
3. Frontend maps field names to backend format
   ↓
4. POST request to /predict endpoint
   ↓
5. Backend validates inputs (validator.py)
   ↓
6. Backend normalizes values (scaling_bridge.py)
   - Raw values → 0-1 normalized range
   ↓
7. Backend loads XGBoost model
   ↓
8. Model predicts disease + probabilities
   ↓
9. Backend extracts feature importance
   ↓
10. Backend determines triage level
    ↓
11. Backend creates blockchain entry (blockchain.py)
    - Generates block with hash
    - Links to previous block
    - Saves to chain.json
    ↓
12. Backend returns response with:
    - Prediction
    - Probabilities
    - Feature importance
    - Blockchain entry
    ↓
13. Frontend displays results
    ↓
14. Frontend saves report to localStorage
    ↓
15. User can view history or download PDF
```

### Blockchain Flow
```
1. Prediction made → add_block() called
   ↓
2. Load existing chain from chain.json
   ↓
3. Get previous block's hash
   ↓
4. Create new block with:
   - Index (sequential)
   - Patient ID
   - Prediction
   - Triage level
   - Timestamp
   - Previous hash
   ↓
5. Calculate SHA-256 hash of block
   ↓
6. Append block to chain
   ↓
7. Save chain to chain.json
   ↓
8. Return block data to API
```

---

## Installation & Setup

### Prerequisites
- **Python 3.8+**
- **Node.js 16+** and npm
- **Git** (optional, for cloning)

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment** (recommended):
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Ensure model files exist**:
   - `model/best_model.pkl`
   - `model/label1_encoder.pkl`
   - If missing, run `python train.py` to train model

5. **Start server**:
```bash
python run_server.py
# Or
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend/med-analysis-frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173` (or similar port)

### Training the Model

If model files are missing:

1. **Ensure training data exists**:
   - `data/train.csv`
   - `data/test.csv`

2. **Run training script**:
```bash
cd backend
python train.py
```

3. **Model will be saved to**:
   - `model/best_model.pkl`
   - `model/label1_encoder.pkl`

---

## Usage Guide

### For End Users

1. **Access Application**: Open `http://localhost:5173` in browser
2. **Start Analysis**: Click "Start Analysis" button
3. **Enter Clinical Values**: Fill all 24 fields with patient test results
4. **Submit**: Click "Submit Report"
5. **View Results**: See prediction, triage level, probabilities, and feature importance
6. **View History**: Navigate to History page to see all past reports
7. **Download PDF**: Click "Download PDF Report" for complete documentation

### For Developers

#### Making Predictions via API

```python
import requests

url = "http://localhost:8000/predict"
data = {
    "Glucose": 120.5,
    "Cholesterol": 200.0,
    # ... all 24 parameters
}

response = requests.post(url, json=data)
result = response.json()
print(f"Prediction: {result['prediction']}")
print(f"Triage: {result['triage_level']}")
```

#### Verifying Blockchain

```python
import requests

response = requests.get("http://localhost:8000/blockchain/verify")
result = response.json()
print(f"Valid: {result['is_valid']}")
```

#### Getting Patient History

```python
import requests

patient_id = "PAT_ABC123"
response = requests.get(f"http://localhost:8000/blockchain/patient/{patient_id}")
history = response.json()['history']
print(f"Total entries: {len(history)}")
```

---

## Technical Details

### Data Normalization

**Why Normalize?**
- Training data was normalized to 0-1 range
- Model expects same format for predictions
- Ensures consistent feature scaling

**Normalization Formula**:
```python
normalized = (value - min_range) / (max_range - min_range)
# Clipped to [0.0, 1.0]
```

**Example**:
- Glucose: 105 mg/dL
- Range: (70, 140)
- Normalized: (105 - 70) / (140 - 70) = 35/70 = 0.5

### Model Performance

**Metrics** (from training):
- **Accuracy**: Reported during training (check train.py output)
- **Evaluation**: Uses stratified train-test split
- **Early Stopping**: Prevents overfitting

**To Check Model Performance**:
1. Run `python train.py`
2. Check console output for accuracy and classification report

### Feature Importance

**Calculation**:
- XGBoost provides `feature_importances_` attribute
- Scores represent relative importance (sum to 1.0)
- Higher score = more influence on prediction

**Usage**:
- Helps explain why model made specific prediction
- Shows which clinical parameters are most relevant
- Useful for medical professionals to understand model reasoning

### Blockchain Security

**Hash Function**: SHA-256
- One-way function (cannot reverse)
- Small input change → completely different hash
- Detects any tampering

**Chain Integrity**:
- Each block's hash depends on previous block
- Modifying any block breaks the chain
- Verification detects tampering immediately

**Limitations** (Current Implementation):
- Single-node blockchain (not distributed)
- No consensus mechanism
- File-based storage (not production-ready for high volume)
- For production, consider distributed blockchain or database with audit logs

### PDF Generation

**Library**: ReportLab

**Sections**:
1. Patient Information (ID, Date)
2. Prediction Results (Disease, Triage, Confidence)
3. Clinical Laboratory Values (all 24 parameters)
4. Probability Distribution (all diseases)
5. Feature Importance (top 10)
6. Blockchain Record (hash, block index, timestamp)

**Styling**:
- Professional medical report format
- Color-coded sections
- Tables for data presentation
- Immutability statement

---

## Security & Privacy

### Current Security Measures

1. **Input Validation**: All inputs validated before processing
2. **Blockchain Immutability**: Cryptographic hashing prevents tampering
3. **CORS Configuration**: Restricts frontend origins
4. **Error Handling**: Graceful error handling prevents information leakage

### Privacy Considerations

⚠️ **Important Notes**:
- **No Encryption**: Clinical data stored in plain text (localStorage, JSON files)
- **No Authentication**: Simple localStorage-based auth (not secure)
- **No HIPAA Compliance**: Not designed for production medical use
- **Local Storage**: All data stored locally (not transmitted to external servers)

### Recommendations for Production

1. **Encryption**: Encrypt sensitive data at rest and in transit
2. **Authentication**: Implement proper user authentication (JWT, OAuth)
3. **Database**: Use secure database instead of JSON files
4. **HTTPS**: Use HTTPS for all API communications
5. **HIPAA Compliance**: Implement HIPAA-compliant data handling
6. **Access Control**: Role-based access control (RBAC)
7. **Audit Logging**: Comprehensive audit logs
8. **Data Anonymization**: Anonymize patient data where possible
9. **Backup & Recovery**: Regular backups and disaster recovery plan
10. **Security Testing**: Regular security audits and penetration testing

---

## Future Enhancements

### Short-term
- [ ] User authentication system (JWT)
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Enhanced error handling
- [ ] Unit tests and integration tests
- [ ] API rate limiting
- [ ] Input sanitization improvements

### Medium-term
- [ ] Multi-model ensemble predictions
- [ ] Real-time model retraining pipeline
- [ ] Advanced feature importance visualization (SHAP)
- [ ] Patient dashboard with trends
- [ ] Email notifications for critical predictions
- [ ] Mobile app (React Native)

### Long-term
- [ ] Distributed blockchain network
- [ ] HIPAA compliance implementation
- [ ] Integration with Electronic Health Records (EHR)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Model versioning and A/B testing
- [ ] Cloud deployment (AWS/Azure/GCP)

---

## Troubleshooting

### Common Issues

**1. Model Not Found Error**
- **Solution**: Run `python train.py` to generate model files

**2. CORS Errors**
- **Solution**: Check `app.py` CORS configuration includes your frontend URL

**3. Port Already in Use**
- **Solution**: Change port in `run_server.py` or kill process using port

**4. Import Errors**
- **Solution**: Ensure all dependencies installed: `pip install -r requirements.txt`

**5. Blockchain Verification Fails**
- **Solution**: Check `chain.json` file integrity, may need to reset chain

**6. Frontend Can't Connect to Backend**
- **Solution**: Ensure backend server is running on port 8000

**7. PDF Generation Fails**
- **Solution**: Check ReportLab installation and file permissions

---

## Contributing

### Development Workflow

1. **Fork Repository**
2. **Create Feature Branch**: `git checkout -b feature/new-feature`
3. **Make Changes**: Follow code style and add comments
4. **Test Changes**: Ensure all functionality works
5. **Commit Changes**: `git commit -m "Add new feature"`
6. **Push to Branch**: `git push origin feature/new-feature`
7. **Create Pull Request**

### Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Follow ESLint configuration
- **Comments**: Document complex logic
- **Naming**: Use descriptive variable/function names

---

## License

[Specify your license here]

---

## Contact & Support

[Add contact information]

---

## Acknowledgments

- XGBoost team for the excellent ML library
- FastAPI for the modern Python web framework
- React team for the UI library
- All contributors and testers

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Maintainer**: [Your Name/Team]

