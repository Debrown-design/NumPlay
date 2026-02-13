import React, { useState, useEffect, useCallback } from 'react';
import htm from 'htm';
import WelcomeScreen from './components/WelcomeScreen.js';
import ArcadeScreen from './components/ArcadeScreen.js';
import GameDetailsScreen from './components/GameDetails.js';
import NinjaDashboard from './components/MathNinja/NinjaDashboard.js';
import NinjaGame from './components/MathNinja/NinjaGame.js';
import RacerDashboard from './components/MathRacers/RacerDashboard.js';
import RacerGame from './components/MathRacers/RacerGame.js';
import BoxingDashboard from './components/Boxing/BoxingDashboard.js';
//import BoxingGame from './components/Boxing/BoxingGame.js';
import { storageService } from './services/storageServices.js';
import { Loader2, Database, WifiOff, ShieldCheck } from 'lucide-react';

const html = htm.bind(React.createElement);

const INITIAL_NINJA = {
  level: 1, currentScore: 0, highScore: 0, lifetimeScore: 0,
  totalRoundsPlayed: 0, lives: 3, livesLostAt: [],
  unlockedSwords: ['basic'], equippedSwordId: 'basic', history: []
};

const INITIAL_RACER = {
  wins: 0, totalRaces: 0, rankPoints: 0, currentSessionScore: 0,
  unlockedCars: ['velocity-vector'], equippedCarId: 'velocity-vector', history: []
};

const INITIAL_BOXING = {
  level: 1, wins: 0, totalFights: 0, highScore: 0, lifetimeScore: 0, history: []
};

const REGEN_TIME = 120000; // 2 minutes

const AppStage = {
  WELCOME: 'WELCOME',
  ARCADE: 'ARCADE',
  GAME_DETAILS: 'GAME_DETAILS',
  NINJA_DASHBOARD: 'NINJA_DASHBOARD',
  NINJA_GAME: 'NINJA_GAME',
  NINJA_INTRO: 'NINJA_INTRO',
  RACER_DASHBOARD: 'RACER_DASHBOARD',
  RACER_GAME: 'RACER_GAME',
  BOXING_DASHBOARD: 'BOXING_DASHBOARD',
  BOXING_GAME: 'BOXING_GAME'
};

