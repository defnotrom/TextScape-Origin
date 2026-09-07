import React, { useState, FormEvent, KeyboardEvent } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickNumber = (num: number) => {
    if (isLoading || disabled) return;
    onSend(`Pilih opsi ${num}`);
  };

  return (
    <div id="chat-input-container" className="space-y-2">
      {/* Quick Option 1 / 2 / 3 shortcut pills */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="hidden sm:inline">Pilih cepat:</span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              id={`quick-btn-${num}`}
              type="button"
              disabled={isLoading || disabled}
              onClick={() => handleQuickNumber(num)}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-indigo-600/40 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 hover:border-indigo-500/40 transition-colors disabled:opacity-40"
            >
              Opsi {num}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          id="chat-text-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Ketik Opsi (1/2/3) atau tindakan bebasmu di sini..."
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3.5 pr-24 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
        />
        <div className="absolute right-2 flex items-center gap-1">
          <button
            id="chat-send-button"
            type="submit"
            disabled={!input.trim() || isLoading || disabled}
            className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            title="Kirim (Enter)"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

