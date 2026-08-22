import React from 'react';
import { TalkRecord } from '../data/types';

interface TrendCardsProps {
  talks: TalkRecord[];
}

export const TrendCards: React.FC<TrendCardsProps> = ({ talks }) => {
  if (!talks || talks.length === 0) {
    return (
      <div className="terminal-empty-state">
        [NO DATA YET — RUN THE COLLECTOR TO POPULATE THIS VIEW]
      </div>
    );
  }

  // Derive real statistics from talks.json
  const totalTalks = talks.length;
  const uniqueConferences = new Set(talks.map(t => t.conference_name)).size;
  const uniqueSpeakers = new Set(talks.map(t => t.speaker_name)).size;
  const uniqueTopics = new Set(talks.map(t => t.topic)).size;

  const realMetrics = [
    { title: 'Total Extracted Talks', value: String(totalTalks), category: 'RECORD_COUNT' },
    { title: 'Active Conferences', value: String(uniqueConferences), category: 'SOURCES' },
    { title: 'Unique Speakers', value: String(uniqueSpeakers), category: 'SPEAKERS' },
    { title: 'Topics Tracked', value: String(uniqueTopics), category: 'TAXONOMY' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
      {realMetrics.map((item, idx) => (
        <div
          key={idx}
          className="terminal-card terminal-card-hover relative"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="terminal-badge">
              [{item.category}]
            </span>
          </div>

          <div className="my-1">
            <div className="text-[11px] text-slate-400 truncate">{item.title}</div>
            <div className="text-xl font-bold text-green-400 mt-0.5">
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