export default function App() {
  const [stage, setStage] = useState(AppStage.WELCOME);
  const [user, setUser] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({ online: false, mode: 'Local' });

  const [ninjaProgress, setNinjaProgress] = useState(INITIAL_NINJA);
  const [racerProgress, setRacerProgress] = useState(INITIAL_RACER);
  const [boxingProgress, setBoxingProgress] = useState(INITIAL_BOXING);

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      const status = await storageService.checkConnection();
      setDbStatus(status);

      try {
        const savedUser = await storageService.loadUser();
        if (savedUser) {
          setUser(savedUser);
          setStage(AppStage.ARCADE);
        }

        const [savedNinja, savedRacer, savedBoxing] = await Promise.all([
          storageService.loadNinjaProgress(),
          storageService.loadRacerProgress(),
          localStorage.getItem('prime_lab_boxing_v1') ? JSON.parse(localStorage.getItem('prime_lab_boxing_v1')) : INITIAL_BOXING
        ]);

        if (savedNinja) setNinjaProgress(savedNinja);
        if (savedRacer) setRacerProgress(savedRacer);
        if (savedBoxing) setBoxingProgress(savedBoxing);
      } catch (error) {
        console.error("Data recovery failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    const regenInterval = setInterval(() => {
      setNinjaProgress(prev => {
        if (prev.lives >= 3 || prev.livesLostAt.length === 0) return prev;
        
        const now = Date.now();
        const remainingLosses = prev.livesLostAt.filter(lostTime => (now - lostTime) < REGEN_TIME);
        const recoveredCount = prev.livesLostAt.length - remainingLosses.length;
        
        if (recoveredCount > 0) {
          return {
            ...prev,
            lives: Math.min(3, prev.lives + recoveredCount),
            livesLostAt: remainingLosses
          };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(regenInterval);
  }, []);

  useEffect(() => {
    if (user && !isLoading) {
      storageService.saveUser(user);
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      storageService.saveNinjaProgress(ninjaProgress);
      storageService.saveRacerProgress(racerProgress);
      localStorage.setItem('prime_lab_boxing_v1', JSON.stringify(boxingProgress));
    }
  }, [ninjaProgress, racerProgress, boxingProgress, isLoading]);

  const handleUserEnter = (newUser) => {
    setUser(newUser);
    setStage(AppStage.ARCADE);
  };

  const handleEnterLab = (gameId) => {
    setSelectedGameId(gameId);
    if (gameId === 'math-ninja') setStage(AppStage.NINJA_DASHBOARD);
    else if (gameId === 'math-mayhem-racers') setStage(AppStage.RACER_DASHBOARD);
    else if (gameId === 'integer-impact') setStage(AppStage.BOXING_DASHBOARD);
  };

  const handleViewDetails = (gameId) => {
    setSelectedGameId(gameId);
    setStage(AppStage.GAME_DETAILS);
  };

  const updateNinjaProgress = useCallback((update) => {
    setNinjaProgress(prev => ({ ...prev, ...update }));
  }, []);

  const updateRacerProgress = useCallback((update) => {
    setRacerProgress(prev => ({ ...prev, ...update }));
  }, []);

  const updateBoxingProgress = useCallback((update) => {
    setBoxingProgress(prev => ({ ...prev, ...update }));
  }, []);

  const handleSignOut = async () => {
    await storageService.clearAll();
    localStorage.removeItem('prime_lab_boxing_v1');
    setUser(null);
    setNinjaProgress(INITIAL_NINJA);
    setRacerProgress(INITIAL_RACER);
    setBoxingProgress(INITIAL_BOXING);
    setSelectedGameId(null);
    setStage(AppStage.WELCOME);
  };

  if (isLoading) {
    return html`
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <${Loader2} className="animate-spin text-cyan-500 mb-6" size=${64} />
        <h2 className="text-3xl arcade-font tracking-widest animate-pulse">BOOTING NumPlay...</h2>
        <div className="flex items-center gap-2 text-gray-500 font-mono text-xs mt-6 border border-white/10 px-4 py-2 rounded-full">
          <${Database} size=${14} className="animate-bounce" /> SYNCING WITH CORE DATA UNIT
        </div>
      </div>
    `;
  }

  return html`
    <div className="min-h-screen ninja-bg bg-fixed bg-cover overflow-x-hidden selection:bg-cyan-500 selection:text-white">

      ${stage === AppStage.WELCOME && html`<${WelcomeScreen} onEnter=${handleUserEnter} />`}
      
      ${stage === AppStage.ARCADE && user && html`
        <${ArcadeScreen} 
          user=${user} 
          onEnterLab=${handleEnterLab} 
          onViewDetails=${handleViewDetails} 
          onSignOut=${handleSignOut} 
        />
      `}

      ${stage === AppStage.GAME_DETAILS && selectedGameId && html`
        <${GameDetailsScreen} 
          gameId=${selectedGameId} 
          onBack=${() => setStage(AppStage.ARCADE)} 
          onPlay=${handleEnterLab} 
        />
      `}

      ${stage === AppStage.NINJA_DASHBOARD && html`
        <${NinjaDashboard} 
          progress=${ninjaProgress} 
          onPlay=${() => setStage(AppStage.NINJA_GAME)} 
          onBack=${() => setStage(AppStage.ARCADE)} 
          onLevelUp=${() => updateNinjaProgress({ level: Math.min(12, ninjaProgress.level + 1) })} 
          updateProgress=${updateNinjaProgress}
        />
      `}
      
      ${stage === AppStage.NINJA_GAME && html`
        <${NinjaGame} 
          progress=${ninjaProgress} 
          updateProgress=${updateNinjaProgress} 
          onExit=${() => setStage(AppStage.NINJA_DASHBOARD)} 
        />
      `}

      ${stage === AppStage.RACER_DASHBOARD && html`
        <${RacerDashboard} 
          progress=${racerProgress} 
          onPlay=${() => setStage(AppStage.RACER_GAME)} 
          onBack=${() => setStage(AppStage.ARCADE)} 
          updateProgress=${updateRacerProgress} 
        />
      `}
      
      ${stage === AppStage.RACER_GAME && html`
        <${RacerGame} 
          progress=${racerProgress} 
          updateProgress=${updateRacerProgress} 
          onExit=${() => setStage(AppStage.RACER_DASHBOARD)} 
        />
      `}

      ${stage === AppStage.BOXING_DASHBOARD && html`
        <${BoxingDashboard} 
          progress=${boxingProgress} 
          onPlay=${() => setStage(AppStage.BOXING_GAME)} 
          onBack=${() => setStage(AppStage.ARCADE)} 
          updateProgress=${updateBoxingProgress} 
        />
      `}

      ${stage === AppStage.BOXING_GAME && html`
        <${BoxingGame} 
          progress=${boxingProgress} 
          updateProgress=${updateBoxingProgress} 
          onExit=${() => setStage(AppStage.BOXING_DASHBOARD)} 
        />
      `}
    </div>
  `;
}
