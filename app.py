from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np
import os

app = Flask(__name__)

model_path = os.path.join(os.path.dirname(__file__), 'model', 'model.pkl')
scaler_path = os.path.join(os.path.dirname(__file__), 'model', 'scaler.pkl')
features_path = os.path.join(os.path.dirname(__file__), 'model', 'features.pkl')

with open(model_path, 'rb') as f:
    model = pickle.load(f)
with open(scaler_path, 'rb') as f:
    scaler = pickle.load(f)
with open(features_path, 'rb') as f:
    features = pickle.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        nilai1 = float(request.form['nilai_tugas_1'])
        nilai2 = float(request.form['nilai_tugas_2'])
        hw_pct = float(request.form['hw_completion'])
        kehadiran = float(request.form['kehadiran'])

        if not (0 <= nilai1 <= 4.3 and 0 <= nilai2 <= 4.3):
            return render_template('index.html', error='Nilai tugas harus antara 0 - 4.3')
        if not (0 <= hw_pct <= 100):
            return render_template('index.html', error='Persentase tugas harus antara 0 - 100')
        if not (0 <= kehadiran <= 100):
            return render_template('index.html', error='Kehadiran harus antara 0 - 100')

        # Map feature names -> values in correct order
        feature_map = {
            'nilai_tugas_1': nilai1,
            'nilai_tugas_2': nilai2,
            'hw_completion': hw_pct,
            'kehadiran_persen': kehadiran / 100,
        }
        input_arr = np.array([[feature_map[f] for f in features]])
        scaled = scaler.transform(input_arr)
        prob = model.predict_proba(scaled)[0]
        pred = model.predict(scaled)[0]

        return render_template('result.html',
            nilai_tugas_1=f"{nilai1:.2f}",
            nilai_tugas_2=f"{nilai2:.2f}",
            hw_completion=f"{hw_pct:.0f}",
            kehadiran=kehadiran,
            hasil='Lulus' if pred == 1 else 'Remedial',
            prob_lulus=f"{prob[1]*100:.1f}",
            prob_remedial=f"{prob[0]*100:.1f}"
        )
    except Exception as e:
        return render_template('index.html', error=f'Error: {str(e)}')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
