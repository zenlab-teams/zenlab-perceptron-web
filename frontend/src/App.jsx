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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  Legend,
} from 'recharts';

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
  const data = [
    {
      name: 'Data latih',
      value: distribution.train || metrics?.train_data || 0,
    },
    {
      name: 'Data uji',
      value: distribution.test || metrics?.test_data || 0,
    },
  ];

  return (
    <div className="flex flex-col h-full rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-5">
      <SectionTitle icon={BarChart3} title="Distribusi Dataset" />
      <div className="w-full h-[360px] pt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barCategoryGap="15%"
            margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis
              dataKey="name"
              axisLine={true}
              tickLine={true}
              stroke="#D8D0C3"
              style={{ fontSize: '12px', fontWeight: 500, fill: '#3A332B' }}
            />
            <YAxis
              axisLine={true}
              tickLine={true}
              stroke="#D8D0C3"
              tickFormatter={(val) => val.toLocaleString('id-ID')}
              style={{ fontSize: '12px', fill: '#756B5E' }}
            />
            <Tooltip
              formatter={(value) => [value.toLocaleString('id-ID'), 'Jumlah']}
              contentStyle={{
                backgroundColor: '#FBF8F1',
                borderColor: '#D8D0C3',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#1F1B16',
              }}
            />
            <Bar dataKey="value" fill="#B85C38" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="value"
                position="top"
                formatter={(val) => val.toLocaleString('id-ID')}
                style={{ fill: '#1F1B16', fontWeight: 600, fontSize: '12px' }}
                offset={6}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ClassificationChart({ scores }) {
  const chartData = [
    {
      name: 'Precision',
      'Tidak Lulus': scores?.['Tidak Lulus']?.precision || 0,
      'Lulus': scores?.['Lulus']?.precision || 0,
    },
    {
      name: 'Recall',
      'Tidak Lulus': scores?.['Tidak Lulus']?.recall || 0,
      'Lulus': scores?.['Lulus']?.recall || 0,
    },
    {
      name: 'F1-Score',
      'Tidak Lulus': scores?.['Tidak Lulus']?.f1_score || 0,
      'Lulus': scores?.['Lulus']?.f1_score || 0,
    },
  ];

  return (
    <div className="flex flex-col h-full rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-5">
      <SectionTitle icon={BarChart3} title="Skor Klasifikasi" />
      <div className="w-full h-[360px] pt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%" barGap={4} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="name"
              axisLine={true}
              tickLine={true}
              stroke="#D8D0C3"
              style={{ fontSize: '11px', fontWeight: 600, fill: '#756B5E' }}
            />
            <YAxis
              domain={[0, 1]}
              axisLine={true}
              tickLine={true}
              stroke="#D8D0C3"
              tickFormatter={(val) => `${Math.round(val * 100)}%`}
              style={{ fontSize: '11px', fill: '#756B5E' }}
            />
            <Tooltip
              formatter={(value, name) => [formatPercent(value), name]}
              contentStyle={{
                backgroundColor: '#FBF8F1',
                borderColor: '#D8D0C3',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#1F1B16',
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="rect" style={{ fontSize: '12px' }} />
            <Bar dataKey="Tidak Lulus" fill="#1F1B16" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="Tidak Lulus"
                position="top"
                formatter={(val) => formatPercent(val)}
                style={{ fill: '#1F1B16', fontWeight: 600, fontSize: '10px' }}
                offset={6}
              />
            </Bar>
            <Bar dataKey="Lulus" fill="#B85C38" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="Lulus"
                position="top"
                formatter={(val) => formatPercent(val)}
                style={{ fill: '#B85C38', fontWeight: 600, fontSize: '10px' }}
                offset={6}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ConfusionMatrix({ matrix }) {
  const tn = matrix?.tn || 0;
  const fp = matrix?.fp || 0;
  const fn = matrix?.fn || 0;
  const tp = matrix?.tp || 0;

  return (
    <div className="rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-5 sm:p-7">
      <div className="mb-6 border-b border-[#D8D0C3] pb-4">
        <div className="flex items-center gap-2">
          <Table2 size={18} className="text-[#B85C38]" />
          <h2 className="font-serif text-2xl text-[#1F1B16]">Confusion Matrix</h2>
        </div>
        <p className="mt-1 text-sm text-[#756B5E]">Perbandingan hasil perhitungan dengan data uji.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.5fr_1fr] items-center">
        {/* Table on the Left */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-[#1F1B16]">
                <th className="py-3 px-4"></th>
                <th className="py-3 px-4 font-bold text-[#1F1B16] text-center">Prediksi Tidak Lulus</th>
                <th className="py-3 px-4 font-bold text-[#1F1B16] text-center">Prediksi Lulus</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#D8D0C3]">
                <td className="py-4 px-4 font-bold text-[#1F1B16]">Aktual Tidak Lulus</td>
                <td className="py-4 px-4 text-center font-bold text-[#1F1B16] text-xl">{tn}</td>
                <td className="py-4 px-4 text-center font-bold text-[#1F1B16] text-xl">{fp}</td>
              </tr>
              <tr className="border-b-2 border-[#1F1B16]">
                <td className="py-4 px-4 font-bold text-[#1F1B16]">Aktual Lulus</td>
                <td className="py-4 px-4 text-center font-bold text-[#1F1B16] text-xl">{fn}</td>
                <td className="py-4 px-4 text-center font-bold text-[#1F1B16] text-xl">{tp}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2x2 Cards Grid on the Right */}
        <div className="grid grid-cols-2 gap-3">
          {/* TN Card */}
          <div className="rounded-[6px] border border-[#1F1B16] bg-[#F4F1EA] p-4 flex flex-col justify-between h-[90px] transition hover:shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#756B5E]">TN</span>
            <span className="text-3xl font-bold text-[#1F1B16]">{tn}</span>
          </div>

          {/* FP Card */}
          <div className="rounded-[6px] border border-[#1F1B16] bg-[#F4F1EA] p-4 flex flex-col justify-between h-[90px] transition hover:shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#756B5E]">FP</span>
            <span className="text-3xl font-bold text-[#1F1B16]">{fp}</span>
          </div>

          {/* FN Card */}
          <div className="rounded-[6px] border border-[#1F1B16] bg-[#F4F1EA] p-4 flex flex-col justify-between h-[90px] transition hover:shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#756B5E]">FN</span>
            <span className="text-3xl font-bold text-[#1F1B16]">{fn}</span>
          </div>

          {/* TP Card */}
          <div className="rounded-[6px] border border-[#1F1B16] bg-[#F4F1EA] p-4 flex flex-col justify-between h-[90px] transition hover:shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#756B5E]">TP</span>
            <span className="text-3xl font-bold text-[#1F1B16]">{tp}</span>
          </div>
        </div>
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

        <section className="grid gap-6 py-8 lg:grid-cols-[1fr_0.78fr]">
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

        <section className="border-t border-[#D8D0C3] py-8">
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
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <DatasetChart metrics={metrics} />
                  <ClassificationChart scores={metrics.class_scores} />
                  <div className="lg:col-span-2">
                    <ConfusionMatrix matrix={metrics.confusion_matrix} />
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
