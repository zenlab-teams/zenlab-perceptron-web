import pandas as pd
import numpy as np
import os

dataset_dir = os.path.join(os.path.dirname(__file__), 'dataset')
output_path = os.path.join(dataset_dir, 'clean_dataset.xlsx')

print("Loading CSV files...")
att = pd.read_csv(os.path.join(dataset_dir, 'attendance.csv'))
hw = pd.read_csv(os.path.join(dataset_dir, 'homework.csv'))
stu = pd.read_csv(os.path.join(dataset_dir, 'students.csv'))

print(f"attendance.csv: {att.shape}")
print(f"homework.csv: {hw.shape}")
print(f"students.csv: {stu.shape}")

# --- Bersihin Attendance ---
att['status_clean'] = att['Attendance_Status'].str.strip().str.lower()
att['hadir'] = (~att['status_clean'].isin(['absent', 'absnt', 'left early'])).astype(int)
att['terlambat'] = att['status_clean'].isin(['late', 'late']).astype(int)

# Agregat attendance per student
att_agg = att.groupby('Student_ID').agg(
    total_hari_att=('hadir', 'count'),
    hadir_persen=('hadir', 'mean'),
    terlambat_persen=('terlambat', 'mean')
).reset_index()
att_agg['hadir_persen'] = (att_agg['hadir_persen'] * 100).round(1)
att_agg['terlambat_persen'] = (att_agg['terlambat_persen'] * 100).round(1)

print(f"Attendance aggregated: {len(att_agg)} students")

# --- Bersihin Homework ---
grade_map = {'A+': 4.3, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
             'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0}
hw['grade_num'] = hw['Grade_Feedback'].map(grade_map)
hw['submitted'] = ~hw['Status'].str.strip().str.lower().isin(['not done', 'pending', '❌'])

# Ambil 2 tugas pertama per student (by date)
hw['Due_Date_parsed'] = pd.to_datetime(hw['Due_Date'], errors='coerce')
hw_sorted = hw.sort_values(['Student_ID', 'Due_Date_parsed'])
hw_top2 = hw_sorted.groupby('Student_ID').head(2).reset_index()
hw_top2['task_n'] = hw_top2.groupby('Student_ID').cumcount() + 1

# Pivot
hw_pivot = hw_top2.pivot(index='Student_ID', columns='task_n', values='grade_num').reset_index()
hw_pivot.columns = ['Student_ID', 'nilai_tugas_1', 'nilai_tugas_2']

# Agregat homework
hw_agg = hw.groupby('Student_ID').agg(
    total_tugas=('grade_num', 'count'),
    rata_tugas=('grade_num', 'mean'),
    tugas_selesai_pct=('submitted', 'mean')
).reset_index()
hw_agg['tugas_selesai_pct'] = (hw_agg['tugas_selesai_pct'] * 100).round(1)

print(f"Homework aggregated: {len(hw_agg)} students")

# --- Students ---
stu_clean = stu[['Student_ID', 'Grade_Level']].copy()

# --- Merge ---
data = stu_clean.merge(hw_agg, on='Student_ID', how='left')
data = data.merge(hw_pivot, on='Student_ID', how='left')
data = data.merge(att_agg, on='Student_ID', how='left')

# Imputasi
data['rata_tugas'] = data['rata_tugas'].fillna(data['rata_tugas'].median())
data['nilai_tugas_1'] = data['nilai_tugas_1'].fillna(data['rata_tugas'])
data['nilai_tugas_2'] = data['nilai_tugas_2'].fillna(data['nilai_tugas_1'])
data['hadir_persen'] = data['hadir_persen'].fillna(data['hadir_persen'].median())
data['terlambat_persen'] = data['terlambat_persen'].fillna(0)

print(f"\nFinal merged: {len(data)} rows, {len(data.columns)} columns")
print(f"Columns: {list(data.columns)}")
print(f"\nMissing values:\n{data.isna().sum()}")

# --- Export ke Excel ---
with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    data.to_excel(writer, sheet_name='main', index=False)
    # Metadata sheet
    info = pd.DataFrame({
        'info': [
            f'Rows: {len(data)}',
            f'Columns: {len(data.columns)}',
            f'Students: {data["Student_ID"].nunique()}',
            f'Generated: {pd.Timestamp.now()}',
        ]
    })
    info.to_excel(writer, sheet_name='metadata', index=False)

print(f"\nExported to: {output_path}")
print("Done!")
