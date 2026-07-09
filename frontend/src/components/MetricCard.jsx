import React from 'react';

export function MetricCard({ label, value, tone = 'dark' }) {
  return (
    <div className="rounded-[6px] border border-[#D8D0C3] bg-[#FBF8F1] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#756B5E]">{label}</p>
      <p className={tone === 'accent' ? 'mt-3 text-3xl font-semibold text-[#B85C38]' : 'mt-3 text-3xl font-semibold text-[#1F1B16]'}>
        {value}
      </p>
    </div>
  );
}
