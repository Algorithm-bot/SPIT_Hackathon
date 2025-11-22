import pandas as pd
import joblib
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import warnings
warnings.filterwarnings("ignore")

print("===================================================")
print("            MEDI-GUARD PREDICTION MODULE           ")
print("===================================================\n")

# ----------------------------------------------------
# 1. LOAD TEST DATA
# ----------------------------------------------------
test_df = pd.read_csv("data/test.csv")

# Check if true labels exist
true_labels = None
if "Disease" in test_df.columns:
    print("True labels found. Running evaluation mode...\n")
    true_labels = test_df["Disease"].copy()
    X_test = test_df.drop("Disease", axis=1)
else:
    print("No true labels found. Running prediction-only mode...\n")
    X_test = test_df.copy()

# ----------------------------------------------------
# 2. LOAD TRAINED MODEL + LABEL ENCODER
# ----------------------------------------------------
print("Loading model and label encoder...")

model = joblib.load("model/medi_guard_merged_model.pkl")
label_encoder = joblib.load("model/label_encoder.pkl")

print("Model loaded successfully!\n")

# ----------------------------------------------------
# 3. PREDICT
# ----------------------------------------------------
print("Generating predictions...\n")

pred_encoded = model.predict(X_test)
pred_labels = label_encoder.inverse_transform(pred_encoded)

# Append predictions to DataFrame
result_df = test_df.copy()
result_df["Predicted_Disease"] = pred_labels

# ----------------------------------------------------
# 4. EVALUATE (ONLY IF TRUE LABELS EXIST)
# ----------------------------------------------------
if true_labels is not None:
    print("================ MODEL EVALUATION ================\n")

    acc = accuracy_score(true_labels, pred_labels)
    print(f"🎯 Accuracy: {acc*100:.2f}%\n")

    print("Classification Report:")
    print(classification_report(true_labels, pred_labels))

    print("Confusion Matrix:")
    print(confusion_matrix(true_labels, pred_labels))

    correct = sum(true_labels == pred_labels)
    incorrect = len(pred_labels) - correct
    print(f"\nCorrect: {correct}  |  Incorrect: {incorrect}\n")

# ----------------------------------------------------
# 5. SAVE OUTPUT
# ----------------------------------------------------
output_path = "test_predictions.csv"
result_df.to_csv(output_path, index=False)

print("===================================================")
print(f"Prediction saved to: {output_path}")
print("===================================================\n")

print("First 5 predictions:")
print(result_df.head())
