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
  icon?: string; 
  image?: string; 
  bonus: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface NinjaProgress {
  level: number; 
  currentScore: number; 
  highScore: number; 
  lifetimeScore: number; 
  totalRoundsPlayed: number;
  lives: number;
  livesLostAt: number[]; 
  unlockedSwords: string[]; 
  equippedSwordId: string;
  history: { date: string; score: number }[]; 
}

export interface RacerProgress {
  wins: number;
  totalRaces: number;
  rankPoints: number; 
  currentSessionScore: number; 
  unlockedCars: string[];
  equippedCarId: string;
  history: { date: string; rank: number; score: number }[];
}

export interface GameConfig {
  score: number;
  items: InventoryItem[];
  highScore: number;
}
