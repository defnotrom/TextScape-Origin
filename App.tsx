import React, { useState, useEffect, useRef } from 'react';
import { Menu, Sparkles, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Message, GameSettings, GENRE_OPTIONS } from './types';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<GameSettings>({
    playerName: 'Petualang',
    genre: GENRE_OPTIONS[0].label,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef<boolean>(false);

  // Check config status on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch(() => {});
  }, []);

  // Scroll to bottom whenever messages or loading state changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Start or restart adventure
  const startAdventure = async (customSettings?: GameSettings) => {
    const activeSettings = customSettings || settings;
    setIsLoading(true);
    setError(null);

    const initUserPrompt = `Mulai petualangan baru di dunia ${activeSettings.genre} untuk ${activeSettings.playerName}. Buat situasi pembuka yang darurat dan berikan 3 pilihan aksi awal!`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: initUserPrompt }],
          playerName: activeSettings.playerName,
          genre: activeSettings.genre,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memulai petualangan');
      }

      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: data.text,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      console.error('Failed to start adventure:', err);
      setError(err.message || 'Gagal menghubungkan ke Gemini Game Master.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-init on first load
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      startAdventure();
    }
  }, []);

  // Handle player action submission
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      // Send conversation history to server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          playerName: settings.playerName,
          genre: settings.genre,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses aksi.');
      }

      const gmResponse: Message = {
        id: `gm-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, gmResponse]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Gagal menerima tanggapan dari Game Master.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setMessages([]);
    startAdventure();
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      {/* Sidebar for settings, genre selection, restart */}
      <Sidebar
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings((prev) => ({ ...prev, ...newSettings }));
        }}
        onRestart={handleRestart}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        hasApiKey={hasApiKey}
        turnCount={messages.filter((m) => m.role === 'user').length}
      />

      {/* Main Game Interface */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar Header */}
        <header
          id="app-header"
          className="h-16 shrink-0 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-10"
        >
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-btn"
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Buka Pengaturan"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>🌌</span> TextScape: All-New RPG
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Interactive AI GM
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Petualangan Teks Interaktif — Didukung oleh Gemini AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50 text-xs text-slate-300">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[200px]">{settings.genre.split('(')[0].trim()}</span>
            </div>

            <button
              id="top-restart-btn"
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="Mulai Ulang Petualangan"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Restart</span>
            </button>
          </div>
        </header>

        {/* Narrative & Chat Stream Area */}
        <div
          id="chat-scroll-area"
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 max-w-4xl w-full mx-auto"
        >
          {/* Error Banner */}
          {error && (
            <div
              id="error-banner"
              className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-300">Terjadi Kesalahan</p>
                <p className="text-xs sm:text-sm text-red-200/90 mt-1">{error}</p>
                <button
                  id="error-retry-btn"
                  onClick={() => (messages.length === 0 ? startAdventure() : handleSendMessage('Lanjutkan...'))}
                  className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded-md bg-red-800/40 hover:bg-red-700/50 text-red-100 text-xs font-medium border border-red-600/40 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Coba Lagi
                </button>
              </div>
            </div>
          )}

          {/* Initial Loading placeholder */}
          {messages.length === 0 && isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-sm -z-10 animate-pulse" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-200">
                  🎲 Game Master sedang merancang duniamu...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mempersiapkan semesta {settings.genre.split('(')[0]} untuk {settings.playerName}
                </p>
              </div>
            </div>
          )}

          {/* Render Story Messages */}
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLatest={index === messages.length - 1}
              onSelectOption={handleSendMessage}
              disabled={isLoading}
            />
          ))}

          {/* Active Generation Indicator */}
          {messages.length > 0 && isLoading && (
            <div
              id="loading-indicator"
              className="flex gap-3 sm:gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 py-1">
                <span>🎲 Game Master sedang merespons...</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Chat / Action Input Footer */}
        <footer
          id="chat-footer"
          className="shrink-0 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-md p-4 sm:px-6 z-10"
        >
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              disabled={messages.length === 0 && isLoading}
            />
          </div>
        </footer>
      </main>
    </div>
  );
}

