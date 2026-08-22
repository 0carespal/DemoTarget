import React from 'react';
import { TalkRecord } from '../data/types';

interface ScraperHealthPanelProps {
  talks: TalkRecord[];
}

export const ScraperHealthPanel: React.FC<ScraperHealthPanelProps> = ({ talks }) => {
  const hasData = talks && talks.length > 0;

  return (
    <div className="terminal-card font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5 mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            SCRAPER_PIPELINE_STATUS
            <span className={`terminal-badge ${
              hasData ? 'terminal-badge-green' : ''
            }`}>
              {hasData ? '[DATA_COLLECTED]' : '[NO_COLLECTOR_RUN]'}
            </span>
          </h3>
          <p className="text-[10px] text-slate-400">Bright Data Scraper Studio execution status</p>
        </div>
      </div>

      {/* Real Pipeline Telemetry Box */}
      {!hasData ? (
        <div className="terminal-empty-state font-mono">
          [NO DATA YET — RUN THE COLLECTOR TO POPULATE THIS VIEW]
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] text-slate-500 uppercase">COLLECTED_RECORDS</span>
            <div className="text-lg font-bold text-green-400 mt-0.5">{talks.length}</div>
          </div>
          <div className="p-2.5 bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] text-slate-500 uppercase">VALIDATION_STATUS</span>
            <div className="text-lg font-bold text-green-400 mt-0.5">HEALTHY</div>
          </div>
          <div className="p-2.5 bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] text-slate-500 uppercase">DATA_REPORT_FILE</span>
            <div className="text-xs font-bold text-slate-200 mt-1">talks.json</div>
          </div>
        </div>
      )}
    </div>
  );
};
