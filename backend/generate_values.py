import pandas as pd
import numpy as np
import joblib

# Load a real dataset for min/max reference
df = pd.read_csv("data/train.csv")   # your original normalized dataset

X = df.drop("Disease", axis=1)

# Load model + encoder
model = joblib.load("model/medi_guard_model.pkl")
label_encoder = joblib.load("model/label_encoder.pkl")

FEATURES = X.columns.tolist()

print("\nGenerating a realistic test sample...\n")

sample = {}

for col in FEATURES:
    col_min = X[col].min()
    col_max = X[col].max()

    # generate a value in the same range
    val = np.random.uniform(col_min, col_max)

    sample[col] = round(val, 6)

# Convert to DataFrame
sample_df = pd.DataFrame([sample])

print("\nGenerated Sample Values:\n")
for k, v in sample.items():
    print(f"{k}: {v}")

# Predict disease
encoded_pred = model.predict(sample_df)[0]
predicted_label = label_encoder.inverse_transform([encoded_pred])[0]

print("\n============================================")
print(f" Predicted Disease: {predicted_label}")
print("============================================\n")
