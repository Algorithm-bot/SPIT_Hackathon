import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from xgboost import XGBClassifier
import joblib
import warnings

warnings.filterwarnings("ignore")

print("===================================================")
print("      MEDI-GUARD MERGED MODEL TRAINING (FINAL)      ")
print("===================================================\n")

# ----------------------------------------------------
# 1. LOAD AND MERGE DATASETS
# ----------------------------------------------------
print("[1] Loading train.csv and test.csv ...")

train = pd.read_csv("data/train.csv")
test = pd.read_csv("data/test.csv")

print(f"Original Train: {train.shape}")
print(f"Original Test:  {test.shape}")

# Drop predictions column if exists in test.csv
if "Predicted_Disease" in test.columns:
    test = test.drop("Predicted_Disease", axis=1)

# Merge datasets
df = pd.concat([train, test], ignore_index=True)

# Remove duplicates (optional but recommended)
df = df.drop_duplicates()

print(f"Merged Dataset Shape: {df.shape}")
print("Class Distribution (Merged):")
print(df["Disease"].value_counts(), "\n")

# ----------------------------------------------------
# 2. PREPARE FEATURES & TARGET
# ----------------------------------------------------
X = df.drop("Disease", axis=1)
y = df["Disease"]

# Label Encode classes
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# ----------------------------------------------------
# 3. TRAIN-TEST SPLIT (STRATIFIED)
# ----------------------------------------------------
print("[2] Splitting merged dataset...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

print(f"Training Samples: {X_train.shape}")
print(f"Testing Samples:  {X_test.shape}\n")

# ----------------------------------------------------
# 4. TRAIN XGBOOST MODEL
# ----------------------------------------------------
print("[3] Training XGBoost model (optimized parameters)...")

model = XGBClassifier(
    n_estimators=600,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.9,
    colsample_bytree=0.9,
    eval_metric="mlogloss",
    reg_lambda=1.0,
    random_state=42
)

model.fit(X_train, y_train)

# ----------------------------------------------------
# 5. EVALUATION
# ----------------------------------------------------
print("\n================ MODEL PERFORMANCE ================\n")

pred = model.predict(X_test)
acc = accuracy_score(y_test, pred)

print(f"🎯 Test Accuracy: {acc*100:.2f}%\n")

print("Classification Report:")
print(classification_report(y_test, pred, target_names=label_encoder.classes_))

print("Confusion Matrix:")
print(confusion_matrix(y_test, pred))

# ----------------------------------------------------
# 6. CROSS VALIDATION
# ----------------------------------------------------
print("\nRunning 5-Fold Cross-Validation...")
cv_scores = cross_val_score(model, X, y_encoded, cv=5, scoring="accuracy")

print(f"\nCross-Validation Accuracy: {cv_scores.mean()*100:.2f}% (+/- {cv_scores.std()*200:.2f})")

# ----------------------------------------------------
# 7. SAVE MODEL
# ----------------------------------------------------
print("\n[4] Saving model and label encoder...")

joblib.dump(model, "model/medi_guard_merged_model.pkl")
joblib.dump(label_encoder, "model/label_encoder.pkl")

print("\n===================================================")
print("           MODEL SAVED SUCCESSFULLY!")
print("===================================================\n")
