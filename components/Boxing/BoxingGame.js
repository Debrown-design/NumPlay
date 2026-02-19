import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { generateIntegerQuestion } from '../../services/mathServices.js';
import Button from '../Button.js';
import { Swords, Trophy, Clock, Zap, ShieldAlert, Heart, Activity } from 'lucide-react';

const html = htm.bind(React.createElement);

const BoxerSVG = ({ isPlayer, animation, isCrashed }) => {
  const colorMain = isPlayer ? '#3b82f6' : '#ef4444';
  const colorDark = isPlayer ? '#1e40af' : '#991b1b';
  const colorLight = isPlayer ? '#93c5fd' : '#fca5a5';
  
  const isAttacking = (isPlayer && animation === 'player_punch') || (!isPlayer && animation === 'cpu_punch');
  const isTakingDamage = (!isPlayer && animation === 'player_punch') || (isPlayer && animation === 'cpu_punch');

  return html`
    <svg viewBox="0 0 200 300" className=${`w-full h-full drop-shadow-2xl transition-all duration-300 ${isTakingDamage ? 'animate-[shake_0.1s_infinite]' : ''}`}>
      <!-- Shadow -->
      <ellipse cx="100" cy="280" rx="60" ry="15" fill="rgba(0,0,0,0.3)" />
      
      <g className=${`transition-transform duration-300 ${isAttacking ? (isPlayer ? 'translate-x-12' : '-translate-x-12') : 'animate-[float_3s_ease-in-out_infinite]'}`}>
        <!-- Body/Torso -->
        <path d="M60 100 Q100 80 140 100 L150 220 Q100 240 50 220 Z" fill=${colorMain} stroke="#000" strokeWidth="4" />
        <path d="M80 110 Q100 100 120 110 L125 180 Q100 190 75 180 Z" fill=${colorDark} opacity="0.3" />

        <!-- Head -->
        <g transform="translate(100, 70)">
           <circle r="40" fill=${isPlayer ? '#fde68a' : '#475569'} stroke="#000" strokeWidth="4" />
           ${isPlayer ? html`
             <!-- Human/Headgear -->
             <path d="M-40 0 Q-40 -45 0 -45 Q40 -45 40 0 L40 10 Q40 30 20 30 L-20 30 Q-40 30 -40 10 Z" fill=${colorDark} stroke="#000" strokeWidth="2" />
             <rect x="-25" y="-10" width="15" height="8" rx="2" fill="#fff" />
             <rect x="10" y="-10" width="15" height="8" rx="2" fill="#fff" />
           ` : html`
             <!-- Robot Face -->
             <rect x="-30" y="-15" width="60" height="30" rx="5" fill="#1e293b" stroke="#000" />
             <rect x="-20" y="-5" width="10" height="10" fill="#ef4444" className="animate-pulse" />
             <rect x="10" y="-5" width="10" height="10" fill="#ef4444" className="animate-pulse" />
             <path d="M-15 20 L15 20" stroke="#ef4444" strokeWidth="2" />
           `}
        </g>

        <!-- Arms & Gloves -->
        <!-- Rear Arm -->
        <g className=${`transition-transform duration-200 ${isAttacking ? 'translate-x-20 scale-x-125' : ''}`}>
           <path d=${isPlayer ? "M140 120 L180 140" : "M60 120 L20 140"} stroke="#000" strokeWidth="12" strokeLinecap="round" />
           <circle cx=${isPlayer ? "185" : "15"} cy="145" r="25" fill=${colorMain} stroke="#000" strokeWidth="4" />
           <path d=${isPlayer ? "M175 130 Q190 125 200 145" : "M25 130 Q10 125 0 145"} stroke="#fff" strokeWidth="3" opacity="0.4" fill="none" />
        </g>

        <!-- Front Arm -->
        <g className=${`transition-transform duration-200 ${isAttacking ? 'translate-x-32 scale-x-150' : ''}`}>
           <path d=${isPlayer ? "M140 150 L190 170" : "M60 150 L10 170"} stroke="#000" strokeWidth="15" strokeLinecap="round" />
           <circle cx=${isPlayer ? "200" : "0"} cy="175" r="30" fill=${colorMain} stroke="#000" strokeWidth="4" />
           <path d=${isPlayer ? "M185 160 Q210 150 220 180" : "M15 160 Q-10 150 -20 180"} stroke="#fff" strokeWidth="4" opacity="0.5" fill="none" />
        </g>
      </g>
    </svg>
  `;
};

