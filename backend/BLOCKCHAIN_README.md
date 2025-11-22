# Blockchain Implementation for Medical AI Predictions

## Overview

This implementation provides an immutable, auditable blockchain system for logging AI predictions and triage decisions. Each prediction is timestamped and cryptographically hashed, creating a non-repudiable medical record.

## Features

### 1. **Immutable Chain Structure**
- Each block contains:
  - `index`: Sequential block number
  - `patient_id`: Unique patient identifier
  - `prediction`: AI's disease prediction
  - `triage_level`: Severity level (Critical, High, Medium, Low)
  - `timestamp`: Unix timestamp of the prediction
  - `previous_hash`: Hash of the previous block (ensures immutability)
  - `hash`: SHA-256 hash of the block data

### 2. **Triage Decision Logic**
The system automatically determines triage priority based on disease predictions:
- **Critical**: Heart Disease, Diabetes, Hypertension
- **High**: Anemia, Thalassemia
- **Medium**: Chronic Kidney Disease, Liver Disease
- **Low**: Healthy, Normal

### 3. **Chain Integrity Verification**
- Verifies that each block's hash matches its data
- Verifies that each block's `previous_hash` links correctly to the previous block
- Detects any tampering or data corruption

### 4. **Patient History Tracking**
- Retrieve all blockchain entries for a specific patient
- Create a complete audit trail of all AI predictions for that patient

## API Endpoints

### `/predict` (POST)
Main prediction endpoint that automatically logs to blockchain.

**Request:**
```json
{
  "Glucose": 120.0,
  "Cholesterol": 200.0,
  ...
  "patient_id": "PAT_ABC123"  // Optional
}
```

**Response:**
```json
{
  "status": "success",
  "patient_id": "PAT_ABC123",
  "prediction": "Diabetes",
  "triage_level": "Critical",
  "blockchain_entry": {
    "block_index": 5,
    "hash": "abc123...",
    "previous_hash": "def456...",
    "timestamp": 1234567890.123,
    "triage_level": "Critical"
  }
}
```

### `/blockchain/verify` (GET)
Verify the integrity of the entire blockchain.

**Response:**
```json
{
  "status": "valid",
  "is_valid": true,
  "errors": [],
  "message": "Blockchain is valid and immutable"
}
```

### `/blockchain/stats` (GET)
Get statistics about the blockchain.

**Response:**
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
    }
  }
}
```

### `/blockchain/patient/{patient_id}` (GET)
Retrieve all blockchain entries for a specific patient.

**Response:**
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

### `/blockchain/block/{block_hash}` (GET)
Retrieve a specific block by its hash.

### `/blockchain/audit` (GET)
Comprehensive audit of the entire blockchain with full chain data.

## How It Works

1. **Block Creation**: When a prediction is made:
   - Patient ID is generated (if not provided)
   - Triage level is determined automatically
   - A new block is created with all relevant data
   - The block's hash is calculated using SHA-256
   - The block is linked to the previous block via `previous_hash`

2. **Immutability**: 
   - Each block's hash includes the previous block's hash
   - Any modification to a block would change its hash
   - This would break the chain link, making tampering detectable

3. **Verification**:
   - The system can verify the entire chain's integrity
   - Any broken links or invalid hashes are detected
   - Provides an auditable trail for medical records

## Migration

The system automatically migrates old blockchain format to the new format:
- Old format: Simple list with `patient_id`, `prediction`, `timestamp`, `hash`
- New format: Full blockchain structure with `index`, `previous_hash`, `triage_level`, etc.

Migration happens automatically on first access after update.

## Security & Compliance

- **Non-repudiation**: Each prediction is cryptographically signed via hash
- **Auditability**: Complete history of all predictions is maintained
- **Immutability**: Once recorded, predictions cannot be altered without detection
- **Timestamping**: Precise timestamps for all medical decisions

## Usage Example

```python
from blockchain import add_block, verify_chain, get_patient_history

# Add a prediction to blockchain
block = add_block("PAT_123", "Diabetes", "Critical")

# Verify chain integrity
is_valid, errors = verify_chain()

# Get patient history
history = get_patient_history("PAT_123")
```

