import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearchBar } from './components/HeroSearchBar';
import { TrendCards } from './components/TrendCards';
import { TopicDistributionChart } from './components/TopicDistributionChart';
import { ConferenceTimeline } from './components/ConferenceTimeline';
import { TalkCards } from './components/TalkCards';
import { ScraperHealthPanel } from './components/ScraperHealthPanel';
import { SearchResultsView } from './components/SearchResultsView';
import { CommandPaletteModal } from './components/CommandPaletteModal';

import { TalkRecord } from './data/types';
import { fetchTalksData } from './data/talksLoader';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search'>('dashboard');
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [currentTopic, setCurrentTopic] = useState<string>('All');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [talks, setTalks] = useState<TalkRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchTalksData();
      setTalks(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSearch = (query: string, topic: string) => {
    setCurrentQuery(query);
    setCurrentTopic(topic);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommandPaletteAction = (action: string, payload?: any, topicPayload?: string) => {
    if (action === 'openPalette') {
      setIsCommandPaletteOpen(true);
    } else if (action === 'nav') {
      setActiveTab(payload);
    } else if (action === 'search') {
      handleSearch(payload || '', topicPayload || 'All');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col font-mono selection:bg-green-900 selection:text-green-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 pb-10">
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-500 font-mono">
            [LOADING DATA FROM DATA_REPORTS/TALKS.JSON...]
          </div>
        ) : activeTab === 'search' ? (
          <SearchResultsView
            query={currentQuery}
            topic={currentTopic}
            onBackToDashboard={() => setActiveTab('dashboard')}
            talks={talks}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-4 pt-2">
            
            {/* Hero Search Section */}
            <HeroSearchBar onSearch={handleSearch} talks={talks} />

            {/* Trend Cards (Metrics derived from talks) */}
            <section className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <h2 className="font-bold text-slate-300 uppercase tracking-wider">
                  RESEARCH_TRENDS & SIGNALS
                </h2>
                <span className="text-[10px] text-green-400 font-bold">
                  {talks.length > 0 ? `[${talks.length} TALKS LOADED]` : '[NO DATA]'}
                </span>
              </div>
              <TrendCards talks={talks} />
            </section>

            {/* Mid Section: Topic Distribution Chart & Conference Timeline */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div className="lg:col-span-6 flex flex-col">
                <TopicDistributionChart talks={talks} />
              </div>
              <div className="lg:col-span-6 flex flex-col">
                <ConferenceTimeline talks={talks} />
              </div>
            </section>

            {/* Talk Cards Section */}
            <section className="pt-1">
              <TalkCards talks={talks} />
            </section>

            {/* Scraper Health Telemetry Panel */}
            <section className="pt-1">
              <ScraperHealthPanel talks={talks} />
            </section>

          </div>
        )}
      </main>

      {/* Command Palette Overlay Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={handleCommandPaletteAction}
      />

      {/* Terminal Footer */}
      <footer className="border-t border-neutral-800 bg-[#0a0a0a] py-3 text-[11px] text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-green-500 font-bold">&gt;</span>
            <span className="text-slate-400">PHOENIX_INTELLIGENCE // DATA_SOURCE: DATA_REPORTS/TALKS.JSON</span>
          </div>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="text-slate-400">STATUS: {talks.length > 0 ? 'HEALTHY' : 'EMPTY_STATE'}</span>
            <span className="text-green-400">v2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
