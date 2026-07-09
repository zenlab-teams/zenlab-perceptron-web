import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { SectionTitle } from './SectionTitle';

export function DatasetChart({ metrics }) {
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