const BoxingGame = ({ progress, updateProgress, onExit }) => {
  const [gameState, setGameState] = useState('COUNTDOWN');
  const [countdown, setCountdown] = useState(3);
  const [playerHp, setPlayerHp] = useState(100);
  const [cpuHp, setCpuHp] = useState(100);
  const [playerSp, setPlayerSp] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [animation, setAnimation] = useState(null);

  const MAX_QUESTIONS = 20;
  const isFinalized = useRef(false);

  useEffect(() => {
    if (gameState === 'COUNTDOWN') {
      const timer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timer);
            setGameState('FIGHTING');
            nextQuestion();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const nextQuestion = () => {
    if (questionCount >= MAX_QUESTIONS || playerHp <= 0 || cpuHp <= 0) {
      finishGame();
      return;
    }
    setCurrentQuestion(generateIntegerQuestion(progress.level));
    setQuestionCount(prev => prev + 1);
  };

  const handleAnswer = (idx) => {
    if (feedback) return;

    const isCorrect = idx === currentQuestion.correctAnswerIndex;
    if (isCorrect) {
      setFeedback('CORRECT');
      setAnimation('player_punch');
      setSessionScore(s => s + 500);
      
      const isCritical = playerSp >= 100;
      const damage = isCritical ? 25 : 10;
      setCpuHp(h => Math.max(0, h - damage));
      setPlayerSp(s => isCritical ? 0 : Math.min(100, s + 34));
      
      setTimeout(() => {
        setAnimation(null);
        setFeedback(null);
        if (cpuHp - damage <= 0) finishGame();
        else nextQuestion();
      }, 1000);
    } else {
      setFeedback('WRONG');
      setAnimation('cpu_punch');
      setPlayerHp(h => Math.max(0, h - 15));
      setPlayerSp(s => Math.max(0, s - 20));
      
      setTimeout(() => {
        setAnimation(null);
        setFeedback(null);
        if (playerHp - 15 <= 0) finishGame();
        else nextQuestion();
      }, 1000);
    }
  };

  const finishGame = () => {
    if (isFinalized.current) return;
    setGameState('FINISHED');
    isFinalized.current = true;

    const won = cpuHp <= 0;
    const finalScore = sessionScore + (won ? 5000 : 0) + (playerHp * 50);
    
    const historyEntry = { date: new Date().toISOString(), score: finalScore, won };
    updateProgress({
      totalFights: progress.totalFights + 1,
      wins: won ? progress.wins + 1 : progress.wins,
      highScore: Math.max(progress.highScore, finalScore),
      lifetimeScore: progress.lifetimeScore + finalScore,
      history: [...progress.history, historyEntry]
    });
  };

  const FighterContainer = ({ isPlayer, hp, sp }) => {
    return html`
      <div className="relative w-72 md:w-96 h-[500px] flex flex-col items-center justify-end">
        <!-- HUD Bars -->
        <div className=${`absolute -top-16 ${isPlayer ? 'left-0' : 'right-0'} w-full space-y-3 px-4 z-50`}>
            <div className="flex items-center gap-2">
               <${Heart} size=${18} className="text-red-500 fill-red-500" />
               <div className="flex-1 h-4 bg-slate-900 rounded-full border-2 border-white/20 overflow-hidden shadow-lg">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style=${{ width: `${hp}%` }} />
               </div>
            </div>
            ${isPlayer && html`
              <div className="flex items-center gap-2">
                 <${Zap} size=${18} className="text-yellow-500 fill-yellow-500" />
                 <div className="flex-1 h-3 bg-slate-900 rounded-full border border-white/10 overflow-hidden">
                    <div className=${`h-full ${sp >= 100 ? 'bg-yellow-400 animate-pulse shadow-[0_0_15px_#facc15]' : 'bg-blue-500'} transition-all duration-500`} style=${{ width: `${sp}%` }} />
                 </div>
              </div>
            `}
            <div className=${`text-[10px] font-black uppercase tracking-widest text-center ${isPlayer ? 'text-blue-400' : 'text-red-400'}`}>
                ${isPlayer ? 'CHAMPION UNIT' : 'CORE-BOT v4.2'}
            </div>
        </div>

        <div className="w-full h-full">
            <${BoxerSVG} isPlayer=${isPlayer} animation=${animation} />
        </div>
      </div>
    `;
  };

  return html`
    <div className="relative w-full h-screen bg-[#020617] overflow-hidden flex flex-col items-center justify-center font-sans">
      <!-- Cyber Ring Background -->
      <div className="absolute inset-0 z-0 opacity-30" style=${{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, transparent 80%), linear-gradient(rgba(59, 130, 246, 0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 2px, transparent 2px)', backgroundSize: '100% 100%, 80px 80px, 80px 80px' }} />
      
      <!-- Top HUD -->
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-30 pointer-events-none">
          <div className="bg-black/80 p-5 rounded-2xl border border-blue-500/30 backdrop-blur-xl shadow-2xl">
             <div className="text-[10px] text-blue-500 font-black tracking-[0.3em] uppercase mb-1">Impact Rating</div>
             <div className="text-5xl arcade-font italic text-white">${sessionScore}</div>
          </div>

          <div className="text-center">
             <div className="text-8xl font-black arcade-font italic text-white mb-2 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">
               ROUND ${questionCount}<span className="text-2xl opacity-40 ml-2">/20</span>
             </div>
             <div className="flex items-center justify-center gap-3 text-sm font-bold text-red-500 animate-pulse uppercase tracking-[0.4em]">
                <${Activity} size=${16} /> Link Status: Optimized
             </div>
          </div>

          <div className="pointer-events-auto">
            <${Button} variant="secondary" onClick=${onExit} className="shadow-2xl border-white/10 uppercase tracking-widest text-xs">
                Abort Mission
            <//>
          </div>
      </div>

      <!-- Combat Arena -->
      <div className="relative w-full max-w-7xl flex justify-between items-end px-12 mt-20">
          <${FighterContainer} isPlayer=${true} hp=${playerHp} sp=${playerSp} />
          
          ${gameState === 'COUNTDOWN' && html`
            <div className="absolute inset-0 flex items-center justify-center z-[100]">
                <div className="text-[15rem] arcade-font italic text-yellow-400 animate-ping drop-shadow-[0_0_60px_rgba(250,204,21,0.7)]">
                    ${countdown === 0 ? 'GO!' : countdown}
                </div>
            </div>
          `}

          <div className="relative z-10 flex flex-col items-center mb-20">
             <div className="text-9xl arcade-font text-white/5 italic select-none">VERSUS</div>
             <div className="w-1 h-64 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"></div>
          </div>

          <${FighterContainer} isPlayer=${false} hp=${cpuHp} sp=${0} />
      </div>

      <!-- Logic Interaction Interface -->
      ${gameState === 'FIGHTING' && currentQuestion && html`
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-40 animate-in slide-in-from-bottom duration-700">
           <div className=${`bg-slate-900/90 backdrop-blur-2xl border-b-8 ${playerSp >= 100 ? 'border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.4)]' : 'border-blue-600 shadow-[0_0_60px_rgba(59,130,246,0.3)]'} p-12 rounded-[4rem]`}>
              ${playerSp >= 100 && html`
                <div className="text-center text-yellow-400 font-black tracking-[1.2em] mb-6 text-sm uppercase animate-bounce drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                   CRITICAL IMPACT READY
                </div>
              `}
              <h2 className="text-7xl font-black text-center text-white mb-12 math-font tracking-tighter drop-shadow-lg">
                ${currentQuestion.question}
              </h2>
              <div className="grid grid-cols-2 gap-8">
                 ${currentQuestion.options.map((opt, i) => html`
                   <button 
                    key=${i} 
                    onClick=${() => handleAnswer(i)}
                    className="bg-slate-800 hover:bg-blue-600 text-white p-8 rounded-[2rem] font-black text-4xl border-b-8 border-black transition-all active:translate-y-2 active:border-b-0 shadow-2xl hover:scale-[1.02]"
                   >
                     ${opt}
                   </button>
                 `)}
              </div>
           </div>
        </div>
      `}

      <!-- Feedback HUD -->
      ${feedback && html`
        <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className=${`text-[12rem] font-black italic arcade-font animate-in zoom-in duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] ${feedback === 'CORRECT' ? 'text-green-400' : 'text-red-500'}`}>
                ${feedback === 'CORRECT' ? 'HIT!' : 'MISS!'}
            </div>
        </div>
      `}

      <!-- Post-Match Briefing -->
      ${gameState === 'FINISHED' && html`
        <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in duration-1000">
             <div className="text-center p-20 border-8 border-blue-600 rounded-[5rem] bg-slate-900 shadow-[0_0_200px_rgba(59,130,246,0.5)] max-w-3xl w-full">
                 <${Trophy} size=${150} className=${`mx-auto mb-10 ${cpuHp <= 0 ? 'text-yellow-400 animate-bounce' : 'text-slate-700 grayscale opacity-40'}`} />
                 <h2 className="text-9xl text-white mb-4 arcade-font tracking-tighter uppercase italic">
                    ${cpuHp <= 0 ? 'VICTORY' : 'DEFEATED'}
                 </h2>
                 <p className="text-blue-400/60 mb-14 font-mono uppercase tracking-[0.6em] text-2xl">
                    ${cpuHp <= 0 ? 'Arena Supremacy Established' : 'Sync Integrity Failure'}
                 </p>
                 
                 <div className="bg-black/60 p-12 rounded-[3rem] border border-white/10 mb-14 shadow-inner">
                    <div className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Combat Performance Index</div>
                    <div className="text-9xl arcade-font text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                        ${(sessionScore + (cpuHp <= 0 ? 5000 : 0) + (playerHp * 50)).toLocaleString()}
                    </div>
                 </div>

                 <${Button} onClick=${onExit} className="w-full text-5xl py-12 shadow-2xl arcade-font italic bg-blue-600 border-blue-900 hover:scale-[1.05] transition-transform">
                    EXIT ARENA
                 <//>
             </div>
        </div>
      `}

      <style>${`
        @keyframes shake {
            0% { transform: translate(3px, 3px); }
            25% { transform: translate(-3px, -3px); }
            50% { transform: translate(3px, -3px); }
            75% { transform: translate(-3px, 3px); }
            100% { transform: translate(0, 0); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  `;
};

export default BoxingGame;