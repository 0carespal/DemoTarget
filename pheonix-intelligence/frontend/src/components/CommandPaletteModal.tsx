import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string, payload?: any) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectAction('openPalette');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectAction]);

  if (!isOpen) return null;

  const commands = [
    { id: 'nav-dash', label: 'Go to Dashboard', category: 'NAV', action: () => onSelectAction('nav', 'dashboard') },
    { id: 'nav-search', label: 'Filter Talks by Keyword', category: 'FILTER', action: () => onSelectAction('search', searchTerm || '') },
    { id: 'view-timeline', label: 'View Conference Schedule', category: 'EVENTS', action: () => onSelectAction('nav', 'dashboard') },
    { id: 'view-scrapers', label: 'Check Data Pipeline Status', category: 'TELEMETRY', action: () => onSelectAction('nav', 'dashboard') },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cmd.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 font-mono">
      <div 
        className="w-full max-w-xl bg-[#121212] border border-neutral-700 p-0 shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="relative flex items-center border-b border-neutral-800 px-3 py-2.5">
          <span className="text-green-500 font-bold mr-2 text-sm">&gt;</span>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="TYPE_COMMAND_OR_KEYWORD..."
            className="w-full bg-transparent text-slate-100 placeholder-neutral-600 text-xs focus:outline-none font-mono"
          />
          <button 
            onClick={onClose}
            className="px-1.5 py-0.5 text-slate-500 hover:text-white bg-neutral-900 border border-neutral-800 text-xs"
          >
            [ESC]
          </button>
        </div>

        {/* Command list */}
        <div className="p-1.5 max-h-80 overflow-y-auto space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500 font-mono">
              NO MATCHES FOUND. PRESS ENTER TO FILTER BY "{searchTerm}"
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-xs bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-slate-200 hover:text-green-400 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500 font-bold">&gt;</span>
                    <span>{cmd.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] bg-neutral-950 px-1.5 py-0.2 text-slate-400 border border-neutral-800">
                      [{cmd.category}]
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="border-t border-neutral-800 bg-[#0a0a0a] px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-500">
          <div>
            <span>[UP/DOWN] NAVIGATE</span> • <span>[ENTER] SELECT</span>
          </div>
          <span>PHOENIX_CLI</span>
        </div>
      </div>
    </div>
  );
};
