import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { SectionTitle } from './SectionTitle';
import { formatPercent } from '../utils/format';

export function ClassificationChart({ scores }) {
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
