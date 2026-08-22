import React from 'react';
import { TalkRecord } from '../data/types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface TopicDistributionChartProps {
  talks: TalkRecord[];
}

export const TopicDistributionChart: React.FC<TopicDistributionChartProps> = ({ talks }) => {
  if (!talks || talks.length === 0) {
    return (
      <div className="terminal-card flex flex-col justify-center items-center h-full min-h-[220px]">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">TOPIC_DISTRIBUTION</div>
        <div className="terminal-empty-state border-none p-0 bg-transparent">
          [NO DATA YET — RUN THE COLLECTOR TO POPULATE THIS VIEW]
        </div>
      </div>
    );
  }

  // Derive dynamic topic counts and percentages from real talks
  const topicCounts: Record<string, number> = {};
  talks.forEach(t => {
    topicCounts[t.topic] = (topicCounts[t.topic] || 0) + 1;
  });

  const total = talks.length;
  const terminalColors = ['#22c55e', '#16a34a', '#15803d', '#737373', '#525252'];

  const topicStats = Object.entries(topicCounts).map(([name, count], idx) => ({
    name,
    talkCount: count,
    percentage: Math.round((count / total) * 100),
    terminalColor: terminalColors[idx % terminalColors.length]
  }));

  return (
    <div className="terminal-card flex flex-col justify-between h-full font-mono">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-xs">
        <div>
          <h3 className="font-bold text-slate-100 uppercase tracking-wider">TOPIC_DISTRIBUTION</h3>
          <p className="text-[10px] text-slate-400">Derived from data_reports/talks.json</p>
        </div>
        <span className="terminal-badge">
          [{total} RECS]
        </span>
      </div>

      {/* Chart Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center my-1">
        <div className="md:col-span-5 h-44 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topicStats}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={2}
                dataKey="talkCount"
                stroke="#121212"
                strokeWidth={2}
              >
                {topicStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.terminalColor} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0a0a0a] border border-neutral-700 p-2 text-xs font-mono">
                        <div className="text-slate-200 font-bold mb-0.5">{data.name}</div>
                        <div className="text-green-400">{data.talkCount} talks ({data.percentage}%)</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-lg font-bold text-slate-100 font-mono">{total}</span>
            <span className="text-[9px] text-slate-400 uppercase font-mono">TOTAL</span>
          </div>
        </div>

        <div className="md:col-span-7 space-y-1.5">
          {topicStats.map((topic, i) => (
            <div key={i} className="flex items-center justify-between p-1.5 bg-neutral-900 border border-neutral-800 text-xs">
              <div className="flex items-center space-x-2 min-w-0">
                <span 
                  className="w-2 h-2 shrink-0"
                  style={{ backgroundColor: topic.terminalColor }}
                ></span>
                <span className="text-[11px] text-slate-300 truncate">{topic.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] shrink-0 ml-2">
                <span className="text-slate-400">{topic.talkCount} talks</span>
                <span className="text-slate-100 font-bold w-7 text-right">{topic.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
