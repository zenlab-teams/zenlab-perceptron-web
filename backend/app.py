import pickle
import json
import numpy as np
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Define base directory to locate model
base_dir = os.path.dirname(os.path.abspath(__file__))

# Load env variables
load_dotenv(dotenv_path=os.path.join(base_dir, '.env'), override=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get('/api/config')
def get_config():
    # Return env settings so frontend can dynamically adapt
    return {
        "bobot_ujian": float(os.getenv('BOBOT_UJIAN', 60)),
        "bobot_tugas": float(os.getenv('BOBOT_TUGAS', 40)),
        "threshold_hadir": float(os.getenv('THRESHOLD_HADIR', 50)),
        "threshold_nilai": float(os.getenv('THRESHOLD_NILAI', 75))
    }

@app.get('/api/metrics')
def get_metrics():
    if not os.path.exists(metrics_path):
        return JSONResponse({
            "error": "Metrik belum tersedia. Jalankan python model/train_model.py terlebih dahulu."
        }, status_code=404)

    with open(metrics_path, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.post('/api/predict')
async def predict(request: Request):
    if model is None:
        return JSONResponse({"error": "Model not loaded on server."}, status_code=500)

    try:
        data = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON payload"}, status_code=400)

    if not data:
        return JSONResponse({"error": "Invalid JSON payload"}, status_code=400)

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
        
        return {
            "status": int(prediction),
            "rata_tugas": round(rata_tugas, 1),
            "rata_ujian": round(rata_ujian, 1),
            "kehadiran": float(kehadiran),
            "nilai_akhir": round(nilai_akhir, 1)
        }

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

if __name__ == '__main__':
    import uvicorn

    host = os.getenv('APP_HOST', '127.0.0.1')
    port = int(os.getenv('PORT') or os.getenv('APP_PORT') or 8000)
    uvicorn.run('app:app', host=host, port=port)
