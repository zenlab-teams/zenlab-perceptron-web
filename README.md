# Zenlab Early Warning System

Sistem cerdas pendeteksi dini potensi kelulusan mahasiswa berdasarkan metrik akademik (Nilai Tugas & Ujian) dan kedisiplinan (Kehadiran). Sistem ini dirancang untuk membantu dosen atau wali akademik memberikan intervensi dini bagi mahasiswa yang berisiko tidak lulus (Remedial).

## Struktur Proyek

Proyek ini telah dipisahkan ke dalam dua direktori utama:
- `backend/` : Berisi sistem *Machine Learning*, pembuatan dataset, dan *server API* FastAPI.
- `frontend/` : Berisi antarmuka web modern menggunakan React, Vite, dan Tailwind CSS.

## Fitur Utama

- **Machine Learning**: Menggunakan algoritma `Perceptron Classifier` (linear classifier) yang mempelajari pola dari 12.000+ data historis.
- **Konfigurasi Terpusat**: Seluruh kriteria kelulusan (bobot nilai dan batas minimal) dapat diatur dengan mudah melalui satu file `.env` di dalam folder `backend/`.
- **Backend API**: Dibangun menggunakan FastAPI yang siap menyajikan prediksi secara real-time.
- **Frontend Modern**: Menggunakan React (Vite), Recharts, + Tailwind CSS v4 untuk menghasilkan antarmuka pengguna yang sangat responsif, elegan, interaktif, dan profesional (hanya mode terang).
- **Data Pipeline CLI**: Script otomatis untuk menggabungkan, mengagregasi, dan memberi label pada *raw dataset* sebelum dilatih ke dalam model.

---

## Teknologi yang Digunakan

* **Backend**: Python 3, FastAPI, Uvicorn, scikit-learn, pandas, numpy, python-dotenv
* **Frontend**: React (Vite), Tailwind CSS, Recharts, Axios, Lucide React

---

## Persiapan & Instalasi

Pastikan komputer Anda sudah terinstal **Python 3.x** dan **Node.js (NPM)**.

### 1. Instalasi Backend (Python)
Buka terminal dan masuk ke folder `backend/`, lalu install semua *dependency* yang dibutuhkan:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Instalasi Frontend (React)
Buka terminal lain, masuk ke folder `frontend/`, dan install *package* Node:
```bash
cd frontend
npm install
```

---

## Konfigurasi Kriteria Kelulusan

Sistem ini bersifat dinamis. Anda bisa mengatur kriteria aman seorang mahasiswa melalui file `.env` di dalam direktori `backend/`:

```env
# File: backend/.env
BOBOT_UJIAN=60          # Bobot nilai ujian (dalam persen)
BOBOT_TUGAS=40          # Bobot nilai tugas (dalam persen)
THRESHOLD_HADIR=50      # Batas minimal kehadiran (dalam persen)
THRESHOLD_NILAI=75      # Batas minimal akumulasi nilai akhir
PORT=8000               # Port server backend untuk Uvicorn
```

*Setiap kali Anda merubah nilai pada `.env`, Anda harus melatih ulang model (lihat langkah "Membangun & Melatih Model" di bawah) dan me-restart server backend.*

---

## Membangun & Melatih Model

Jika Anda memiliki data baru (di dalam folder `backend/dataset/`) atau baru saja mengubah kriteria kelulusan di `backend/.env`, Anda **wajib** membuat ulang dataset dan melatih ulang model.

**1. Ekstrak & Agregasi Dataset**
```bash
cd backend
python model/dataset_builder.py
```
*Proses ini akan membaca konfigurasi dari `.env`, menggabungkan seluruh CSV mentah, dan memproduksi `clean_dataset_final.xlsx`.*

**2. Melatih Model ML**
```bash
cd backend
python model/train_model.py
```
*Proses ini akan melatih algoritma Perceptron berdasarkan dataset yang sudah bersih, lalu menghasilkan file `model/early_warning_model.pkl`.*

---

## Cara Menjalankan Aplikasi

Anda harus menjalankan Backend dan Frontend secara bersamaan.

### Menjalankan Backend API
Buka terminal, pastikan berada di folder `backend/`, lalu jalankan:
```bash
cd backend
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```
*(Server akan berjalan di http://127.0.0.1:8000)*

Untuk VPS, jalankan:
```bash
cd backend
uvicorn app:app --host 0.0.0.0 --port $PORT
```

### Menjalankan Frontend Web
Buka terminal baru, masuk ke folder `frontend/`, lalu jalankan:
```bash
cd frontend
npm run dev
```
*(Aplikasi web akan tersedia di URL localhost yang muncul, biasanya http://localhost:5173)*

---

## Panduan Penggunaan Web

1. Buka halaman Web dari server Vite.
2. Pada form **Persentase Kehadiran**, masukkan angka 0-100.
3. Pada **Nilai Tugas** dan **Nilai Ujian**, klik tombol **+ Tambah** untuk menambah kolom nilai sebanyak apapun yang Anda butuhkan (sistem akan otomatis merata-ratakannya).
4. Klik **Proses Prediksi**.
5. Hasil berupa kartu visual yang menunjukkan status **Lulus** atau **Tidak Lulus** beserta kalkulasi hasil akhir akan seketika muncul.
