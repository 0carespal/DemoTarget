import React from 'react';
import { TalkRecord } from '../data/types';

interface ConferenceTimelineProps {
  talks: TalkRecord[];
}

export const ConferenceTimeline: React.FC<ConferenceTimelineProps> = ({ talks }) => {
  if (!talks || talks.length === 0) {
    return (
      <div className="terminal-card flex flex-col justify-center items-center h-full min-h-[220px]">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">CONFERENCE_SCHEDULE</div>
        <div className="terminal-empty-state border-none p-0 bg-transparent">
          [NO DATA YET — RUN THE COLLECTOR TO POPULATE THIS VIEW]
        </div>
      </div>
    );
  }

  // Group talks dynamically by conference name from real talks data
  const conferenceGroups: Record<string, TalkRecord[]> = {};
  talks.forEach(t => {
    const key = t.conference_name || 'Unspecified Conference';
    if (!conferenceGroups[key]) {
      conferenceGroups[key] = [];
    }
    conferenceGroups[key].push(t);
  });

  return (
    <div className="terminal-card flex flex-col justify-between h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-xs">
        <div>
          <h3 className="font-bold text-slate-100 uppercase tracking-wider">CONFERENCE_TIMELINE</h3>
          <p className="text-[10px] text-slate-400">Extracted conference schedules</p>
        </div>
        <span className="terminal-badge terminal-badge-green">
          [{Object.keys(conferenceGroups).length} CONFERENCES]
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-4 space-y-3 my-1 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-neutral-800">
        {Object.entries(conferenceGroups).map(([confName, confTalks], idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -left-[21px] top-1 text-[10px] font-bold text-green-400 bg-[#121212]">
              +
            </div>

            <div className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{confName}</h4>
                  <span className="text-[10px] text-slate-400">
                    {confTalks.length} TALKS EXTRACTED
                  </span>
                </div>
              </div>

              {/* Sample Speakers */}
              <div className="mt-2 pt-1.5 border-t border-neutral-800 text-[10px] text-slate-400">
                SPEAKERS: <span className="text-slate-300">{confTalks.map(t => t.speaker_name).slice(0, 3).join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
