export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface GameSettings {
  playerName: string;
  genre: string;
}

export const GENRE_OPTIONS: { id: string; label: string; icon: string; themeColor: string }[] = [
  {
    id: 'cyberpunk',
    label: '🌌 Cyberpunk 2099 (Neon, Hacker, & Cyborg)',
    icon: '🌌',
    themeColor: 'from-cyan-500/20 to-fuchsia-500/20 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'dark-fantasy',
    label: '🗡️ Dark Fantasy (Sihir, Monster, & Kerajaan)',
    icon: '🗡️',
    themeColor: 'from-amber-500/20 to-red-500/20 text-amber-400 border-amber-500/30'
  },
  {
    id: 'post-apocalyptic',
    label: '🧟 Post-Apocalyptic (Zombie & Survival)',
    icon: '🧟',
    themeColor: 'from-emerald-500/20 to-lime-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'galactic-explorer',
    label: '🚀 Galactic Explorer (Luar Angkasa & Alien)',
    icon: '🚀',
    themeColor: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30'
  }
];

