"""
Alternative training script using class weights instead of SMOTE.
Sometimes class weights work better than oversampling.
"""
import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from xgboost import XGBClassifier
import joblib
import warnings
from collections import Counter

warnings.filterwarnings("ignore")

print("="*80)
print("      MEDI-GUARD MODEL TRAINING (WITH CLASS WEIGHTS)      ")
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
print("\nClass Distribution:")
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
# 3. TRAIN-TEST SPLIT
# ----------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# ----------------------------------------------------
# 4. CALCULATE CLASS WEIGHTS
# ----------------------------------------------------
print("[2] Calculating class weights for imbalanced data...")
class_counts_dict = Counter(y_train)
total = sum(class_counts_dict.values())
n_classes = len(class_counts_dict)

# Method 1: Inverse frequency weighting
class_weights = {cls: total / (n_classes * count) for cls, count in class_counts_dict.items()}

# Method 2: Balanced weights (sklearn style)
from sklearn.utils.class_weight import compute_class_weight
sklearn_weights = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
sklearn_weight_dict = {cls: weight for cls, weight in zip(np.unique(y_train), sklearn_weights)}

print("\nClass Weights (Inverse Frequency):")
for cls, weight in sorted(class_weights.items()):
    print(f"  Class {cls} ({label_encoder.classes_[cls]:15s}): {weight:.3f}")

print("\nClass Weights (Sklearn Balanced):")
for cls, weight in sorted(sklearn_weight_dict.items()):
    print(f"  Class {cls} ({label_encoder.classes_[cls]:15s}): {weight:.3f}")

# Use sklearn balanced weights
sample_weights = np.array([sklearn_weight_dict[y] for y in y_train])

# ----------------------------------------------------
# 5. TRAIN XGBOOST WITH CLASS WEIGHTS
# ----------------------------------------------------
print("\n[3] Training XGBoost model with class weights...")

model = XGBClassifier(
    n_estimators=2000,
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
    early_stopping_rounds=100,
    use_label_encoder=False
)

# Fit with sample weights
model.fit(
    X_train, y_train,
    sample_weight=sample_weights,
    eval_set=[(X_test, y_test)],
    verbose=100
)

# ----------------------------------------------------
# 6. EVALUATION
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
# 7. CROSS-VALIDATION
# ----------------------------------------------------
print("[4] Performing 5-Fold Cross-Validation...")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

def fit_with_weights(X, y, train_idx, val_idx):
    X_train_cv, X_val_cv = X.iloc[train_idx], X.iloc[val_idx]
    y_train_cv, y_val_cv = y[train_idx], y[val_idx]
    
    cv_weights = np.array([sklearn_weight_dict[y] for y in y_train_cv])
    
    model_cv = XGBClassifier(
        n_estimators=500,
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
    
    model_cv.fit(X_train_cv, y_train_cv, sample_weight=cv_weights)
    return accuracy_score(y_val_cv, model_cv.predict(X_val_cv))

cv_scores = []
for train_idx, val_idx in cv.split(X_train, y_train):
    score = fit_with_weights(X_train, y_train, train_idx, val_idx)
    cv_scores.append(score)

cv_scores = np.array(cv_scores)
print(f"Cross-Validation Accuracy: {cv_scores.mean()*100:.2f}% (+/- {cv_scores.std()*100:.2f}%)")
print(f"Individual Fold Scores: {[f'{s*100:.2f}%' for s in cv_scores]}")

# ----------------------------------------------------
# 8. SAVE MODEL
# ----------------------------------------------------
print("\n[5] Saving model and label encoder...")
os.makedirs("model", exist_ok=True)

joblib.dump(model, "model/medi_guard_merged_model.pkl")
joblib.dump(label_encoder, "model/label_encoder.pkl")

print("\n" + "="*80)
print("           MODEL SAVED SUCCESSFULLY!")
print("="*80 + "\n")

