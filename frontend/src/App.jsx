import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  CheckCircle2,
  Loader2,
  MinusCircle,
  PlusCircle,
  Table2,
} from 'lucide-react';

const API_URL = 'http://127.0.0.1:5000/api';

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return Number(value).toLocaleString('id-ID', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function formatPercent(value) {
  if (value === null || value === undefined) return '-';
  return `${formatNumber(Number(value) * 100, 1)}%`;
}

function MetricCard({ label, value, tone = 'dark' }) {
  return (
    <div className="rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#756B5E]">{label}</p>
      <p className={tone === 'accent' ? 'mt-3 text-3xl font-semibold text-[#B85C38]' : 'mt-3 text-3xl font-semibold text-[#1F1B16]'}>
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-2 border-b border-[#D8D0C3] pb-3">
      <Icon size={18} className="text-[#B85C38]" />
      <h2 className="font-serif text-2xl text-[#1F1B16]">{title}</h2>
    </div>
  );
}

function DatasetChart({ metrics }) {
  const distribution = metrics?.dataset_distribution || {};
  const rows = [
    ['Data latih', distribution.train || metrics?.train_data || 0],
    ['Data uji', distribution.test || metrics?.test_data || 0],
  ];
  const max = Math.max(...rows.map(([, value]) => value), 1);

  return (
    <div className="rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-5">
      <SectionTitle icon={BarChart3} title="Distribusi Dataset" />
      <div className="space-y-4">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[88px_1fr_72px] items-center gap-3 text-sm">
            <span className="font-medium text-[#3A332B]">{label}</span>
            <div className="h-8 border border-[#D8D0C3] bg-[#F4F1EA]">
              <div
                className="h-full bg-[#B85C38]"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
            <span className="text-right font-semibold text-[#1F1B16]">{value.toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassificationChart({ scores }) {
  const classes = ['Tidak Lulus', 'Lulus'];
  const metrics = [
    ['precision', 'Precision'],
    ['recall', 'Recall'],
    ['f1_score', 'F1-Score'],
  ];

  return (
    <div className="rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-5">
      <SectionTitle icon={BarChart3} title="Skor Klasifikasi" />
      <div className="space-y-6">
        {classes.map((className) => (
          <div key={className}>
            <p className="mb-3 text-sm font-semibold text-[#1F1B16]">{className}</p>
            <div className="grid grid-cols-3 gap-3">
              {metrics.map(([key, label]) => {
                const value = scores?.[className]?.[key] || 0;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex h-28 items-end border border-[#D8D0C3] bg-[#F4F1EA] px-2 pt-2">
                      <div
                        className="w-full bg-[#1F1B16]"
                        style={{ height: `${Math.max(value * 100, 2)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#756B5E]">{label}</p>
                      <p className="text-sm font-semibold text-[#B85C38]">{formatPercent(value)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfusionMatrix({ matrix }) {
  const cells = [
    ['Aktual tidak lulus', matrix?.tn || 0, matrix?.fp || 0],
    ['Aktual lulus', matrix?.fn || 0, matrix?.tp || 0],
  ];

  return (
    <div className="rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-5">
      <SectionTitle icon={Table2} title="Confusion Matrix" />
      <div className="grid grid-cols-[1.1fr_1fr_1fr] border-l border-t border-[#D8D0C3] text-sm">
        <div className="border-b border-r border-[#D8D0C3] bg-[#F4F1EA] p-3 font-semibold text-[#756B5E]">Aktual / Prediksi</div>
        <div className="border-b border-r border-[#D8D0C3] bg-[#F4F1EA] p-3 text-center font-semibold text-[#756B5E]">Tidak lulus</div>
        <div className="border-b border-r border-[#D8D0C3] bg-[#F4F1EA] p-3 text-center font-semibold text-[#756B5E]">Lulus</div>
        {cells.map(([label, left, right]) => (
          <React.Fragment key={label}>
            <div className="border-b border-r border-[#D8D0C3] p-3 font-medium text-[#3A332B]">{label}</div>
            <div className="border-b border-r border-[#D8D0C3] p-3 text-center text-2xl font-semibold text-[#1F1B16]">{left.toLocaleString('id-ID')}</div>
            <div className="border-b border-r border-[#D8D0C3] p-3 text-center text-2xl font-semibold text-[#B85C38]">{right.toLocaleString('id-ID')}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [kehadiran, setKehadiran] = useState('');
  const [tugas, setTugas] = useState(['']);
  const [ujian, setUjian] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState(null);
  const [config, setConfig] = useState({
    bobot_ujian: 60,
    bobot_tugas: 40,
    threshold_hadir: 50,
    threshold_nilai: 75,
  });

  useEffect(() => {
    axios.get(`${API_URL}/config`)
      .then((response) => setConfig(response.data))
      .catch((err) => console.warn('Gagal memuat konfigurasi backend.', err));

    axios.get(`${API_URL}/metrics`)
      .then((response) => setMetrics(response.data))
      .catch((err) => setMetricsError(err.response?.data?.error || 'Metrik model belum tersedia.'));
  }, []);

  const summaryCards = useMemo(() => ([
    ['Akurasi', formatPercent(metrics?.accuracy), 'accent'],
    ['Error Rate', formatPercent(metrics?.error_rate)],
    ['MAE', formatNumber(metrics?.mae)],
    ['MSE', formatNumber(metrics?.mse)],
    ['RMSE', formatNumber(metrics?.rmse)],
    ['Total Data', metrics?.total_data?.toLocaleString('id-ID') || '-'],
    ['Data Uji', metrics?.test_data?.toLocaleString('id-ID') || '-'],
    ['Epoch Training', metrics?.epoch_training?.toLocaleString('id-ID') || '-'],
  ]), [metrics]);

  const updateList = (setter, list, idx, val) => {
    const next = [...list];
    next[idx] = val;
    setter(next);
  };

  const removeListItem = (setter, list, idx) => {
    setter(list.filter((_, itemIdx) => itemIdx !== idx));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/predict`, {
        kehadiran: parseFloat(kehadiran) || 0,
        tugas: tugas.filter(Boolean).map(Number),
        ujian: ujian.filter(Boolean).map(Number),
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const passed = result?.status === 1;

  return (
    <main className="min-h-screen bg-[#F4F1EA] px-4 py-6 text-[#1F1B16] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-8 border-b border-[#D8D0C3] pb-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#B85C38]">Zenlab Early Warning</p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.96] tracking-[-0.02em] text-[#1F1B16] sm:text-7xl">
              Prediksi kelulusan dengan metrik model yang terbuka.
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-[#5D5347]">
            Input kehadiran, nilai tugas, dan nilai ujian. Dashboard menampilkan performa model Perceptron dari dataset latih terbaru.
          </p>
        </header>

        <section className="py-8">
          <SectionTitle icon={BarChart3} title="Ringkasan Model" />
          {metricsError ? (
            <div className="rounded-[6px] border border-[#B85C38] bg-[#FBF8F1] p-4 text-sm font-medium text-[#B85C38]">
              {metricsError}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map(([label, value, tone]) => (
                  <MetricCard key={label} label={label} value={value} tone={tone} />
                ))}
              </div>
              {metrics && (
                <div className="mt-5 grid gap-5 lg:grid-cols-3">
                  <DatasetChart metrics={metrics} />
                  <ClassificationChart scores={metrics.class_scores} />
                  <ConfusionMatrix matrix={metrics.confusion_matrix} />
                </div>
              )}
            </>
          )}
        </section>

        <section className="grid gap-6 border-t border-[#D8D0C3] py-8 lg:grid-cols-[1fr_0.78fr]">
          <div className="rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-5 sm:p-7">
            <SectionTitle icon={Calculator} title="Prediksi Mahasiswa" />
            <form onSubmit={handlePredict} className="space-y-7">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#756B5E]">
                  Persentase Kehadiran
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    className="h-12 w-full rounded-[6px] border border-[#D8D0C3] bg-[#F4F1EA] px-4 pr-10 text-lg font-medium outline-none transition focus:border-[#B85C38] focus:bg-[#FBF8F1]"
                    placeholder="85"
                    value={kehadiran}
                    onChange={(e) => setKehadiran(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#756B5E]">%</span>
                </div>
              </div>

              <div className="grid gap-7 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D8D0C3] pb-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#756B5E]">
                      Nilai Tugas ({config.bobot_tugas}%)
                    </label>
                    <button type="button" onClick={() => setTugas([...tugas, ''])} className="inline-flex items-center gap-1 text-sm font-semibold text-[#B85C38]">
                      <PlusCircle size={16} /> Tambah
                    </button>
                  </div>
                  {tugas.map((value, idx) => (
                    <div key={idx} className="grid grid-cols-[28px_1fr_28px] items-center gap-2">
                      <span className="text-xs font-semibold text-[#756B5E]">T{idx + 1}</span>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        className="h-10 min-w-0 rounded-[6px] border border-[#D8D0C3] bg-[#F4F1EA] px-3 font-medium outline-none focus:border-[#B85C38]"
                        placeholder="Nilai"
                        value={value}
                        onChange={(e) => updateList(setTugas, tugas, idx, e.target.value)}
                      />
                      {tugas.length > 1 && (
                        <button type="button" onClick={() => removeListItem(setTugas, tugas, idx)} className="text-[#B85C38]">
                          <MinusCircle size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D8D0C3] pb-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#756B5E]">
                      Nilai Ujian ({config.bobot_ujian}%)
                    </label>
                    <button type="button" onClick={() => setUjian([...ujian, ''])} className="inline-flex items-center gap-1 text-sm font-semibold text-[#B85C38]">
                      <PlusCircle size={16} /> Tambah
                    </button>
                  </div>
                  {ujian.map((value, idx) => (
                    <div key={idx} className="grid grid-cols-[28px_1fr_28px] items-center gap-2">
                      <span className="text-xs font-semibold text-[#756B5E]">U{idx + 1}</span>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        className="h-10 min-w-0 rounded-[6px] border border-[#D8D0C3] bg-[#F4F1EA] px-3 font-medium outline-none focus:border-[#B85C38]"
                        placeholder="Nilai"
                        value={value}
                        onChange={(e) => updateList(setUjian, ujian, idx, e.target.value)}
                      />
                      {ujian.length > 1 && (
                        <button type="button" onClick={() => removeListItem(setUjian, ujian, idx)} className="text-[#B85C38]">
                          <MinusCircle size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#1F1B16] px-5 font-semibold text-[#FBF8F1] transition hover:bg-[#B85C38] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : <Calculator size={21} />}
                Proses Prediksi
              </button>
            </form>
          </div>

          <div className="rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-5 sm:p-7">
            <SectionTitle icon={passed ? CheckCircle2 : AlertTriangle} title="Hasil Prediksi" />
            {error && (
              <div className="rounded-[6px] border border-[#B85C38] bg-[#F4F1EA] p-4 text-sm font-medium text-[#B85C38]">
                {error}
              </div>
            )}

            {result && !error && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#756B5E]">Status mahasiswa</p>
                  <p className={passed ? 'mt-2 font-serif text-5xl text-[#1F1B16]' : 'mt-2 font-serif text-5xl text-[#B85C38]'}>
                    {passed ? 'Lulus' : 'Tidak Lulus'}
                  </p>
                </div>
                <div className="divide-y divide-[#D8D0C3] border-y border-[#D8D0C3]">
                  {[
                    ['Kehadiran', `${result.kehadiran}%`],
                    [`Rata-rata Tugas (${config.bobot_tugas}%)`, result.rata_tugas],
                    [`Rata-rata Ujian (${config.bobot_ujian}%)`, result.rata_ujian],
                    ['Nilai Akhir', result.nilai_akhir],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium text-[#5D5347]">{label}</span>
                      <span className="text-xl font-semibold text-[#1F1B16]">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm leading-6 text-[#5D5347]">
                  Kriteria kelas: kehadiran minimal <strong>{config.threshold_hadir}%</strong>, nilai akhir minimal <strong>{config.threshold_nilai}</strong>, formula <strong>{config.bobot_ujian}% ujian + {config.bobot_tugas}% tugas</strong>.
                </div>
              </div>
            )}

            {!result && !error && (
              <div className="flex min-h-[260px] items-center border border-dashed border-[#D8D0C3] p-6 text-[#756B5E]">
                Masukkan data mahasiswa untuk melihat prediksi kelulusan.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
