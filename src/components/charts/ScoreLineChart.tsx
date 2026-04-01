import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { LastFiveItem } from '@/types/analytics.types';

interface ScoreLineChartProps {
  data: LastFiveItem[];
}

export const ScoreLineChart: React.FC<ScoreLineChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Format data for Recharts: chronological order (oldest → newest)
  const chronoData = [...data].reverse();
  const chartData = chronoData.map((item, index) => ({
    name: `Int ${index + 1}`,
    score: item.score,
    date: (item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '') + '\u200B'.repeat(index),
  }));

  const scores = chartData.map(d => d.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '12px',
    },
    itemStyle: { color: '#6c63ff' },
  };

  return (
    <div className="w-full space-y-3">
      <div style={{ width: '100%', height: '220px', minHeight: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: any, name: any, props: any) => [`${props?.payload?.score ?? value}/100`, 'Score']}
                labelFormatter={(label) => String(label)}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6c63ff"
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, value } = props;
                  if (cx == null || cy == null) return null;
                  const isMax = value === maxScore && maxScore !== minScore;
                  const isMin = value === minScore && maxScore !== minScore;
                  const fill = isMax ? '#4CAF50' : isMin ? '#F44336' : '#6c63ff';
                  return (
                    <circle
                      key={`dot-${cx}-${cy}`}
                      cx={cx} cy={cy} r={5}
                      fill={fill} stroke="#0d1220" strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7, fill: '#6c63ff' }}
                animationDuration={1200}
                isAnimationActive={true}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: any, name: any, props: any) => [`${props?.payload?.score ?? value}/100`, 'Score']}
                labelFormatter={(label) => String(label)}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} animationDuration={1200}>
                {chartData.map((entry, index) => {
                  const isMax = entry.score === maxScore && maxScore !== minScore;
                  const isMin = entry.score === minScore && maxScore !== minScore;
                  const fill = isMax ? '#4CAF50' : isMin ? '#F44336' : '#6c63ff';
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Toggle Pill - like Android */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-surface-2 border border-border rounded-full p-1 gap-1">
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              chartType === 'line'
                ? 'bg-[#6c63ff] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              chartType === 'bar'
                ? 'bg-[#6c63ff] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Bar
          </button>
        </div>
      </div>
    </div>
  );
};
