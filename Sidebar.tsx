import React from 'react';
import { Settings, RefreshCw, Sparkles, User, Compass, X, KeyRound, CheckCircle2 } from 'lucide-react';
import { GameSettings, GENRE_OPTIONS } from '../types';

interface SidebarProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onRestart: () => void;
  isOpen: boolean;
  onClose: () => void;
  hasApiKey: boolean;
  turnCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  onUpdateSettings,
  onRestart,
  isOpen,
  onClose,
  hasApiKey,
  turnCount,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-80 bg-slate-900/95 border-r border-slate-800 p-5 flex flex-col justify-between overflow-y-auto transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Settings className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-100 text-base">Pengaturan Game</h2>
            </div>
            <button
              id="sidebar-close-btn"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Gemini AI Status */}
          <div
            id="gemini-status-card"
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                Gemini AI Status
              </span>
              {hasApiKey ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Terhubung
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium">
                  Perlu Konfigurasi
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {hasApiKey
                ? 'Didukung oleh Gemini 3.6 Flash sebagai Game Master interaktif Anda.'
                : 'Kunci API dapat dikonfigurasi melalui menu Settings > Secrets di platform.'}
            </p>
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* Character Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-sm">Buat Karakter</h3>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="player-name-input" className="block text-xs font-medium text-slate-400">
                Nama Karakter:
              </label>
              <input
                id="player-name-input"
                type="text"
                value={settings.playerName}
                onChange={(e) => onUpdateSettings({ playerName: e.target.value })}
                placeholder="Misal: Petualang, Romi, Cipher..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="genre-select" className="block text-xs font-medium text-slate-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                Pilih Semesta Dunia:
              </label>
              <select
                id="genre-select"
                value={settings.genre}
                onChange={(e) => onUpdateSettings({ genre: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {GENRE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.label} className="bg-slate-900 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Adventure stats */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Giliran Cerita</span>
              <span className="font-mono text-indigo-400 font-semibold">{turnCount} giliran</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Model GM</span>
              <span className="text-slate-300 font-mono">gemini-3.6-flash</span>
            </div>
          </div>
        </div>

        {/* Restart Button at bottom of sidebar */}
        <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-3">
          <button
            id="restart-adventure-btn"
            type="button"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Restart Petualangan
          </button>
          <p className="text-[11px] text-center text-slate-500">
            Mereset alur cerita dan memulai dunia baru dengan karakter yang dipilih.
          </p>
        </div>
      </aside>
    </>
  );
};

