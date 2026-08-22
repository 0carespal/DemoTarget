import React from 'react';
import { 
  Search, 
  Bell, 
  Terminal
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'search';
  setActiveTab: (tab: 'dashboard' | 'search') => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab,
  onOpenCommandPalette 
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-12 text-xs font-mono">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2 cursor-pointer text-slate-200 hover:text-green-400"
            >
              <Terminal className="w-4 h-4 text-green-500" />
              <div className="flex items-center space-x-1.5 font-bold tracking-wider text-slate-100">
                <span>PHOENIX</span>
                <span className="text-[10px] text-green-400 bg-green-950/60 border border-green-800 px-1 py-0.2">
                  SYS_v2.4
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 border-l border-neutral-800 pl-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-2.5 py-1 text-xs transition-colors border ${
                  activeTab === 'dashboard'
                    ? 'bg-neutral-800 text-green-400 border-green-600'
                    : 'bg-neutral-900 text-slate-400 hover:text-slate-200 border-neutral-800'
                }`}
              >
                [DASHBOARD]
              </button>
              
              <button
                onClick={() => setActiveTab('search')}
                className={`px-2.5 py-1 text-xs transition-colors border ${
                  activeTab === 'search'
                    ? 'bg-neutral-800 text-green-400 border-green-600'
                    : 'bg-neutral-900 text-slate-400 hover:text-slate-200 border-neutral-800'
                }`}
              >
                [SEARCH_QUERY]
              </button>
            </nav>
          </div>

          {/* Quick Command Trigger & System Controls */}
          <div className="flex items-center space-x-2">
            {/* Quick Command Trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center space-x-2 px-2.5 py-1 text-xs text-slate-400 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-slate-200 transition-colors"
            >
              <Search className="w-3 h-3 text-slate-400" />
              <span>SEARCH_CMD</span>
              <span className="text-[10px] text-slate-300 bg-neutral-800 px-1 border border-neutral-700">
                Ctrl+K
              </span>
            </button>

            {/* System Status Text */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-green-400 text-[11px]">
              <span className="text-green-500 font-bold">[OK]</span>
              <span>SCRAPERS: 4/4</span>
            </div>

            {/* Notifications Button */}
            <button className="p-1.5 text-slate-400 hover:text-white bg-neutral-900 border border-neutral-800">
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* Avatar */}
            <div className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-slate-300">
              ROOT
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
