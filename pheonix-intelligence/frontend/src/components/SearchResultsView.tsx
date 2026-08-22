import React from 'react';
import { TalkRecord } from '../data/types';
import { ArrowLeft } from 'lucide-react';
import { TalkCards } from './TalkCards';

interface SearchResultsViewProps {
  query: string;
  topic: string;
  onBackToDashboard: () => void;
  talks: TalkRecord[];
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  query,
  topic,
  onBackToDashboard,
  talks
}) => {
  // Hardcoded filter implementation matching backend/filter.py logic
  const filteredTalks = talks.filter((t) => {
    const matchesTopic = topic === 'All' || !topic || t.topic.toLowerCase() === topic.toLowerCase();
    const queryLower = query.toLowerCase().trim();
    const matchesQuery = !queryLower || 
      t.talk_title.toLowerCase().includes(queryLower) ||
      t.speaker_name.toLowerCase().includes(queryLower) ||
      t.conference_name.toLowerCase().includes(queryLower) ||
      t.topic.toLowerCase().includes(queryLower);
    return matchesTopic && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-mono">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={onBackToDashboard}
            className="flex items-center space-x-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>[DASHBOARD]</span>
          </button>
          
          <div className="h-3 w-px bg-neutral-800"></div>
          
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">QUERY:</span>
            <span className="text-green-400 font-bold px-1.5 py-0.2 bg-green-950/60 border border-green-800">
              "{query || 'ALL'}"
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 bg-neutral-900 px-1.5 py-0.2 border border-neutral-800">
              TOPIC: {topic}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Results Summary Box */}
      <div className="bg-[#121212] border border-neutral-800 p-4">
        <div className="border-b border-neutral-800 pb-2 mb-3">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            FILTERED_TALKS_SUMMARY ({filteredTalks.length})
          </h2>
        </div>

        {filteredTalks.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            [NO DATA YET — RUN THE COLLECTOR TO POPULATE THIS VIEW]
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-slate-300">
              Found <strong className="text-green-400 font-bold">{filteredTalks.length}</strong> talk(s) matching topic "<span className="text-slate-100">{topic}</span>" and query "<span className="text-slate-100">{query}</span>".
            </div>

            {/* AI Summary Section based ONLY on real filtered talks */}
            <div className="mt-3 p-3 bg-neutral-900 border border-neutral-800 text-xs text-slate-300 space-y-1.5">
              <div className="text-green-400 font-bold text-[10px] uppercase tracking-wider">
                [TOPIC_SUMMARY]
              </div>
              <p className="leading-relaxed">
                Key talks extracted for {topic !== 'All' ? topic : 'all topics'} include {filteredTalks.map(t => `"${t.talk_title}" by ${t.speaker_name} (${t.conference_name})`).join('; ')}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filtered Talk Cards */}
      <div className="pt-2">
        <TalkCards talks={filteredTalks} />
      </div>
    </div>
  );
};
