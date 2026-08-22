import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { TalkRecord } from '../data/types';

interface HeroSearchBarProps {
  onSearch: (query: string, source: string) => void;
  initialQuery?: string;
  talks: TalkRecord[];
}

export const HeroSearchBar: React.FC<HeroSearchBarProps> = ({ 
  onSearch, 
  initialQuery = '',
  talks 
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTopic, setActiveTopic] = useState('All');

  // Derive unique topics from real talks dataset only
  const availableTopics = ['All', ...Array.from(new Set(talks.map(t => t.topic)))];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), activeTopic);
    }
  };

  return (
    <div className="w-full py-2 font-mono">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="terminal-card">
          {/* Topic Filters derived only from real data */}
          {availableTopics.length > 1 && (
            <div className="flex items-center space-x-1 overflow-x-auto pb-2 border-b border-neutral-800 mb-2.5">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider pr-1 shrink-0 font-bold">
                TOPIC_FILTER:
              </span>
              {availableTopics.map((topic) => {
                const isActive = activeTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setActiveTopic(topic)}
                    className={`px-2 py-0.5 text-xs transition-colors shrink-0 border ${
                      isActive
                        ? 'bg-neutral-800 text-green-400 border-green-600'
                        : 'bg-neutral-900 text-slate-400 hover:text-slate-200 border-neutral-800'
                    }`}
                  >
                    [{topic.toUpperCase()}]
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Input Row */}
          <div className="relative flex items-center">
            <span className="text-green-500 font-bold text-sm pl-1 pr-2">$</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collected talks by keyword or speaker..."
              className="w-full bg-transparent pr-24 py-1 text-xs sm:text-sm text-slate-100 placeholder-neutral-600 focus:outline-none font-mono"
            />

            <div className="absolute right-0 flex items-center space-x-1">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="px-1.5 py-1 text-slate-500 hover:text-slate-200 bg-neutral-900 border border-neutral-800 text-xs"
                >
                  [CLR]
                </button>
              )}
              <button
                type="submit"
                disabled={!query.trim()}
                className="flex items-center space-x-1 px-3 py-1 bg-green-950 hover:bg-green-900 text-green-400 border border-green-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>FILTER</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
