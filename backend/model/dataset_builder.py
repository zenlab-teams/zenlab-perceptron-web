import argparse
import pandas as pd
import numpy as np
import os
import sys
from dotenv import load_dotenv

# Load env variables from root folder
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(base_dir, '.env'))

def parse_args():
    parser = argparse.ArgumentParser(description="Build and aggregate student dataset.")
    parser.add_argument('--bobot-ujian', type=float, default=float(os.getenv('BOBOT_UJIAN', 60)), help='Bobot persentase nilai ujian')
    parser.add_argument('--bobot-tugas', type=float, default=float(os.getenv('BOBOT_TUGAS', 40)), help='Bobot persentase nilai tugas')
    parser.add_argument('--threshold-hadir', type=float, default=float(os.getenv('THRESHOLD_HADIR', 50)), help='Batas minimal kehadiran %')
    parser.add_argument('--threshold-nilai', type=float, default=float(os.getenv('THRESHOLD_NILAI', 75)), help='Batas minimal nilai akhir')
    return parser.parse_args()

def main():
    args = parse_args()
    print("=== Configuration ===")
    print(f"Bobot Ujian: {args.bobot_ujian}%")
    print(f"Bobot Tugas: {args.bobot_tugas}%")
    print(f"Threshold Hadir: {args.threshold_hadir}%")
    print(f"Threshold Nilai Akhir: {args.threshold_nilai}")
    print("=====================\n")

    dataset_dir = os.path.join(base_dir, 'dataset')
    raw_dir = os.path.join(dataset_dir, 'raw')
    
    att_path = os.path.join(raw_dir, 'attendance.csv')
    hw_path = os.path.join(raw_dir, 'homework.csv')
    perf_path = os.path.join(raw_dir, 'performance.csv')
    stu_path = os.path.join(raw_dir, 'students.csv')
    
    print("Loading CSV files...")
    df_att = pd.read_csv(att_path)
    df_hw = pd.read_csv(hw_path)
    df_perf = pd.read_csv(perf_path)
    df_stu = pd.read_csv(stu_path)
    
    print("\nExporting individual CSVs to XLSX (this might take a minute)...")
    print("- students.xlsx...")
    df_stu.to_excel(os.path.join(dataset_dir, 'students.xlsx'), index=False)
    print("- homework.xlsx...")
    df_hw.to_excel(os.path.join(dataset_dir, 'homework.xlsx'), index=False)
    print("- performance.xlsx...")
    df_perf.to_excel(os.path.join(dataset_dir, 'performance.xlsx'), index=False)
    print("- attendance.xlsx (364k rows, processing)...")
    df_att.to_excel(os.path.join(dataset_dir, 'attendance.xlsx'), index=False)

    print("\nAggregating Attendance...")
    df_att['status_clean'] = df_att['Attendance_Status'].str.strip().str.lower()
    df_att['hadir'] = (~df_att['status_clean'].isin(['absent', 'absnt', 'left early', 'excused'])).astype(int) 
    att_agg = df_att.groupby('Student_ID').agg(
        hadir_persen=('hadir', 'mean')
    ).reset_index()
    att_agg['hadir_persen'] = (att_agg['hadir_persen'] * 100).round(1)

    print("Aggregating Homework...")
    grade_map = {'A+': 100, 'A': 95, 'A-': 90, 'B+': 88, 'B': 85, 'B-': 80,
                 'C+': 78, 'C': 75, 'C-': 70, 'D': 65, 'F': 50}
    df_hw['grade_num'] = df_hw['Grade_Feedback'].map(grade_map)
    df_hw['submitted'] = ~df_hw['Status'].str.strip().str.lower().isin(['not done', 'pending', '❌'])
    
    hw_agg = df_hw.groupby('Student_ID').agg(
        rata_tugas=('grade_num', 'mean'),
        tugas_selesai_pct=('submitted', 'mean')
    ).reset_index()
    hw_agg['tugas_selesai_pct'] = (hw_agg['tugas_selesai_pct'] * 100).round(1)

    print("Aggregating Exam Performance...")
    df_perf['Exam_Score'] = pd.to_numeric(df_perf['Exam_Score'], errors='coerce')
    df_perf['Exam_Score'] = df_perf['Exam_Score'].clip(0, 100)
    
    perf_agg = df_perf.groupby('Student_ID').agg(
        rata_ujian=('Exam_Score', 'mean')
    ).reset_index()

    print("Merging data...")
    data = df_stu[['Student_ID', 'Grade_Level']].copy()
    data = data.merge(att_agg, on='Student_ID', how='left')
    data = data.merge(hw_agg, on='Student_ID', how='left')
    data = data.merge(perf_agg, on='Student_ID', how='left')
    
    data['hadir_persen'] = data['hadir_persen'].fillna(0)
    data['rata_tugas'] = data['rata_tugas'].fillna(0).round(1)
    data['rata_ujian'] = data['rata_ujian'].fillna(0).round(1)
    data['tugas_selesai_pct'] = data['tugas_selesai_pct'].fillna(0)

    print("Calculating final score & labeling...")
    b_ujian = args.bobot_ujian / 100.0
    b_tugas = args.bobot_tugas / 100.0
    
    data['nilai_akhir'] = (data['rata_ujian'] * b_ujian + data['rata_tugas'] * b_tugas).round(1)
    
    cond_hadir = data['hadir_persen'] >= args.threshold_hadir
    cond_nilai = data['nilai_akhir'] >= args.threshold_nilai
    data['Status'] = (cond_hadir & cond_nilai).astype(int)

    output_path = os.path.join(dataset_dir, 'clean_dataset_final.xlsx')
    print(f"\nExporting final merged dataset to {output_path}...")
    data.to_excel(output_path, index=False)
    
    print("\n[Done!] Class distribution (1 = Lulus, 0 = Remedial):")
    print(data['Status'].value_counts())

if __name__ == "__main__":
    main()
