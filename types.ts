export enum AppStage {
  WELCOME = 'WELCOME',
  ARCADE = 'ARCADE',
  GAME_DETAILS = 'GAME_DETAILS',
  NINJA_INTRO = 'NINJA_INTRO',
  NINJA_DASHBOARD = 'NINJA_DASHBOARD',
  NINJA_GAME = 'NINJA_GAME',
  RACER_DASHBOARD = 'RACER_DASHBOARD',
  RACER_GAME = 'RACER_GAME',
  GAME_OVER = 'GAME_OVER'
}

export interface User {
  name: string;
  age: string;
  avatarId: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon?: string; // Emoji icon
  image?: string; // Image URL
  bonus: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface NinjaProgress {
  level: number; // 1-12 (Grade levels)
  currentScore: number; // Score of the current active run
  highScore: number; // Best score achieved in a single run
  lifetimeScore: number; // Total accumulated score across all games
  totalRoundsPlayed: number;
  lives: number;
  livesLostAt: number[]; // Array of timestamps for each lost life
  unlockedSwords: string[]; // IDs of unlocked swords
  equippedSwordId: string;
  history: { date: string; score: number }[]; // History of past game scores
}

export interface RacerProgress {
  wins: number;
  totalRaces: number;
  rankPoints: number; // For leaderboard (High Score)
  currentSessionScore: number; // Score tracked for "Resume Game" functionality
  unlockedCars: string[];
  equippedCarId: string;
  history: { date: string; rank: number; score: number }[];
}

export interface GameConfig {
  score: number;
  items: InventoryItem[];
  highScore: number;
}
