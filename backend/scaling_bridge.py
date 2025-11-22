def scale_value(value, min_val, max_val):
    try:
        return (value - min_val) / (max_val - min_val)
    except ZeroDivisionError:
        return 0.0

def scale_input(raw_data, scaler):
    scaled = {}
    for key, value in raw_data.items():
        min_v = scaler["min"][key]
        max_v = scaler["max"][key]
        scaled[key] = scale_value(value, min_v, max_v)
    return scaled
