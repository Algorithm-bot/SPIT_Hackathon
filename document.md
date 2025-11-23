# Medi-Guard: Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Backend Components](#backend-components)
4. [Frontend Components](#frontend-components)
5. [Machine Learning Model](#machine-learning-model)
6. [Data Validation System](#data-validation-system)
7. [Blockchain Implementation](#blockchain-implementation)
8. [Feature Explainability](#feature-explainability)
9. [Data Flow and Processing](#data-flow-and-processing)
10. [Authentication System](#authentication-system)
11. [API Endpoints](#api-endpoints)
12. [Setup and Installation](#setup-and-installation)
13. [Usage Guide](#usage-guide)

---

## Project Overview

**Medi-Guard** is an AI-powered medical analysis system that predicts diseases from clinical test data. The system combines machine learning, blockchain technology, and modern web development to provide accurate, explainable, and auditable medical predictions.

### Key Features
- **AI-Powered Disease Prediction**: Uses XGBoost machine learning model to predict diseases from 24 clinical parameters
- **Blockchain-Based Audit Trail**: Immutable records of all predictions for compliance and audit purposes
- **Feature Explainability**: Shows which clinical markers drive each prediction
- **Triage Level Assignment**: Automatically categorizes predictions by severity (Critical, High, Medium, Low)
- **User Authentication**: Secure login/signup system with password hashing
- **Report History**: Local storage of prediction history with blockchain verification
- **Real-time Validation**: Comprehensive input validation for clinical parameters

### Technologies Used
- **Backend**: Python, FastAPI, XGBoost, scikit-learn
- **Frontend**: React, Vite, React Hot Toast
- **Blockchain**: Custom implementation using SHA-256 hashing
- **Storage**: JSON-based blockchain, LocalStorage for frontend

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ HomePage │  │ReportForm│  │HistoryPage│  │AuthModal  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│       └────────────┴──────────────┴─────────────┘          │
│                          │                                  │
│                    HTTP/REST API                            │
└──────────────────────────┼──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   app.py     │  │ validator.py │  │scaling_bridge│       │
│  │  (API Layer) │  │              │  │              │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                          │                                    │
│         ┌────────────────┴────────────────┐                  │
│         │                                 │                  │
│         ▼                                 ▼                  │
│  ┌──────────────┐              ┌──────────────┐             │
│  │  XGBoost     │              │  blockchain  │             │
│  │   Model      │              │     .py      │             │
│  └──────────────┘              └──────────────┘             │
│         │                                 │                  │
│         └─────────────────┬───────────────┘                 │
│                          │                                   │
│         ┌────────────────┴────────────────┐                │
│         │                                 │                  │
│         ▼                                 ▼                  │
│  ┌──────────────┐              ┌──────────────┐             │
│  │  Model Files │              │  chain.json  │             │
│  │  (.pkl)      │              │  (Blockchain)│             │
│  └──────────────┘              └──────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **User Input**: User enters clinical values in the frontend form
2. **Validation**: Frontend validates inputs against realistic ranges
3. **API Request**: Validated data sent to backend `/predict` endpoint
4. **Backend Validation**: Additional server-side validation
5. **Data Normalization**: Raw clinical values normalized to 0-1 range
6. **Model Prediction**: XGBoost model generates prediction and probabilities
7. **Feature Importance**: Model provides feature importance scores
8. **Triage Assignment**: System determines triage level based on prediction
9. **Blockchain Logging**: Prediction recorded immutably on blockchain
10. **Response**: Results sent back to frontend with all metadata
11. **Storage**: Results stored in LocalStorage and displayed to user

---

## Backend Components

### 1. Main API Server (`app.py`)

The FastAPI application serves as the central API server handling all prediction requests.

#### Key Features:
- **CORS Middleware**: Allows frontend to communicate with backend
- **Model Loading**: Loads pre-trained XGBoost model and label encoder at startup
- **Request Validation**: Uses Pydantic models for type-safe input validation
- **Comprehensive Logging**: Detailed console logging for debugging and monitoring

#### Request Model (`RawInput`):
```python
class RawInput(BaseModel):
    Glucose: float
    Cholesterol: float
    Hemoglobin: float
    # ... 24 total clinical parameters
    patient_id: Optional[str]  # Auto-generated if not provided
```

#### Prediction Endpoint (`/predict`):
1. **Receives** raw clinical values (e.g., Glucose: 120 mg/dL)
2. **Validates** inputs using `validator.py`
3. **Normalizes** values using `scaling_bridge.py`
4. **Predicts** disease using XGBoost model
5. **Calculates** probabilities for all disease classes
6. **Extracts** feature importance
7. **Determines** triage level
8. **Logs** to blockchain
9. **Returns** comprehensive prediction result

#### Response Structure:
```json
{
  "status": "success",
  "patient_id": "PAT_ABC123",
  "prediction": "Diabetes",
  "triage_level": "Critical",
  "probabilities": {
    "Diabetes": 0.85,
    "Healthy": 0.10,
    ...
  },
  "feature_importance": [0.15, 0.12, ...],
  "blockchain_entry": {
    "block_index": 5,
    "hash": "abc123...",
    "previous_hash": "def456...",
    "timestamp": 1234567890.123,
    "triage_level": "Critical"
  }
}
```

### 2. Input Validator (`validator.py`)

Validates all incoming clinical parameters before processing.

#### Validation Rules:
1. **Presence Check**: All 24 parameters must be provided
2. **Type Check**: All values must be numeric (int or float)
3. **Range Check**: All values must be non-negative

#### Implementation:
```python
def validate_inputs(raw):
    errors = []
    for key, value in raw.items():
        if value is None:
            errors.append(f"{key} is missing.")
        if not isinstance(value, (int, float)):
            errors.append(f"{key} must be a number.")
        if value < 0:
            errors.append(f"{key} cannot be negative.")
    return errors
```

**Note**: Additional realistic range validation is performed in the frontend before submission.

### 3. Data Scaling Bridge (`scaling_bridge.py`)

Converts raw clinical values to the normalized format expected by the ML model.

#### Clinical Ranges:
Each parameter has defined min/max ranges based on realistic clinical values:

```python
CLINICAL_RANGES = {
    "Glucose": (50, 250),           # mg/dL
    "Cholesterol": (100, 350),      # mg/dL
    "Hemoglobin": (5, 18),          # g/dL
    "Platelets": (50000, 450000),   # cells/µL
    # ... 24 total ranges
}
```

#### Normalization Formula:
```python
normalized_value = (raw_value - min_value) / (max_value - min_value)
# Clipped to [0, 1] range
```

#### Process:
1. **Input**: Raw clinical values (e.g., Glucose: 120 mg/dL)
2. **Normalization**: Each value normalized to 0-1 range using clinical limits
3. **Feature Ordering**: Values arranged in exact order expected by model
4. **Output**: NumPy array of shape (1, 24) ready for model prediction

#### Example:
- Raw Glucose: 120 mg/dL
- Range: (50, 250)
- Normalized: (120 - 50) / (250 - 50) = 70 / 200 = 0.35

### 4. Feature Explainability (`explainability.py`)

Extracts feature importance from the trained model to explain predictions.

#### Implementation:
```python
def get_feature_importance(model):
    try:
        importance = model.feature_importances_
        return importance.tolist()
    except:
        return []
```

#### Usage:
- Returns array of 24 importance scores (one per feature)
- Higher values indicate stronger influence on prediction
- Used in frontend to show which markers drove the prediction

### 5. Blockchain Module (`blockchain.py`)

Implements an immutable blockchain for recording all predictions.

#### Block Structure:
```python
{
    "index": 5,                    # Sequential block number
    "patient_id": "PAT_ABC123",    # Patient identifier
    "prediction": "Diabetes",       # AI prediction
    "triage_level": "Critical",    # Severity level
    "timestamp": 1234567890.123,   # Unix timestamp
    "previous_hash": "def456...",  # Hash of previous block
    "hash": "abc123...",           # SHA-256 hash of this block
    "nonce": 0                     # For future proof-of-work
}
```

#### Key Functions:

**`add_block(patient_id, prediction, triage_level)`**:
- Creates new block with all prediction data
- Calculates SHA-256 hash
- Links to previous block via `previous_hash`
- Saves to `chain.json`

**`verify_chain()`**:
- Validates entire blockchain integrity
- Checks hash consistency
- Verifies chain links
- Returns (is_valid, errors)

**`get_patient_history(patient_id)`**:
- Retrieves all blocks for a specific patient
- Creates complete audit trail

**`determine_triage_level(prediction)`**:
- Maps disease predictions to triage levels:
  - **Critical**: Heart Disease, Diabetes, Hypertension
  - **High**: Anemia, Thalassemia
  - **Medium**: Chronic Kidney Disease, Liver Disease
  - **Low**: Healthy, Normal

#### Hash Calculation:
```python
def calculate_hash(block_data):
    block_string = json.dumps(block_data, sort_keys=True)
    return hashlib.sha256(block_string.encode()).hexdigest()
```

#### Immutability:
- Each block's hash includes the previous block's hash
- Any modification breaks the chain link
- Tampering is immediately detectable

---

## Frontend Components

### 1. Main App (`App.jsx`)

Central React component managing application state and routing.

#### State Management:
- `currentPage`: Controls which page is displayed (home, form, history)
- `user`: Current logged-in user (from LocalStorage)
- `showAuth`: Controls authentication modal visibility
- `authType`: Toggles between login and signup
- `reports`: Array of all submitted reports

#### Navigation:
- **Home**: Landing page with features
- **Form**: Report submission form (requires authentication)
- **History**: View past predictions (requires authentication)

### 2. Home Page (`HomePage.jsx`)

Landing page with project introduction and call-to-action.

#### Features:
- Hero section with gradient design
- Doctor SVG illustration
- "Start Analysis" button
- About and Features section
- Footer with project information

### 3. Report Form (`ReportForm.jsx`)

Main form for entering clinical test data.

#### Features:
- **24 Input Fields**: All clinical parameters with labels and units
- **Real-time Validation**: 
  - Numeric validation on input
  - Range checking against realistic clinical limits
  - Error messages for invalid inputs
- **Field Mapping**: Converts frontend field names to backend format
- **API Integration**: Sends data to `/predict` endpoint
- **Result Display**: Shows prediction, probabilities, feature importance
- **Local Storage**: Saves reports for history

#### Validation Ranges:
```javascript
const REALISTIC_RANGES = {
  glucose: { min: 30, max: 800, unit: "mg/dL" },
  cholesterol: { min: 50, max: 800, unit: "mg/dL" },
  // ... 24 total ranges
};
```

#### Field Mapping:
Frontend uses user-friendly names (e.g., "white blood cells"), backend expects underscores (e.g., "White_Blood_Cells"). The `mapToBackendFormat()` function handles this conversion.

### 4. History Page (`HistoryPage.jsx`)

Displays all submitted reports in a table format.

#### Features:
- **Table View**: Key parameters displayed in columns
- **Expandable Rows**: Click to see full report details
- **Blockchain Display**: Shows blockchain entry information
- **Feature Importance**: Displays explainability data
- **Triage Visualization**: Color-coded triage levels

#### Displayed Information:
- Report ID and timestamp
- Patient ID
- Predicted disease
- Triage level (color-coded)
- Key clinical values (Glucose, Cholesterol, Hemoglobin, BMI)
- Blockchain hash and block index
- Full feature importance analysis

### 5. Authentication Modal (`AuthModal.jsx`)

Handles user login and signup.

#### Features:
- **Password Hashing**: Uses Web Crypto API (SHA-256)
- **Password Validation**: 
  - Minimum 8 characters
  - At least one special character
  - At least one uppercase letter
- **Password Visibility Toggle**: Eye icon to show/hide password
- **Local Storage**: Stores user credentials securely
- **Legacy Support**: Migrates plain-text passwords to hashed format

#### Security:
- Passwords are hashed before storage
- Uses SHA-256 cryptographic hashing
- No plain-text passwords stored
- Email-based authentication

### 6. Feature Importance Component (`FeatureImportance.jsx`)

Visualizes which clinical markers influenced the prediction.

#### Features:
- **Top N Features**: Displays most important features (default: 5)
- **Bar Charts**: Visual representation of importance scores
- **Risk Indicators**: 
  - High-risk markers (elevated values indicate risk)
  - Low-risk markers (low values indicate risk)
- **Patient Values**: Shows actual patient values for each feature
- **Clinical Interpretation**: Explains what abnormal values mean

#### Risk Markers:
```javascript
HIGH_RISK_MARKERS = {
  "Glucose": "High glucose levels indicate diabetes risk",
  "Troponin": "High troponin suggests heart muscle damage",
  // ...
};

LOW_RISK_MARKERS = {
  "Hemoglobin": "Low hemoglobin indicates anemia",
  "Platelets": "Low platelet count increases bleeding risk",
  // ...
};
```

#### Reference Ranges:
Uses clinical reference ranges to determine if values are abnormal:
- Normal ranges for each parameter
- High thresholds for risk markers
- Low thresholds for deficiency markers

---

## Machine Learning Model

### Model Architecture

**Algorithm**: XGBoost (Extreme Gradient Boosting)
**Type**: Multi-class Classification
**Input Features**: 24 normalized clinical parameters (0-1 range)
**Output**: Disease prediction (one of multiple disease classes)

### Training Process

#### Training Scripts:

1. **`train.py`**: Basic training with early stopping
2. **`train_improved.py`**: Advanced training with SMOTE and improved parameters
3. **`train_alternative.py`**: Training with class weights instead of SMOTE

#### Training Pipeline (train_improved.py):

**Step 1: Data Loading**
```python
train = pd.read_csv("data/train.csv")
test = pd.read_csv("data/test.csv")
df = pd.concat([train, test], ignore_index=True)
df = df.drop_duplicates()
```

**Step 2: Feature Preparation**
```python
X = df.drop("Disease", axis=1)  # 24 features
y = df["Disease"]               # Target variable

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
```

**Step 3: Train-Test Split**
```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, 
    test_size=0.2, 
    random_state=42, 
    stratify=y_encoded  # Maintains class distribution
)
```

**Step 4: Class Balancing (SMOTE)**
```python
from imblearn.over_sampling import SMOTE

smote = SMOTE(random_state=42, k_neighbors=3)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
```

**Why SMOTE?**
- Handles class imbalance in medical datasets
- Synthetic Minority Oversampling Technique
- Creates synthetic samples for minority classes
- Prevents model bias toward majority classes

**Step 5: Model Training**
```python
model = XGBClassifier(
    n_estimators=2000,        # Maximum trees
    max_depth=6,              # Tree depth (prevents overfitting)
    learning_rate=0.03,        # Step size shrinkage
    subsample=0.85,           # Row sampling ratio
    colsample_bytree=0.85,    # Column sampling ratio
    min_child_weight=3,       # Minimum sum of instance weight
    gamma=0.1,                # Minimum loss reduction
    reg_alpha=0.1,            # L1 regularization
    reg_lambda=1.5,           # L2 regularization
    eval_metric="mlogloss",   # Multi-class log loss
    random_state=42,
    early_stopping_rounds=100 # Stop if no improvement
)

model.fit(
    X_train_balanced, y_train_balanced,
    eval_set=[(X_test, y_test)],
    verbose=100
)
```

**Hyperparameter Explanation**:
- **n_estimators**: Number of boosting rounds (trees)
- **max_depth**: Maximum depth of trees (lower = less overfitting)
- **learning_rate**: How much each tree contributes (lower = more trees needed)
- **subsample**: Fraction of samples used per tree (prevents overfitting)
- **colsample_bytree**: Fraction of features used per tree
- **min_child_weight**: Minimum samples required in a leaf
- **gamma**: Minimum loss reduction to split a node
- **reg_alpha/reg_lambda**: Regularization to prevent overfitting
- **early_stopping_rounds**: Stops training if validation doesn't improve

**Step 6: Evaluation**
```python
pred = model.predict(X_test)
acc = accuracy_score(y_test, pred)
f1_macro = f1_score(y_test, pred, average='macro')
f1_weighted = f1_score(y_test, pred, average='weighted')

print(classification_report(y_test, pred, target_names=label_encoder.classes_))
print(confusion_matrix(y_test, pred))
```

**Step 7: Cross-Validation**
```python
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = []
for train_idx, val_idx in cv.split(X_train_balanced, y_train_balanced):
    # Train model on fold
    # Evaluate on validation set
    cv_scores.append(score)
```

**Step 8: Model Saving**
```python
joblib.dump(model, "model/medi_guard_merged_model.pkl")
joblib.dump(label_encoder, "model/label_encoder.pkl")
```

### Model Files

- **`medi_guard_merged_model.pkl`**: Trained XGBoost model
- **`label_encoder.pkl`**: Encodes/decodes disease names to/from integers
- **`standard_scaler.pkl`**: Optional scaler for KNN models (not used in production)

### Prediction Process

1. **Input Normalization**: Raw values → 0-1 range
2. **Feature Ordering**: Values arranged in model's expected order
3. **Model Prediction**: `model.predict()` returns encoded class
4. **Label Decoding**: `label_encoder.inverse_transform()` converts to disease name
5. **Probability Calculation**: `model.predict_proba()` returns probabilities for all classes
6. **Feature Importance**: `model.feature_importances_` returns importance scores

---

## Data Validation System

### Multi-Layer Validation

#### Layer 1: Frontend Validation (ReportForm.jsx)

**Real-time Input Validation**:
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  // Check if numeric
  if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
    setErrors((prev) => ({ ...prev, [name]: "Must be a numeric value." }));
  }
};
```

**Form Submission Validation**:
```javascript
const validate = () => {
  for (const key of fieldNames) {
    const value = formData[key].trim();
    const numValue = parseFloat(value);
    const range = REALISTIC_RANGES[key];
    
    // 1. Check if empty or not numeric
    if (value === "" || !/^\d*\.?\d+$/.test(value)) {
      newErrors[key] = "Required and must be numeric.";
    }
    // 2. Check if within realistic range
    else if (range && (numValue < range.min || numValue > range.max)) {
      newErrors[key] = `Value outside range (${range.min} - ${range.max} ${range.unit}).`;
    }
  }
};
```

**Validation Rules**:
- All 24 fields are mandatory
- All values must be numeric (integers or decimals)
- All values must be within realistic clinical ranges
- Negative values are rejected

#### Layer 2: Backend Validation (validator.py)

**Server-Side Validation**:
```python
def validate_inputs(raw):
    errors = []
    for key, value in raw.items():
        if value is None:
            errors.append(f"{key} is missing.")
        if not isinstance(value, (int, float)):
            errors.append(f"{key} must be a number.")
        if value < 0:
            errors.append(f"{key} cannot be negative.")
    return errors
```

**Why Backend Validation?**
- Security: Prevents malicious input
- Data Integrity: Ensures valid data reaches the model
- Error Handling: Provides clear error messages

#### Layer 3: Data Normalization Validation (scaling_bridge.py)

**Range Clipping**:
```python
def normalize_value(key, value):
    min_val, max_val = CLINICAL_RANGES[key]
    normalized = (value - min_val) / (max_val - min_val)
    # Clip to [0, 1] range
    return max(0.0, min(1.0, normalized))
```

**Feature Ordering Validation**:
- Ensures all 24 features are present
- Arranges features in exact order expected by model
- Handles missing values gracefully

### Validation Error Handling

**Frontend**:
- Real-time error messages below each field
- Toast notifications for validation failures
- Prevents form submission if validation fails

**Backend**:
- Returns error status with detailed messages
- Logs validation errors to console
- Returns early if validation fails (no model prediction)

---

## Blockchain Implementation

### Overview

The blockchain provides an immutable, auditable record of all AI predictions. Each prediction is cryptographically hashed and linked to previous predictions, creating a tamper-proof medical record system.

### Block Structure

```python
{
    "index": 5,                          # Sequential block number
    "patient_id": "PAT_ABC123",          # Unique patient identifier
    "prediction": "Diabetes",            # AI's disease prediction
    "triage_level": "Critical",         # Severity classification
    "timestamp": 1234567890.123,        # Unix timestamp
    "previous_hash": "def456...",       # Hash of previous block
    "hash": "abc123...",                # SHA-256 hash of this block
    "nonce": 0                          # Reserved for future use
}
```

### Genesis Block

The first block in the chain:
```python
{
    "index": 0,
    "patient_id": "GENESIS",
    "prediction": "GENESIS_BLOCK",
    "triage_level": "N/A",
    "timestamp": <creation_time>,
    "previous_hash": "0" * 64,  # 64 zeros
    "hash": <calculated_hash>,
    "nonce": 0
}
```

### Hash Calculation

```python
def calculate_hash(block_data):
    # Convert block to JSON string (sorted keys for consistency)
    block_string = json.dumps(block_data, sort_keys=True)
    # Calculate SHA-256 hash
    return hashlib.sha256(block_string.encode()).hexdigest()
```

**Properties**:
- Deterministic: Same input always produces same hash
- One-way: Cannot reverse hash to get original data
- Avalanche effect: Small change produces completely different hash
- Fixed length: Always 64 hexadecimal characters

### Adding a Block

**Process**:
1. Load existing chain from `chain.json`
2. Get previous block's hash
3. Create new block with:
   - Sequential index
   - Patient ID (generated if not provided)
   - Prediction from AI model
   - Triage level (auto-determined)
   - Current timestamp
   - Previous block's hash
4. Calculate hash of new block
5. Append to chain
6. Save to `chain.json`

**Code**:
```python
def add_block(patient_id, prediction, triage_level=None):
    chain = get_chain()
    if not chain:
        chain = [get_genesis_block()]
    
    previous_block = chain[-1]
    previous_hash = previous_block["hash"]
    
    if triage_level is None:
        triage_level = determine_triage_level(prediction)
    
    block_data = {
        "index": len(chain),
        "patient_id": patient_id,
        "prediction": prediction,
        "triage_level": triage_level,
        "timestamp": time.time(),
        "previous_hash": previous_hash,
        "nonce": 0
    }
    
    block_data["hash"] = calculate_hash(block_data)
    chain.append(block_data)
    save_chain(chain)
    
    return block_data
```

### Chain Verification

**Verification Process**:
1. Check genesis block validity
2. For each subsequent block:
   - Verify index sequence
   - Verify previous_hash matches previous block's hash
   - Recalculate block hash and compare with stored hash
3. Return validation status and any errors

**Code**:
```python
def verify_chain():
    chain = get_chain()
    errors = []
    
    # Check genesis block
    if chain[0]["index"] != 0 or chain[0]["previous_hash"] != "0" * 64:
        errors.append("Genesis block is invalid")
        return False, errors
    
    # Verify each block
    for i in range(1, len(chain)):
        current_block = chain[i]
        previous_block = chain[i - 1]
        
        # Verify index
        if current_block["index"] != i:
            errors.append(f"Block {i} has incorrect index")
        
        # Verify chain link
        if current_block["previous_hash"] != previous_block["hash"]:
            errors.append(f"Block {i} has broken chain link")
        
        # Verify hash
        block_copy = current_block.copy()
        stored_hash = block_copy.pop("hash")
        calculated_hash = calculate_hash(block_copy)
        
        if stored_hash != calculated_hash:
            errors.append(f"Block {i} hash is invalid (data tampered)")
    
    return len(errors) == 0, errors
```

### Triage Level Determination

**Mapping**:
```python
TRIAGE_LEVELS = {
    "Critical": ["Heart Disease", "Heart Di", "Diabetes", "Hypertension"],
    "High": ["Anemia", "Thalassemia", "Thalasse"],
    "Medium": ["Chronic Kidney Disease", "Liver Disease"],
    "Low": ["Healthy", "Normal"]
}
```

**Function**:
```python
def determine_triage_level(prediction):
    prediction_clean = prediction.strip().replace("'", "")
    
    for level, diseases in TRIAGE_LEVELS.items():
        if any(disease.lower() in prediction_clean.lower() for disease in diseases):
            return level
    
    return "Medium"  # Default
```

### Patient History Retrieval

**Function**:
```python
def get_patient_history(patient_id):
    chain = get_chain()
    return [block for block in chain if block.get("patient_id") == patient_id]
```

**Use Case**: Retrieve all predictions for a specific patient, creating a complete medical history.

### Chain Statistics

**Function**:
```python
def get_chain_stats():
    chain = get_chain()
    is_valid, _ = verify_chain()
    patient_ids = set(block.get("patient_id") for block in chain if block.get("patient_id") != "GENESIS")
    
    triage_distribution = {}
    for block in chain:
        triage = block.get("triage_level", "Unknown")
        triage_distribution[triage] = triage_distribution.get(triage, 0) + 1
    
    return {
        "total_blocks": len(chain),
        "total_patients": len(patient_ids),
        "chain_valid": is_valid,
        "triage_distribution": triage_distribution,
        "last_block_timestamp": chain[-1].get("timestamp") if chain else None
    }
```

### Immutability Guarantees

1. **Hash Linking**: Each block contains the hash of the previous block
2. **Hash Calculation**: Block hash includes all block data
3. **Verification**: Any tampering breaks the chain link
4. **Detection**: Verification function identifies all inconsistencies

**Example Tampering Detection**:
- If someone modifies a block's prediction
- The block's hash changes
- The next block's `previous_hash` no longer matches
- Verification fails immediately

---

## Feature Explainability

### Overview

Feature explainability helps users understand which clinical markers drove the AI's prediction. This is crucial for:
- **Trust**: Users can see why the model made a prediction
- **Clinical Validation**: Doctors can verify if the reasoning makes sense
- **Education**: Patients can understand which values are concerning

### Implementation

#### Backend (`explainability.py`):
```python
def get_feature_importance(model):
    try:
        importance = model.feature_importances_
        return importance.tolist()
    except:
        return []
```

**XGBoost Feature Importance**:
- Calculated during training
- Based on how much each feature reduces impurity
- Higher values = more important for prediction

#### Frontend (`FeatureImportance.jsx`):

**Feature Mapping**:
```javascript
const FEATURE_NAMES = [
  "Glucose", "Cholesterol", "Hemoglobin", "Platelets",
  // ... 24 total features in model order
];
```

**Top Features Selection**:
```javascript
const featureData = FEATURE_NAMES.map((name, index) => ({
  name,
  importance: featureImportance[index] || 0,
  value: getPatientValue(name),
}));

const topFeatures = featureData
  .sort((a, b) => b.importance - a.importance)
  .slice(0, topN);
```

**Visualization**:
- Bar charts showing relative importance
- Color-coded by rank (red = most important)
- Percentage display of importance score

**Risk Indicators**:
```javascript
const HIGH_RISK_MARKERS = {
  "Glucose": "High glucose levels indicate diabetes risk",
  "Troponin": "High troponin suggests heart muscle damage",
  // ...
};

const LOW_RISK_MARKERS = {
  "Hemoglobin": "Low hemoglobin indicates anemia",
  "Platelets": "Low platelet count increases bleeding risk",
  // ...
};
```

**Reference Ranges**:
```javascript
const REFERENCE_RANGES = {
  "Glucose": { normal: [70, 100], high: 126 },
  "Troponin": { normal: [0, 0.04], high: 0.04 },
  // ...
};
```

**Risk Assessment**:
- Compares patient values to reference ranges
- Identifies high-risk markers (elevated values)
- Identifies low-risk markers (deficient values)
- Provides severity levels (critical, warning, info)

### Display Format

1. **Summary**: "Prediction Driven By: high Glucose, high Troponin, and others"
2. **Top Features List**:
   - Feature name
   - Importance percentage
   - Bar chart visualization
   - Patient value
   - Risk indicator (if applicable)
3. **Interpretation**: Explanation of what importance means

---

## Data Flow and Processing

### Complete Prediction Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INPUT (Frontend - ReportForm.jsx)                   │
│    - User enters 24 clinical values                         │
│    - Real-time validation (numeric, ranges)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND VALIDATION                                      │
│    - Check all fields filled                                │
│    - Check numeric format                                   │
│    - Check realistic ranges                                 │
│    - Show errors if invalid                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (If valid)
┌─────────────────────────────────────────────────────────────┐
│ 3. FIELD MAPPING                                            │
│    - Convert frontend names → backend names                 │
│    - "white blood cells" → "White_Blood_Cells"             │
│    - Convert strings → floats                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. API REQUEST (HTTP POST to /predict)                     │
│    - JSON payload with 24 clinical parameters               │
│    - Optional patient_id                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. BACKEND VALIDATION (validator.py)                       │
│    - Check all parameters present                           │
│    - Check numeric types                                    │
│    - Check non-negative values                              │
│    - Return errors if invalid                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (If valid)
┌─────────────────────────────────────────────────────────────┐
│ 6. DATA NORMALIZATION (scaling_bridge.py)                  │
│    - For each parameter:                                    │
│      raw_value → normalized_value (0-1 range)              │
│    - Formula: (value - min) / (max - min)                   │
│    - Arrange in model's expected order                      │
│    - Output: NumPy array (1, 24)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. MODEL PREDICTION (XGBoost)                              │
│    - model.predict() → encoded class                        │
│    - label_encoder.inverse_transform() → disease name      │
│    - model.predict_proba() → probabilities for all classes  │
│    - model.feature_importances_ → importance scores        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. TRIAGE DETERMINATION (blockchain.py)                    │
│    - Map disease → triage level                             │
│    - Critical/High/Medium/Low                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. BLOCKCHAIN LOGGING (blockchain.py)                      │
│    - Generate patient_id if not provided                    │
│    - Create new block with all data                        │
│    - Calculate SHA-256 hash                                 │
│    - Link to previous block                                 │
│    - Save to chain.json                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. RESPONSE ASSEMBLY                                      │
│     - Combine prediction, probabilities, importance        │
│     - Add blockchain entry details                         │
│     - Format as JSON                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 11. FRONTEND RECEIPT (ReportForm.jsx)                      │
│     - Receive JSON response                                  │
│     - Display prediction and triage level                   │
│     - Show probabilities                                    │
│     - Render feature importance visualization              │
│     - Save to LocalStorage                                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Transformations

#### Transformation 1: Raw → Normalized
```
Glucose: 120 mg/dL
  ↓
Range: (50, 250)
  ↓
Normalized: (120 - 50) / (250 - 50) = 0.35
```

#### Transformation 2: Normalized → Model Input
```
[0.35, 0.42, 0.18, ...] (24 values)
  ↓
NumPy array shape: (1, 24)
  ↓
Model input ready
```

#### Transformation 3: Model Output → Human-Readable
```
Encoded class: 3
  ↓
Label encoder lookup
  ↓
Disease name: "Diabetes"
```

---

## Authentication System

### Overview

The authentication system uses client-side storage (LocalStorage) with password hashing for security.

### Components

#### 1. Password Hashing

**Algorithm**: SHA-256 (Web Crypto API)

**Implementation**:
```javascript
const hashPassword = async (plainPassword) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainPassword);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};
```

**Properties**:
- One-way hashing (cannot reverse)
- Deterministic (same input = same hash)
- Fixed length (64 hex characters)

#### 2. Password Validation

**Rules**:
- Minimum 8 characters
- At least one special character: `!@#$%^&*()_+-=[]{}|;':"\\,.<>/?`
- At least one uppercase letter (A-Z)

**Implementation**:
```javascript
const validatePassword = (pwd) => {
  if (pwd.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  if (!specialCharRegex.test(pwd)) {
    return "Password must contain at least one special character.";
  }
  
  const uppercaseRegex = /[A-Z]/;
  if (!uppercaseRegex.test(pwd)) {
    return "Password must contain at least one uppercase letter (A-Z).";
  }
  
  return null; // Valid
};
```

#### 3. Signup Process

**Steps**:
1. Validate email and password format
2. Check if user already exists
3. Hash password
4. Store user in LocalStorage
5. Show success message

**Code**:
```javascript
if (type === "signup") {
  if (users.find((u) => u.email === email)) {
    setError("User already exists. Please log in.");
    return;
  }
  
  const hashedPassword = await hashPassword(password);
  users.push({ email, password: hashedPassword });
  localStorage.setItem("med_users", JSON.stringify(users));
  
  alert("Signup successful! You can now log in.");
  onClose();
}
```

#### 4. Login Process

**Steps**:
1. Validate email and password format
2. Hash entered password
3. Compare with stored hash
4. If match: Store user session, show success
5. If no match: Check for legacy plain-text (migration)
6. If still no match: Show error

**Code**:
```javascript
if (type === "login") {
  const hashedPassword = await hashPassword(password);
  const foundUser = users.find(
    (u) => u.email === email && u.password === hashedPassword
  );
  
  // Legacy support: migrate plain-text passwords
  if (!foundUser) {
    const legacyUser = users.find(
      (u) => u.email === email && u.password === password
    );
    
    if (legacyUser) {
      legacyUser.password = hashedPassword;
      localStorage.setItem("med_users", JSON.stringify(users));
      // Login successful
    }
  }
  
  if (foundUser || legacyUser) {
    localStorage.setItem("user", JSON.stringify({ email }));
    setUser({ email });
    alert("Login successful!");
    onClose();
  } else {
    setError("Invalid email or password.");
  }
}
```

#### 5. Session Management

**Storage**:
- User credentials: `localStorage.getItem("med_users")`
- Current session: `localStorage.getItem("user")`

**Logout**:
```javascript
const handleLogout = () => {
  localStorage.removeItem("user");
  setUser(null);
  setCurrentPage("home");
};
```

#### 6. Protected Routes

**Implementation**:
```javascript
if (currentPage === "form") {
  return user ? (
    <ReportForm onSubmit={handleReportSubmit} />
  ) : (
    requiresAuthMessage("Submit Report form")
  );
}
```

---

## API Endpoints

### 1. POST `/predict`

**Purpose**: Main prediction endpoint

**Request Body**:
```json
{
  "Glucose": 120.0,
  "Cholesterol": 200.0,
  "Hemoglobin": 14.5,
  "Platelets": 250000.0,
  "White_Blood_Cells": 7000.0,
  "Red_Blood_Cells": 4.5,
  "Hematocrit": 42.0,
  "Mean_Corpuscular_Volume": 90.0,
  "Mean_Corpuscular_Hemoglobin": 30.0,
  "Mean_Corpuscular_Hemoglobin_Concentration": 33.0,
  "Insulin": 15.0,
  "BMI": 25.0,
  "Systolic_Blood_Pressure": 120.0,
  "Diastolic_Blood_Pressure": 80.0,
  "Triglycerides": 150.0,
  "HbA1c": 5.5,
  "LDL_Cholesterol": 100.0,
  "HDL_Cholesterol": 50.0,
  "ALT": 25.0,
  "AST": 28.0,
  "Heart_Rate": 72.0,
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
  "patient_id": "PAT_ABC123",
  "prediction": "Diabetes",
  "triage_level": "Critical",
  "probabilities": {
    "Diabetes": 0.85,
    "Healthy": 0.10,
    "Hypertension": 0.03,
    "Anemia": 0.02
  },
  "feature_importance": [0.15, 0.12, 0.10, ...],
  "blockchain_entry": {
    "block_index": 5,
    "hash": "abc123def456...",
    "previous_hash": "def456ghi789...",
    "timestamp": 1234567890.123,
    "triage_level": "Critical"
  }
}
```

**Response (Error)**:
```json
{
  "status": "error",
  "errors": [
    "Glucose is missing.",
    "Cholesterol must be a number."
  ]
}
```

### 2. GET `/blockchain/verify`

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

### 3. GET `/blockchain/stats`

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
      "High": 30,
      "Medium": 25,
      "Low": 25
    },
    "last_block_timestamp": 1234567890.123
  }
}
```

### 4. GET `/blockchain/patient/{patient_id}`

**Purpose**: Get all predictions for a patient

**Response**:
```json
{
  "status": "success",
  "patient_id": "PAT_ABC123",
  "total_entries": 5,
  "history": [
    {
      "index": 1,
      "patient_id": "PAT_ABC123",
      "prediction": "Diabetes",
      "triage_level": "Critical",
      "timestamp": 1234567890.123,
      "timestamp_readable": "2024-01-01 12:00:00",
      "hash": "abc123...",
      "previous_hash": "0000..."
    }
  ]
}
```

### 5. GET `/blockchain/block/{block_hash}`

**Purpose**: Retrieve a specific block by hash

**Response**:
```json
{
  "status": "success",
  "block": {
    "index": 5,
    "patient_id": "PAT_ABC123",
    "prediction": "Diabetes",
    "triage_level": "Critical",
    "timestamp": 1234567890.123,
    "timestamp_readable": "2024-01-01 12:00:00",
    "hash": "abc123...",
    "previous_hash": "def456..."
  }
}
```

### 6. GET `/blockchain/audit`

**Purpose**: Comprehensive blockchain audit

**Response**:
```json
{
  "status": "success",
  "chain_valid": true,
  "verification_errors": [],
  "statistics": {
    "total_blocks": 100,
    "total_patients": 50,
    "chain_valid": true,
    "triage_distribution": {...}
  },
  "chain": [...]
}
```

---

## Setup and Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

**Required packages**:
- fastapi
- uvicorn
- pydantic
- scikit-learn
- joblib
- pandas
- numpy
- xgboost
- imbalanced-learn

3. **Ensure model files exist**:
- `model/medi_guard_merged_model.pkl`
- `model/label_encoder.pkl`

4. **Start the server**:
```bash
python run_server.py
```

Server will be available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend/med-analysis-frontend
```

2. **Install Node dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Training a New Model

1. **Prepare training data**:
   - Place `train.csv` and `test.csv` in `backend/data/`
   - Ensure CSV has 24 feature columns + "Disease" column

2. **Run training script**:
```bash
cd backend
python train_improved.py
```

3. **Model will be saved to**:
   - `backend/model/medi_guard_merged_model.pkl`
   - `backend/model/label_encoder.pkl`

---

## Usage Guide

### For End Users

1. **Access the Application**:
   - Open browser to `http://localhost:5173`

2. **Create an Account**:
   - Click "Login" → "Sign Up"
   - Enter email and password (must meet requirements)
   - Click "Sign Up"

3. **Submit a Report**:
   - Click "Start Analysis" or navigate to "Form"
   - Enter all 24 clinical parameters
   - Ensure values are within realistic ranges
   - Click "Submit Report"

4. **View Results**:
   - Prediction displayed immediately
   - View probabilities for all diseases
   - See feature importance visualization
   - Review risk indicators

5. **View History**:
   - Navigate to "History" page
   - See all past predictions
   - Click "Show Details" for full information
   - View blockchain verification data

### For Developers

#### Adding a New Feature

1. **Backend**:
   - Add endpoint in `app.py`
   - Implement logic in separate module if needed
   - Update API documentation

2. **Frontend**:
   - Create new component in `src/components/`
   - Add route in `App.jsx`
   - Update navigation if needed

#### Modifying the Model

1. **Update Training Data**:
   - Add new features to CSV
   - Update `scaling_bridge.py` with new ranges
   - Update feature order

2. **Retrain Model**:
   - Run `train_improved.py`
   - Test model performance
   - Replace model files if improved

3. **Update API**:
   - Update `RawInput` model in `app.py`
   - Update frontend form fields
   - Update validation ranges

#### Extending Blockchain

1. **Add New Fields**:
   - Update block structure in `blockchain.py`
   - Update `add_block()` function
   - Update migration function if needed

2. **Add New Endpoints**:
   - Add route in `app.py`
   - Implement blockchain query function
   - Test with frontend integration

---

## Technical Details

### Model Performance Metrics

The model is evaluated using:
- **Accuracy**: Overall correct predictions
- **F1-Score (Macro)**: Average F1 across all classes
- **F1-Score (Weighted)**: Weighted by class frequency
- **Confusion Matrix**: Per-class performance
- **Cross-Validation**: 5-fold stratified CV

### Data Normalization Details

**Why Normalize?**
- Different parameters have different units and scales
- Model was trained on normalized data (0-1 range)
- Ensures consistent feature importance

**Normalization Formula**:
```
normalized = (value - min_clinical) / (max_clinical - min_clinical)
```

**Clinical Ranges**:
- Based on realistic medical values
- Covers normal and abnormal ranges
- Values outside range are clipped to [0, 1]

### Blockchain Security

**Hash Algorithm**: SHA-256
- Industry standard
- Cryptographically secure
- Collision-resistant

**Immutability**:
- Each block linked to previous
- Hash includes all block data
- Any modification breaks chain

**Auditability**:
- Complete history for each patient
- Timestamped records
- Verifiable integrity

### Error Handling

**Frontend**:
- Try-catch blocks around API calls
- Toast notifications for errors
- Graceful degradation

**Backend**:
- Pydantic validation
- Try-catch in prediction endpoint
- Detailed error messages
- Console logging for debugging

---

## Future Enhancements

### Potential Improvements

1. **Database Integration**:
   - Replace LocalStorage with database
   - User management system
   - Persistent report storage

2. **Advanced ML**:
   - Ensemble models
   - Deep learning options
   - Real-time model updates

3. **Blockchain**:
   - Distributed blockchain
   - Smart contracts
   - Multi-node verification

4. **Features**:
   - PDF report generation
   - Email notifications
   - Doctor dashboard
   - Patient portal

5. **Security**:
   - JWT authentication
   - Role-based access control
   - API rate limiting
   - HTTPS enforcement

---

## Conclusion

Medi-Guard is a comprehensive medical AI system combining machine learning, blockchain technology, and modern web development. The system provides accurate disease predictions with full explainability and immutable audit trails, making it suitable for clinical decision support and compliance requirements.

The documentation above covers all aspects of the system, from data flow to implementation details. For questions or contributions, please refer to the codebase and this documentation.

---

**Last Updated**: 2024
**Version**: 1.0
**License**: See project repository