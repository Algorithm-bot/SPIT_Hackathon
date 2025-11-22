import pandas as pd
import joblib
import json

# Load test dataset
test_df = pd.read_csv("data/test.csv")

# Load model
model = joblib.load("model/medi_guard_model.pkl")

# Load min/max scaler (if needed)
scaler = json.load(open("model/scaler.json"))

train_min = scaler["min"]
train_max = scaler["max"]


# Remove Disease column if present
if "Disease" in test_df.columns:
    test_df = test_df.drop("Disease", axis=1)

    
# Function to scale manually like during training
def scale_row(row):
    scaled = {}
    for col in row.index:
        min_val = train_min[col]
        max_val = train_max[col]
        # Apply safe scaling: 0–1 range
        scaled[col] = (row[col] - min_val) / (max_val - min_val)
    return scaled

# Scale entire test set
scaled_test = test_df.apply(scale_row, axis=1, result_type="expand")

# Predict
predictions = model.predict(scaled_test)

# Add predictions to test_df
test_df["Predicted_Disease"] = predictions

# Save results
output_path = "test_predictions.csv"
test_df.to_csv(output_path, index=False)

print(f"Prediction completed! Saved to {output_path}")
print(test_df.head())
