import pandas as pd
import joblib
import os
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import warnings

warnings.filterwarnings("ignore")

print("===================================================")
print("      MEDI-GUARD PREDICTION MODULE       ")
print("===================================================\n")

# ----------------------------------------------------
# 1. LOAD DATA
# ----------------------------------------------------
# Ensure consistent pathing
file_path = "data/test.csv"
if not os.path.exists(file_path):
    file_path = "test.csv" # Fallback for local testing

print(f"[1] Loading data from: {file_path}")
test_df = pd.read_csv(file_path)

# --- SAFETY FIX: Drop previous predictions if they exist ---
# This prevents a "Feature Mismatch" error if you run the script 
# on a file that was already processed.
if "Predicted_Disease" in test_df.columns:
    test_df = test_df.drop("Predicted_Disease", axis=1)

# ----------------------------------------------------
# 2. PREPARE FEATURES
# ----------------------------------------------------
# Check if true labels exist (for evaluation)
true_labels = None
if "Disease" in test_df.columns:
    print("True labels found. Running evaluation mode...\n")
    true_labels = test_df["Disease"].copy()
    X_test = test_df.drop("Disease", axis=1)
else:
    print("No true labels found. Running prediction-only mode...\n")
    X_test = test_df.copy()

# ----------------------------------------------------
# 3. LOAD MODEL
# ----------------------------------------------------
print("[2] Loading model and label encoder...")

if not os.path.exists("model/medi_guard_merged_model.pkl"):
    raise FileNotFoundError("Model file not found! Please run train.py first.")

model = joblib.load("model/medi_guard_merged_model.pkl")
label_encoder = joblib.load("model/label_encoder.pkl")

print("Model loaded successfully!\n")

# ----------------------------------------------------
# 4. PREDICT
# ----------------------------------------------------
print("[3] Generating predictions...")

# Ensure columns match the model's expected feature order
# (This handles cases where column order might be slightly different)
if hasattr(model, "feature_names_in_"):
    X_test = X_test[model.feature_names_in_]

pred_encoded = model.predict(X_test)
pred_labels = label_encoder.inverse_transform(pred_encoded)

# Append results
result_df = test_df.copy()
result_df["Predicted_Disease"] = pred_labels

# ----------------------------------------------------
# 5. EVALUATE (If Labels Exist)
# ----------------------------------------------------
if true_labels is not None:
    print("\n================ MODEL EVALUATION ================\n")
    
    acc = accuracy_score(true_labels, pred_labels)
    print(f"🎯 Accuracy: {acc*100:.2f}%")
    print("(Note: If this data was used in training, this accuracy is biased.)\n")

    print("Classification Report:")
    print(classification_report(true_labels, pred_labels))

    print("Confusion Matrix:")
    print(confusion_matrix(true_labels, pred_labels))

# ----------------------------------------------------
# 6. SAVE OUTPUT
# ----------------------------------------------------
output_path = "test_predictions.csv"
result_df.to_csv(output_path, index=False)

print("\n===================================================")
print(f"Prediction saved to: {output_path}")
print("First 5 predictions:")
print(result_df[["Disease", "Predicted_Disease"]].head() if "Disease" in result_df.columns else result_df.head())
print("===================================================\n")