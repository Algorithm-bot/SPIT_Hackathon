import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.utils.class_weight import compute_class_weight
import joblib
import json

# Load dataset
df = pd.read_csv("data/train.csv")

# Separate features & target
X = df.drop("Disease", axis=1)
y = df["Disease"]

# Save Min/Max only if needed for API scaling (but dataset already normalized)
TRAIN_MIN = X.min().to_dict()
TRAIN_MAX = X.max().to_dict()
json.dump({"min": TRAIN_MIN, "max": TRAIN_MAX}, open("model/scaler.json", "w"))

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Compute class weights to handle class imbalance
classes = y.unique()
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=classes,
    y=y
)
weight_dict = {cls: weight for cls, weight in zip(classes, class_weights)}

# Hyperparameter tuning for Random Forest
param_grid = {
    "n_estimators": [150, 250, 350],
    "max_depth": [10, 20, 30, None],
    "min_samples_split": [2, 5],
    "min_samples_leaf": [1, 2],
}

rf = RandomForestClassifier(class_weight=weight_dict, random_state=42)

grid_search = GridSearchCV(
    estimator=rf,
    param_grid=param_grid,
    cv=3,
    scoring="accuracy",
    n_jobs=-1,
    verbose=1
)

grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_

print("Best Parameters:", grid_search.best_params_)

# Evaluate
y_pred = best_model.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Save the trained model
joblib.dump(best_model, "model/medi_guard_model.pkl")

print("Training complete.")
