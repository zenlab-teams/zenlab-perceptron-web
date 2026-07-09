import { useState } from 'react';
import { api } from '../lib/api';

export function usePrediction() {
  const [kehadiran, setKehadiran] = useState('');
  const [tugas, setTugas] = useState(['']);
  const [ujian, setUjian] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
      const response = await api.post('/predict', {
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

  return {
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
  };
}
