from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import json
import numpy as np
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Define base directory to locate model
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'model', 'early_warning_model.pkl')
metrics_path = os.path.join(base_dir, 'model', 'metrics.json')

# Load the model
try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Warning: Model not found at {model_path}. Please run train_model.py first.")
    model = None

@app.route('/api/config', methods=['GET'])
def get_config():
    # Return env settings so frontend can dynamically adapt
    return jsonify({
        "bobot_ujian": float(os.getenv('BOBOT_UJIAN', 60)),
        "bobot_tugas": float(os.getenv('BOBOT_TUGAS', 40)),
        "threshold_hadir": float(os.getenv('THRESHOLD_HADIR', 50)),
        "threshold_nilai": float(os.getenv('THRESHOLD_NILAI', 75))
    })

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    if not os.path.exists(metrics_path):
        return jsonify({
            "error": "Metrik belum tersedia. Jalankan python model/train_model.py terlebih dahulu."
        }), 404

    with open(metrics_path, 'r', encoding='utf-8') as f:
        return jsonify(json.load(f))

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded on server."}), 500
        
    data = request.json
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400
        
    try:
        kehadiran = float(data.get('kehadiran', 0))
        tugas_list = data.get('tugas', [])
        ujian_list = data.get('ujian', [])
        
        # Convert lists to float
        tugas_list = [float(x) for x in tugas_list if str(x).strip()]
        ujian_list = [float(x) for x in ujian_list if str(x).strip()]
        
        # Calculate averages
        rata_tugas = sum(tugas_list) / len(tugas_list) if tugas_list else 0
        rata_ujian = sum(ujian_list) / len(ujian_list) if ujian_list else 0
        
        # The features used in training were ['hadir_persen', 'rata_tugas', 'rata_ujian']
        features = np.array([[kehadiran, rata_tugas, rata_ujian]])
        
        # Predict
        prediction = model.predict(features)[0]
        
        # Calculate weighted final score using env variables
        b_ujian = float(os.getenv('BOBOT_UJIAN', 60)) / 100.0
        b_tugas = float(os.getenv('BOBOT_TUGAS', 40)) / 100.0
        nilai_akhir = b_ujian * rata_ujian + b_tugas * rata_tugas
        
        return jsonify({
            "status": int(prediction),
            "rata_tugas": round(rata_tugas, 1),
            "rata_ujian": round(rata_ujian, 1),
            "kehadiran": float(kehadiran),
            "nilai_akhir": round(nilai_akhir, 1)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
