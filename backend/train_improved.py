import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
import joblib
import warnings

warnings.filterwarnings("ignore")

print("="*80)
print("      MEDI-GUARD IMPROVED MODEL TRAINING (WITH CLASS BALANCING)      ")
print("="*80 + "\n")

# ----------------------------------------------------
# 1. LOAD AND MERGE DATASETS
# ----------------------------------------------------
print("[1] Loading train.csv and test.csv ...")

if not os.path.exists("data/train.csv"):
    train = pd.read_csv("train.csv")
    test = pd.read_csv("test.csv")
else:
    train = pd.read_csv("data/train.csv")
    test = pd.read_csv("data/test.csv")

if "Predicted_Disease" in test.columns:
    test = test.drop("Predicted_Disease", axis=1)

df = pd.concat([train, test], ignore_index=True)
df = df.drop_duplicates()

print(f"Merged Dataset Shape: {df.shape}")
print("\nClass Distribution (Before Balancing):")
class_counts = df["Disease"].value_counts()
print(class_counts)
print()

# ----------------------------------------------------
# 2. PREPARE FEATURES & TARGET
# ----------------------------------------------------
X = df.drop("Disease", axis=1)
y = df["Disease"]

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# ----------------------------------------------------
# 3. TRAIN-TEST SPLIT (STRATIFIED)
# ----------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

print(f"Training set size: {len(X_train)}")
print(f"Test set size: {len(X_test)}")
print("\nTraining Class Distribution:")
train_counts = pd.Series(y_train).value_counts().sort_index()
for i, count in enumerate(train_counts):
    print(f"  {label_encoder.classes_[i]:15s}: {count:4d}")

# ----------------------------------------------------
# 4. HANDLE CLASS IMBALANCE WITH SMOTE
# ----------------------------------------------------
print("\n[2] Applying SMOTE to balance classes...")
smote = SMOTE(random_state=42, k_neighbors=3)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

print(f"After SMOTE - Training set size: {len(X_train_balanced)}")
print("Balanced Class Distribution:")
balanced_counts = pd.Series(y_train_balanced).value_counts().sort_index()
for i, count in enumerate(balanced_counts):
    print(f"  {label_encoder.classes_[i]:15s}: {count:4d}")

# ----------------------------------------------------
# 5. CALCULATE CLASS WEIGHTS
# ----------------------------------------------------
from collections import Counter
class_counts_dict = Counter(y_train)
total = sum(class_counts_dict.values())
class_weights = {cls: total / (len(class_counts_dict) * count) 
                 for cls, count in class_counts_dict.items()}

print("\n[3] Calculated Class Weights:")
for cls, weight in sorted(class_weights.items()):
    print(f"  Class {cls} ({label_encoder.classes_[cls]:15s}): {weight:.3f}")

# ----------------------------------------------------
# 6. TRAIN XGBOOST MODEL WITH IMPROVED PARAMETERS
# ----------------------------------------------------
print("\n[4] Training XGBoost model with improved parameters...")

model = XGBClassifier(
    n_estimators=2000,
    max_depth=6,                    # Reduced from 7 to prevent overfitting
    learning_rate=0.03,             # Reduced from 0.05 for better convergence
    subsample=0.85,                 # Slightly reduced
    colsample_bytree=0.85,         # Slightly reduced
    min_child_weight=3,            # Added to handle imbalanced data
    gamma=0.1,                     # Added regularization
    reg_alpha=0.1,                 # L1 regularization
    reg_lambda=1.5,                # Increased L2 regularization
    eval_metric="mlogloss",
    random_state=42,
    early_stopping_rounds=100,    # Increased patience
    use_label_encoder=False
)

# Fit with balanced data
model.fit(
    X_train_balanced, y_train_balanced,
    eval_set=[(X_test, y_test)],
    verbose=100
)

# ----------------------------------------------------
# 7. EVALUATION
# ----------------------------------------------------
print("\n" + "="*80)
print("                    MODEL PERFORMANCE")
print("="*80 + "\n")

pred = model.predict(X_test)
acc = accuracy_score(y_test, pred)
f1_macro = f1_score(y_test, pred, average='macro')
f1_weighted = f1_score(y_test, pred, average='weighted')

print(f"🎯 Test Accuracy: {acc*100:.2f}%")
print(f"📊 F1-Score (Macro): {f1_macro*100:.2f}%")
print(f"📊 F1-Score (Weighted): {f1_weighted*100:.2f}%")
print(f"🌳 Optimal Trees Used: {model.best_ntree_limit if hasattr(model, 'best_ntree_limit') else 'N/A'}\n")

print("Detailed Classification Report:")
print(classification_report(y_test, pred, target_names=label_encoder.classes_))

print("\nConfusion Matrix:")
cm = confusion_matrix(y_test, pred)
print(cm)
print()

# ----------------------------------------------------
# 8. CROSS-VALIDATION
# ----------------------------------------------------
print("[5] Performing 5-Fold Cross-Validation...")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Custom cross-validation that handles early stopping
cv_scores = []
for fold, (train_idx, val_idx) in enumerate(cv.split(X_train_balanced, y_train_balanced), 1):
    # Handle both DataFrame and numpy array from SMOTE
    if isinstance(X_train_balanced, pd.DataFrame):
        X_train_cv = X_train_balanced.iloc[train_idx]
        X_val_cv = X_train_balanced.iloc[val_idx]
    else:
        X_train_cv = X_train_balanced[train_idx]
        X_val_cv = X_train_balanced[val_idx]
    
    y_train_cv = y_train_balanced[train_idx]
    y_val_cv = y_train_balanced[val_idx]
    
    # Create a new model for this fold (without early stopping for simplicity)
    model_cv = XGBClassifier(
        n_estimators=500,  # Fixed number for CV
        max_depth=6,
        learning_rate=0.03,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.5,
        eval_metric="mlogloss",
        random_state=42,
        use_label_encoder=False
    )
    
    model_cv.fit(X_train_cv, y_train_cv)
    score = accuracy_score(y_val_cv, model_cv.predict(X_val_cv))
    cv_scores.append(score)
    print(f"  Fold {fold}: {score*100:.2f}%")

cv_scores = np.array(cv_scores)
print(f"\nCross-Validation Accuracy: {cv_scores.mean()*100:.2f}% (+/- {cv_scores.std()*100:.2f}%)")
print(f"Individual Fold Scores: {[f'{s*100:.2f}%' for s in cv_scores]}")

# ----------------------------------------------------
# 9. SAVE MODEL
# ----------------------------------------------------
print("\n[6] Saving model and label encoder...")
os.makedirs("model", exist_ok=True)

joblib.dump(model, "model/medi_guard_merged_model.pkl")
joblib.dump(label_encoder, "model/label_encoder.pkl")

print("\n" + "="*80)
print("           MODEL SAVED SUCCESSFULLY!")
print("="*80 + "\n")

