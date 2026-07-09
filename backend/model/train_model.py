import pandas as pd
import os
import pickle
from dotenv import load_dotenv
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, accuracy_score

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
    X = df[features]
    y = df['Status']
    
    print(f"Dataset size: {df.shape}")
    print("Features:", features)
    print("Class Distribution:\n", y.value_counts())
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("\nTraining Decision Tree Classifier...")
    model = DecisionTreeClassifier(random_state=42)
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save Model
    model_dir = os.path.join(base_dir, 'model')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'early_warning_model.pkl')
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"Model berhasil disimpan ke: {model_path}")

if __name__ == "__main__":
    main()
