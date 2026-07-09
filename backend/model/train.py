import kagglehub
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

print("Loading dataset...")
path = kagglehub.dataset_download('marvyaymanhalim/student-performance-and-attendance-dataset')

perf = pd.read_csv(f'{path}/performance.csv')
hw = pd.read_csv(f'{path}/homework.csv')
att = pd.read_csv(f'{path}/attendance.csv')

# --- Target: Lulus (Exam_Score >= 60) or Remedial ---
perf['target'] = np.where(perf['Exam_Score'] >= 60, 1, 0)
print(f"Target balance: {(perf['target']==1).mean()*100:.1f}% Lulus, {(perf['target']==0).mean()*100:.1f}% Remedial")

# --- Feature 1 & 2: Nilai Tugas 1 & Tugas 2 dari homework ---
grade_map = {'A+': 4.3, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
             'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0}
hw['grade_num'] = hw['Grade_Feedback'].map(grade_map)

# Parse Due_Date (format campuran MM/DD/YYYY dan YYYY-MM-DD)
hw['Due_Date_parsed'] = pd.to_datetime(hw['Due_Date'], errors='coerce')

# Ambil 2 tugas pertama per student-subject (berdasarkan urutan tanggal)
hw_sorted = hw.sort_values(['Student_ID', 'Subject', 'Due_Date_parsed'])
hw_task = hw_sorted.groupby(['Student_ID', 'Subject']).head(2).reset_index()
hw_task['task_order'] = hw_task.groupby(['Student_ID', 'Subject']).cumcount() + 1

hw_pivot = hw_task.pivot(
    index=['Student_ID', 'Subject'],
    columns='task_order',
    values='grade_num'
).reset_index()
hw_pivot.columns = ['Student_ID', 'Subject', 'nilai_tugas_1', 'nilai_tugas_2']

print(f"Student-subject with homework records: {len(hw_pivot)}")
print(f"Missing tugas_1: {hw_pivot['nilai_tugas_1'].isna().sum()}, Missing tugas_2: {hw_pivot['nilai_tugas_2'].isna().sum()}")

# --- Feature 3: Homework_Completion_% (dari performance.csv) ---
# Bersihin: strip %, convert numeric, clip 0-100
perf['hw_completion'] = (
    perf['Homework_Completion_%']
    .str.rstrip('%')
    .astype(float)
    .clip(0, 100)
)
print(f"Homework_Completion_% stats after clean:\n{perf['hw_completion'].describe()}")

# --- Feature 4: Persentase Kehadiran (5 minggu pertama) ---
att['status_clean'] = att['Attendance_Status'].str.strip().str.lower()
att['present'] = ~att['status_clean'].isin(['absent', 'absnt', 'left early'])

att['Date'] = pd.to_datetime(att['Date'])
att_week5 = att[att['Date'] <= att.groupby(['Student_ID', 'Subject'])['Date'].transform('min') + pd.Timedelta(days=34)]

att_pct = att_week5.groupby(['Student_ID', 'Subject'])['present'].mean().reset_index()
att_pct.columns = ['Student_ID', 'Subject', 'kehadiran_persen']

# --- Merge ---
data = perf.merge(hw_pivot, on=['Student_ID', 'Subject'], how='left')
data = data.merge(att_pct, on=['Student_ID', 'Subject'], how='left')

# Filter: cuma student yang punya minimal 1 nilai tugas
data = data.dropna(subset=['nilai_tugas_1'])

# Imputasi nilai_tugas_2 — isi dengan nilai_tugas_1 kalo ga ada (asumsi progres konsisten)
data['nilai_tugas_2'] = data['nilai_tugas_2'].fillna(data['nilai_tugas_1'])
data['kehadiran_persen'] = data['kehadiran_persen'].fillna(data['kehadiran_persen'].median())

print(f"\nFinal training data: {len(data)} rows")
print(f"Missing after imputation:\n{data[['nilai_tugas_1','nilai_tugas_2','hw_completion','kehadiran_persen']].isna().sum()}")

# --- Train ---
features = ['nilai_tugas_1', 'nilai_tugas_2', 'hw_completion', 'kehadiran_persen']
X = data[features].values
y = data['target'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(n_estimators=150, random_state=42, class_weight='balanced', max_depth=10, min_samples_leaf=10)
model.fit(X_train_scaled, y_train)

y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)

print(f"\nAccuracy: {acc:.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Remedial', 'Lulus']))

# Feature importance
feat_imp = sorted(zip(features, model.feature_importances_), key=lambda x: x[1], reverse=True)
print("\nFeature Importance:")
for name, imp in feat_imp:
    print(f"  {name}: {imp:.4f}")

# --- Export ---
os.makedirs(os.path.dirname(__file__), exist_ok=True)
with open(f'{os.path.dirname(__file__)}/model.pkl', 'wb') as f:
    pickle.dump(model, f)
with open(f'{os.path.dirname(__file__)}/scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
with open(f'{os.path.dirname(__file__)}/features.pkl', 'wb') as f:
    pickle.dump(features, f)

print("\nModel saved to model/model.pkl, scaler.pkl, features.pkl")
