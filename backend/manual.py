import joblib
import pandas as pd

print("====================================================")
print("        MEDI-GUARD MANUAL DISEASE PREDICTOR         ")
print("====================================================\n")

# ----------------------------------------------------
# 1. Load Model + Label Encoder
# ----------------------------------------------------
model = joblib.load("model/medi_guard_merged_model.pkl")
label_encoder = joblib.load("model/label_encoder.pkl")

# Extract exact feature names from model
FEATURES = model.get_booster().feature_names

print("Model Feature Names Loaded:\n")
for f in FEATURES:
    print(" -", f)
print("\n")

# ----------------------------------------------------
# 2. Accept User Inputs
# ----------------------------------------------------
values = []
print("Enter values between 0 and 1 for each medical feature:\n")

for feature in FEATURES:
    while True:
        try:
            value = float(input(f"Enter {feature}: "))
            if 0 <= value <= 1:
                values.append(value)
                break
            else:
                print("❗ Value must be between 0 and 1. Try again.")
        except ValueError:
            print("❗ Invalid input. Enter a numeric value.")

# ----------------------------------------------------
# 3. Convert Input to DataFrame
# ----------------------------------------------------
input_df = pd.DataFrame([values], columns=FEATURES)

# ----------------------------------------------------
# 4. Predict
# ----------------------------------------------------
encoded_pred = model.predict(input_df)[0]
predicted_label = label_encoder.inverse_transform([encoded_pred])[0]

print("\n====================================================")
print(f" 🩺 Predicted Disease: **{predicted_label}**")
print("====================================================\n")
