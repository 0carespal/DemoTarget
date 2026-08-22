import React, { useState } from 'react';
import { TalkRecord } from '../data/types';

interface TalkCardsProps {
  talks: TalkRecord[];
}

export const TalkCards: React.FC<TalkCardsProps> = ({ talks }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  if (!talks || talks.length === 0) {
    return (
      <div className="terminal-empty-state">
        [NO DATA YET — RUN THE COLLECTOR TO POPULATE THIS VIEW]
      </div>
    );
  }

  // Derive topics present in the dataset
  const uniqueTopics = ['All', ...Array.from(new Set(talks.map(t => t.topic)))];

  const filteredTalks = selectedTopic === 'All'
    ? talks
    : talks.filter(t => t.topic === selectedTopic);

  return (
    <div className="space-y-3 font-mono">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            COLLECTED_CONFERENCE_TALKS ({filteredTalks.length})
          </h3>
          <p className="text-[10px] text-slate-400">Extracted records from data_reports/talks.json</p>
        </div>

        {/* Topic Filters */}
        {uniqueTopics.length > 1 && (
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {uniqueTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-2 py-0.5 text-xs transition-colors shrink-0 border ${
                  selectedTopic === topic
                    ? 'bg-neutral-800 text-green-400 border-green-600'
                    : 'bg-neutral-900 text-slate-400 hover:text-slate-200 border-neutral-800'
                }`}
              >
                [{topic.toUpperCase()}]
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-2">
        {filteredTalks.map((talk, idx) => (
          <div
            key={idx}
            className="terminal-card terminal-card-hover"
          >
            {/* Top Row: Conference & Topic */}
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="terminal-badge">
                [{talk.conference_name}]
              </span>
              <span className="terminal-badge terminal-badge-green">
                TOPIC: {talk.topic}
              </span>
            </div>

            {/* Talk Title */}
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
              {talk.talk_title}
            </h4>

            {/* Speaker */}
            <div className="text-[11px] text-slate-400 mt-1">
              SPEAKER: <span className="text-slate-200 font-bold">{talk.speaker_name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
