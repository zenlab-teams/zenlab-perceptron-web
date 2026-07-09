import React, { useMemo } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  CheckCircle2,
  Loader2,
  MinusCircle,
  PlusCircle,
} from 'lucide-react';
import { useModelData } from './hooks/useModelData';
import { usePrediction } from './hooks/usePrediction';
import { SectionTitle } from './components/SectionTitle';
import { MetricCard } from './components/MetricCard';
import { DatasetChart } from './components/DatasetChart';
import { ClassificationChart } from './components/ClassificationChart';
import { ConfusionMatrix } from './components/ConfusionMatrix';
import { formatNumber, formatPercent } from './utils/format';

function App() {
  const { metrics, metricsError, config } = useModelData();
  const {
    kehadiran,
    setKehadiran,
    tugas,
    setTugas,
    ujian,
    setUjian,
    loading,
    result,
    error,
    updateList,
    removeListItem,
    handlePredict,
  } = usePrediction();

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

  const passed = result?.status === 1;

  return (
    <main className="min-h-screen bg-[#F4F1EA] px-4 py-6 text-[#1F1B16] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-8 border-b border-[#D8D0C3] pb-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#B85C38]">Zenlab Early Warning System</p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.96] tracking-[-0.02em] text-[#1F1B16] sm:text-7xl">
              Prediksi Kelulusan Mahasiswa pada Mata Kuliah Prasyarat
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-[#5D5347]">
            Input kehadiran, nilai tugas, dan nilai ujian. Sistem akan memprediksi apakah mahasiswa akan lulus atau tidak berdasarkan model perceptron yang telah dilatih.
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

          <div className="flex flex-col justify-between rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-5 sm:p-7">
            <div>
              <SectionTitle icon={result ? (passed ? CheckCircle2 : AlertTriangle) : AlertTriangle} title="Hasil Prediksi" />
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
                </div>
              )}

              {!result && !error && (
                <div className="flex min-h-[200px] items-center justify-center border border-dashed border-[#D8D0C3] p-6 text-center text-[#756B5E] rounded-[6px]">
                  Masukkan data mahasiswa untuk melihat prediksi kelulusan.
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-[#D8D0C3] pt-4 text-sm leading-6 text-[#5D5347]">
              Kriteria kelas: kehadiran minimal <strong>{config.threshold_hadir}%</strong>, nilai akhir minimal <strong>{config.threshold_nilai}</strong>, formula <strong>{config.bobot_ujian}% ujian + {config.bobot_tugas}% tugas</strong>.
            </div>
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
