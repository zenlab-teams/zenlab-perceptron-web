import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, MinusCircle, ShieldAlert, ShieldCheck, Calculator, GraduationCap, Loader2 } from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function App() {
  const [kehadiran, setKehadiran] = useState('');
  const [tugas, setTugas] = useState(['']);
  const [ujian, setUjian] = useState(['']);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Konfigurasi dinamis yang diambil dari .env backend
  const [config, setConfig] = useState({
    bobot_ujian: 60,
    bobot_tugas: 40,
    threshold_hadir: 50,
    threshold_nilai: 75
  });

  // Ambil konfigurasi saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/config');
        setConfig(response.data);
      } catch (err) {
        console.warn("Gagal memuat konfigurasi dari backend. Menggunakan nilai default.", err);
      }
    };
    fetchConfig();
  }, []);

  const addTugas = () => setTugas([...tugas, '']);
  const removeTugas = (idx) => {
    const newTugas = [...tugas];
    newTugas.splice(idx, 1);
    setTugas(newTugas);
  };
  const updateTugas = (idx, val) => {
    const newTugas = [...tugas];
    newTugas[idx] = val;
    setTugas(newTugas);
  };

  const addUjian = () => setUjian([...ujian, '']);
  const removeUjian = (idx) => {
    const newUjian = [...ujian];
    newUjian.splice(idx, 1);
    setUjian(newUjian);
  };
  const updateUjian = (idx, val) => {
    const newUjian = [...ujian];
    newUjian[idx] = val;
    setUjian(newUjian);
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/predict', {
        kehadiran: parseFloat(kehadiran) || 0,
        tugas: tugas.filter(t => t !== '').map(Number),
        ujian: ujian.filter(u => u !== '').map(Number)
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center bg-gray-50 text-gray-900">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2 mt-8 mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-700 rounded-2xl mb-4 shadow-sm">
            <GraduationCap size={36} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Zenlab Early Warning
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Sistem cerdas pendeteksi potensi kelulusan mahasiswa berdasarkan metrik akademik (Tugas & Ujian) dan kedisiplinan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110 duration-500"></div>
            
            <form onSubmit={handlePredict} className="space-y-8 relative z-10">
              
              {/* Kehadiran Section */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  Persentase Kehadiran
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-medium text-gray-900"
                    placeholder="Contoh: 85"
                    value={kehadiran}
                    onChange={(e) => setKehadiran(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Nilai Tugas Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Nilai Tugas ({config.bobot_tugas}%)
                    </label>
                    <button type="button" onClick={addTugas} className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 text-sm font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                      <PlusCircle size={16} /> Tambah
                    </button>
                  </div>
                  
                  <div className="space-y-3 overflow-x-hidden">
                    {tugas.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                        <span className="text-xs font-bold text-gray-400 w-6 flex-shrink-0">T{idx+1}</span>
                        <input
                          type="number"
                          required
                          min="0"
                          max="100"
                          className="flex-1 min-w-0 h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-gray-900"
                          placeholder="Nilai"
                          value={t}
                          onChange={(e) => updateTugas(idx, e.target.value)}
                        />
                        {tugas.length > 1 && (
                          <button type="button" onClick={() => removeTugas(idx)} className="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0">
                            <MinusCircle size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nilai Ujian Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Nilai Ujian ({config.bobot_ujian}%)
                    </label>
                    <button type="button" onClick={addUjian} className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 text-sm font-semibold bg-indigo-50 px-2 py-1 rounded-lg">
                      <PlusCircle size={16} /> Tambah
                    </button>
                  </div>
                  
                  <div className="space-y-3 overflow-x-hidden">
                    {ujian.map((u, idx) => (
                      <div key={idx} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                        <span className="text-xs font-bold text-gray-400 w-6 flex-shrink-0">U{idx+1}</span>
                        <input
                          type="number"
                          required
                          min="0"
                          max="100"
                          className="flex-1 min-w-0 h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-gray-900"
                          placeholder="Nilai"
                          value={u}
                          onChange={(e) => updateUjian(idx, e.target.value)}
                        />
                        {ujian.length > 1 && (
                          <button type="button" onClick={() => removeUjian(idx)} className="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0">
                            <MinusCircle size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><Calculator size={24} /> Proses Prediksi Kelulusan</>}
              </button>
            </form>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 animate-in zoom-in-95 duration-300">
                <p className="font-semibold flex items-center gap-2"><ShieldAlert size={20} /> Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {result && !error && (
              <div className={cn(
                "p-8 rounded-3xl border shadow-2xl animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden",
                result.status === 1 
                  ? "bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 text-emerald-900" 
                  : "bg-gradient-to-br from-rose-50 to-red-100 border-rose-200 text-rose-900"
              )}>
                
                {/* Decoration */}
                <div className="absolute -top-10 -right-10 opacity-10 text-current">
                  {result.status === 1 ? <ShieldCheck size={160} /> : <ShieldAlert size={160} />}
                </div>

                <div className="relative z-10 space-y-6">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-1">Status Mahasiswa</p>
                    <h2 className="text-5xl font-black tracking-tight">
                      {result.status === 1 ? 'LULUS' : 'REMEDIAL'}
                    </h2>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 space-y-4 shadow-sm border border-white/50 text-gray-900">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold opacity-75 text-sm">Kehadiran</span>
                      <span className="text-xl font-bold">{result.kehadiran}%</span>
                    </div>
                    <div className="h-px w-full bg-black/5 rounded-full"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold opacity-75 text-sm">Rata-rata Tugas ({config.bobot_tugas}%)</span>
                      <span className="text-xl font-bold">{result.rata_tugas}</span>
                    </div>
                    <div className="h-px w-full bg-black/5 rounded-full"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold opacity-75 text-sm">Rata-rata Ujian ({config.bobot_ujian}%)</span>
                      <span className="text-xl font-bold">{result.rata_ujian}</span>
                    </div>
                    {result.nilai_akhir !== undefined && (
                      <>
                        <div className="h-px w-full bg-black/5 rounded-full"></div>
                        <div className="flex justify-between items-center bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                          <span className="font-bold text-blue-900 text-sm">Nilai Akhir (Akumulasi)</span>
                          <span className="text-2xl font-black text-blue-950">{result.nilai_akhir}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="text-sm font-medium opacity-85 leading-relaxed">
                    {result.status === 1 
                      ? "Mahasiswa ini memiliki performa yang baik dan aman untuk mengikuti semester berikutnya." 
                      : "Peringatan! Mahasiswa ini berada di bawah batas minimum. Segera berikan intervensi akademik."}
                  </p>

                  <div className="text-xs space-y-1.5 opacity-80 border-t border-black/10 pt-4 text-gray-700">
                    <p className="font-bold flex items-center gap-1">📋 Kriteria Kelulusan Kelas:</p>
                    <ul className="list-disc list-inside pl-1 space-y-0.5 font-medium">
                      <li>Batas Kehadiran: Minimal <span className="font-bold">{config.threshold_hadir}%</span></li>
                      <li>Batas Nilai Akhir: Minimal <span className="font-bold">{config.threshold_nilai}</span></li>
                      <li>Formula Nilai Akhir: <span className="font-semibold">{config.bobot_ujian}% Ujian + {config.bobot_tugas}% Tugas</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {!result && !error && (
              <div className="bg-white border border-gray-200 border-dashed rounded-3xl h-full min-h-[300px] flex items-center justify-center p-8 text-center text-gray-400 shadow-sm">
                <div>
                  <Calculator size={48} className="mx-auto mb-4 opacity-20 text-gray-500" />
                  <p className="font-medium text-gray-500">Masukkan data mahasiswa dan tekan tombol proses untuk melihat hasil prediksi di sini.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
