import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from xgboost import XGBClassifier
import joblib
import warnings

warnings.filterwarnings("ignore")

print("===================================================")
print("      MEDI-GUARD MERGED MODEL TRAINING (IMPROVED)      ")
print("===================================================\n")

# ----------------------------------------------------
# 1. LOAD AND MERGE DATASETS
# ----------------------------------------------------
print("[1] Loading train.csv and test.csv ...")

# Ensure paths are correct for your environment
if not os.path.exists("data/train.csv"):
    # Fallback if files are in current directory
    train = pd.read_csv("train.csv")
    test = pd.read_csv("test.csv")
else:
    train = pd.read_csv("data/train.csv")
    test = pd.read_csv("data/test.csv")

# Drop predictions column if exists
if "Predicted_Disease" in test.columns:
    test = test.drop("Predicted_Disease", axis=1)

# Merge datasets (Crucial step since 'Heart Di' is only in test.csv)
df = pd.concat([train, test], ignore_index=True)
df = df.drop_duplicates()

print(f"Merged Dataset Shape: {df.shape}")
print("Class Distribution (Merged):")
print(df["Disease"].value_counts(), "\n")

# ----------------------------------------------------
# 2. PREPARE FEATURES & TARGET
# ----------------------------------------------------
X = df.drop("Disease", axis=1)
y = df["Disease"]

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# ----------------------------------------------------
# 3. TRAIN-TEST SPLIT
# ----------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# ----------------------------------------------------
# 4. TRAIN XGBOOST MODEL (WITH EARLY STOPPING)
# ----------------------------------------------------
print("[3] Training XGBoost model with Early Stopping...")

# Increased n_estimators limit, but early_stopping will cut it short
model = XGBClassifier(
    n_estimators=2000,          # Set high limit
    max_depth=7,
    learning_rate=0.05,
    subsample=0.9,
    colsample_bytree=0.9,
    eval_metric="mlogloss",
    reg_lambda=1.0,
    random_state=42,
    early_stopping_rounds=50    # Stop if no improvement for 50 rounds
)

# Pass eval_set to monitor performance during training
model.fit(
    X_train, y_train, 
    eval_set=[(X_test, y_test)], 
    verbose=100  # Print progress every 100 rounds
)

# ----------------------------------------------------
# 5. EVALUATION
# ----------------------------------------------------
print("\n================ MODEL PERFORMANCE ================\n")

pred = model.predict(X_test)
acc = accuracy_score(y_test, pred)

print(f"🎯 Test Accuracy: {acc*100:.2f}%\n")
print(f"Optimal Trees Used: {model.best_ntree_limit if hasattr(model, 'best_ntree_limit') else 'N/A'}")

print("Classification Report:")
print(classification_report(y_test, pred, target_names=label_encoder.classes_))

# ----------------------------------------------------
# 6. SAVE MODEL
# ----------------------------------------------------
print("\n[4] Saving model and label encoder...")

# Create directory if it doesn't exist
os.makedirs("model", exist_ok=True)

joblib.dump(model, "model/medi_guard_merged_model.pkl")
joblib.dump(label_encoder, "model/label_encoder.pkl")

print("\n===================================================")
print("           MODEL SAVED SUCCESSFULLY!")
print("===================================================\n")