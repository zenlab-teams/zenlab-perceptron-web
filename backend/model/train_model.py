import pandas as pd
import os
import pickle
import json
from dotenv import load_dotenv
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Perceptron
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    mean_absolute_error,
    mean_squared_error,
)

# Load env variables from root folder
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(base_dir, '.env'))

def main():
    dataset_path = os.path.join(base_dir, 'dataset', 'clean_dataset_final.xlsx')
    
    print(f"Loading dataset from: {dataset_path}")
    if not os.path.exists(dataset_path):
        print("Dataset tidak ditemukan. Jalankan dataset_builder.py terlebih dahulu.")
        return
    
    # Read env config
    bobot_ujian = float(os.getenv('BOBOT_UJIAN', 60)) / 100.0
    bobot_tugas = float(os.getenv('BOBOT_TUGAS', 40)) / 100.0
    threshold_hadir = float(os.getenv('THRESHOLD_HADIR', 50))
    threshold_nilai = float(os.getenv('THRESHOLD_NILAI', 75))
    
    print("\n=== Configuration from .env ===")
    print(f"Bobot Ujian: {bobot_ujian * 100}%")
    print(f"Bobot Tugas: {bobot_tugas * 100}%")
    print(f"Threshold Kehadiran: {threshold_hadir}%")
    print(f"Threshold Nilai Akhir: {threshold_nilai}")
    print("================================\n")
        
    df = pd.read_excel(dataset_path)
    
    # Features & Target
    features = ['hadir_persen', 'rata_tugas', 'rata_ujian']
    X = df[features].to_numpy()
    y = df['Status']
    
    print(f"Dataset size: {df.shape}")
    print("Features:", features)
    print("Class Distribution:\n", y.value_counts())
    
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )
    
    print("\nTraining Perceptron Classifier...")
    model = Pipeline([
        ('scaler', StandardScaler()),
        ('perceptron', Perceptron(
            max_iter=1000,
            tol=1e-3,
            random_state=42,
            class_weight='balanced'
        ))
    ])
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = mse ** 0.5
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred, labels=[0, 1]).ravel()
    report = classification_report(
        y_test,
        y_pred,
        labels=[0, 1],
        target_names=['Tidak Lulus', 'Lulus'],
        output_dict=True,
        zero_division=0
    )
    epoch_training = int(model.named_steps['perceptron'].n_iter_)

    print(f"Accuracy: {acc:.4f}\n")
    print(f"Epoch Training: {epoch_training}\n")
    print("Classification Report:")
    print(classification_report(
        y_test,
        y_pred,
        labels=[0, 1],
        target_names=['Tidak Lulus', 'Lulus'],
        zero_division=0
    ))
    
    # Save Model
    model_dir = os.path.join(base_dir, 'model')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'early_warning_model.pkl')
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)

    metrics = {
        "accuracy": round(float(acc), 4),
        "error_rate": round(float(1 - acc), 4),
        "mae": round(float(mae), 4),
        "mse": round(float(mse), 4),
        "rmse": round(float(rmse), 4),
        "total_data": int(len(df)),
        "train_data": int(len(y_train)),
        "test_data": int(len(y_test)),
        "epoch_training": epoch_training,
        "dataset_distribution": {
            "train": int(len(y_train)),
            "test": int(len(y_test))
        },
        "class_scores": {
            "Tidak Lulus": {
                "precision": round(float(report["Tidak Lulus"]["precision"]), 4),
                "recall": round(float(report["Tidak Lulus"]["recall"]), 4),
                "f1_score": round(float(report["Tidak Lulus"]["f1-score"]), 4)
            },
            "Lulus": {
                "precision": round(float(report["Lulus"]["precision"]), 4),
                "recall": round(float(report["Lulus"]["recall"]), 4),
                "f1_score": round(float(report["Lulus"]["f1-score"]), 4)
            }
        },
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp)
        }
    }

    metrics_path = os.path.join(model_dir, 'metrics.json')
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Model berhasil disimpan ke: {model_path}")
    print(f"Metrik berhasil disimpan ke: {metrics_path}")

if __name__ == "__main__":
    main()
