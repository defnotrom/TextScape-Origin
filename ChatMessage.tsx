import React from 'react';
import Markdown from 'react-markdown';
import { Bot, User, Sparkles } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
  onSelectOption?: (optionText: string) => void;
  disabled?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLatest,
  onSelectOption,
  disabled = false,
}) => {
  const isAssistant = message.role === 'assistant';

  // Extract numbered options (e.g. 1. ... 2. ... 3. ...) to provide convenient quick-action chips
  const options = React.useMemo(() => {
    if (!isAssistant || !isLatest) return [];
    const lines = message.content.split('\n');
    const detected: { number: string; text: string }[] = [];
    for (const line of lines) {
      const match = line.trim().match(/^([1-3])\.\s*(.+)/);
      if (match) {
        detected.push({ number: match[1], text: match[2].replace(/\*\*/g, '').trim() });
      }
    }
    return detected;
  }, [message.content, isAssistant, isLatest]);

  return (
    <div
      id={`message-${message.id}`}
      className={`flex gap-3 sm:gap-4 p-4 rounded-xl transition-all ${
        isAssistant
          ? 'bg-slate-900/80 border border-slate-800/80 shadow-md shadow-black/20'
          : 'bg-indigo-950/40 border border-indigo-500/20 ml-auto max-w-2xl'
      }`}
    >
      <div className="shrink-0 pt-0.5">
        {isAssistant ? (
          <div
            id={`avatar-${message.id}`}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10"
          >
            <Bot className="w-5 h-5 text-indigo-100" />
          </div>
        ) : (
          <div
            id={`avatar-${message.id}`}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10"
          >
            <User className="w-5 h-5 text-emerald-100" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">
            {isAssistant ? 'Game Master' : 'Pemain'}
          </span>
          {isAssistant && (
            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400/90 font-medium">
              <Sparkles className="w-3 h-3" /> AI GM
            </span>
          )}
        </div>

        <div className="text-sm sm:text-base leading-relaxed text-slate-200">
          {isAssistant ? (
            <div className="markdown-body">
              <Markdown>{message.content}</Markdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Quick action option chips for the latest GM message */}
        {options.length > 0 && onSelectOption && (
          <div className="pt-3 border-t border-slate-800/60 mt-3 space-y-2">
            <p className="text-xs font-medium text-slate-400">Pilihan Cepat:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {options.map((opt) => (
                <button
                  key={opt.number}
                  id={`quick-option-${message.id}-${opt.number}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectOption(`Pilih opsi ${opt.number}: ${opt.text}`)}
                  className="px-3 py-2 text-left rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-indigo-600/30 text-indigo-200 hover:text-white border border-indigo-500/20 hover:border-indigo-400/50 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-start gap-2 group"
                >
                  <span className="font-bold text-indigo-400 group-hover:text-indigo-300">
                    {opt.number}.
                  </span>
                  <span className="line-clamp-2">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
