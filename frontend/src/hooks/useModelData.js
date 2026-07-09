import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useModelData() {
  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState(null);
  const [config, setConfig] = useState({
    bobot_ujian: 60,
    bobot_tugas: 40,
    threshold_hadir: 50,
    threshold_nilai: 75,
  });

  useEffect(() => {
    api.get('/config')
      .then((response) => setConfig(response.data))
      .catch((err) => console.warn('Gagal memuat konfigurasi backend.', err));

    api.get('/metrics')
      .then((response) => setMetrics(response.data))
      .catch((err) => setMetricsError(err.response?.data?.error || 'Metrik model belum tersedia.'));
  }, []);

  return { metrics, metricsError, config };
}
