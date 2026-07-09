import React from 'react';
import { Table2 } from 'lucide-react';

export function ConfusionMatrix({ matrix }) {
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
