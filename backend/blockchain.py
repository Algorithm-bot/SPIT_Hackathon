import hashlib, time, json, os

CHAIN_FILE = "chain.json"

def add_block(patient_id, prediction):
    timestamp = time.time()
    data = f"{patient_id}-{prediction}-{timestamp}"
    hash_val = hashlib.sha256(data.encode()).hexdigest()

    block = {
        "patient_id": patient_id,
        "prediction": prediction,
        "timestamp": timestamp,
        "hash": hash_val
    }

    # Append to local chain file
    if os.path.exists(CHAIN_FILE):
        chain = json.load(open(CHAIN_FILE))
    else:
        chain = []
    chain.append(block)

    json.dump(chain, open(CHAIN_FILE, "w"), indent=4)
    return block
