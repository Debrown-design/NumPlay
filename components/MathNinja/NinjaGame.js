import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { generateMathQuestion } from '../../services/mathServices.js';
import Button from '../Button.js';
import { Heart, XCircle, Zap, Clock, Trophy, ShieldAlert, Award } from 'lucide-react';

const html = htm.bind(React.createElement);

const SWORDS = {
  'basic': { id: 'basic', img: 'https://medievalextreme.com/wp-content/uploads/2019/10/A3651DA2-3A2B-4049-80F8-19666531B297.jpeg', color: '#cbd5e1' }, 
  'gold': { id: 'gold', img: 'https://spirit.scene7.com/is/image/Spirit/01588672-a?$Detail$', color: '#fbbf24' }, 
  'diamond': { id: 'diamond', img: 'https://wallpapercave.com/wp/wp6922828.jpg', color: '#60a5fa' } 
};

const FRUIT_MODELS = {
  apple: { emoji: '🍎', color: 'bg-red-600' },
  orange: { emoji: '🍊', color: 'bg-orange-500' },
  watermelon: { emoji: '🍉', color: 'bg-green-600' },
  grapes: { emoji: '🍇', color: 'bg-purple-600' },
  strawberry: { emoji: '🍓', color: 'bg-red-500' },
  pineapple: { emoji: '🍍', color: 'bg-yellow-600' },
  peach: { emoji: '🍑', color: 'bg-orange-400' },
  banana: { emoji: '🍌', color: 'bg-yellow-400' }
};

const NinjaGame = ({ progress, updateProgress, onExit }) => {
  const [phase, setPhase] = useState('SLICING');
  const [sessionScore, setSessionScore] = useState(progress?.currentScore || 0);
  const [lives, setLives] = useState(progress?.lives || 3);
  const [livesLostAt, setLivesLostAt] = useState(progress?.livesLostAt || []);
  const [quizTriggerTimer, setQuizTriggerTimer] = useState(15);
  const [quizTimer, setQuizTimer] = useState(15);
  const [actors, setActors] = useState([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSlashing, setIsSlashing] = useState(false);
  const [streak, setStreak] = useState(0);
  
  const requestRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const gameAreaRef = useRef(null);
  const cursorRef = useRef({ x: 0, y: 0 });
  const isSlashingRef = useRef(false);
  const isFinalized = useRef(false);

  useEffect(() => {
    setCurrentQuestion(generateMathQuestion(progress?.level || 1));
  }, [progress?.level]);

  useEffect(() => {
    let interval;
    if (phase === 'SLICING') {
      interval = setInterval(() => {
        setQuizTriggerTimer(t => {
          if (t <= 1) {
            startQuizPhase();
            return 15;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    let interval;
    if (phase === 'QUIZ') {
      interval = setInterval(() => {
        setQuizTimer(t => {
          if (t <= 1) {
            handleTimeout();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    const interval = setInterval(() => {
        setTrail(prev => prev.filter(p => Date.now() - p.id < 150));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const finalizeSession = (finalScore) => {
    if (isFinalized.current) return;
    isFinalized.current = true;

    const historyEntry = { date: new Date().toISOString(), score: finalScore };
    updateProgress({
        totalRoundsPlayed: (progress?.totalRoundsPlayed || 0) + 1,
        highScore: Math.max(progress?.highScore || 0, finalScore),
        lifetimeScore: (progress?.lifetimeScore || 0) + finalScore,
        history: [...(progress?.history || []), historyEntry],
        currentScore: 0, 
        lives: lives, 
        livesLostAt: livesLostAt
    });
  };

  const startQuizPhase = () => {
    setPhase('QUIZ');
    setQuizTimer(15);
    setActors([]);
  };

  const handleTimeout = () => {
    setStreak(0);
    updateProgress({ equippedSwordId: 'basic' });
    const newLost = [...livesLostAt, Date.now()];
    const newLives = Math.max(0, lives - 1);
    setLives(newLives);
    setLivesLostAt(newLost);
    setSessionScore(s => Math.max(0, s - 5));
    setFeedback({ type: 'wrong', msg: 'TIMEOUT! -5 XP, -1 Life' });
    
    setPhase('FEEDBACK');
    if (newLives <= 0) {
      finalizeSession(sessionScore);
      setTimeout(() => setPhase('GAME_OVER'));
    } else {
      setTimeout(() => {
        setFeedback(null);
        setCurrentQuestion(generateMathQuestion(progress?.level || 1));
        setPhase('SLICING');
        setQuizTriggerTimer(15);
      }, 1500);
    }
  };

  const handleExit = () => {
    if (phase === 'GAME_OVER') {
      onExit();
      return;
    }
    
    updateProgress({
      currentScore: sessionScore,
      lives: lives,
      livesLostAt: livesLostAt
    });
    onExit();
  };

  const updatePhysics = () => {
    const container = gameAreaRef.current;
    if (!container) return;

    setActors(prev => {
      return prev.map(a => {
        let nx = a.x + a.vx;
        let ny = a.y + a.vy;
        let nvx = a.vx;
        let nvy = a.vy;
        let nrot = a.rotation + a.rotSpeed;

        if (a.sliced) {
            nvy += 0.4;
            nx += nvx * 1.05;
        } else {
            if (nx <= 5 || nx >= 95) nvx = -nvx;
            if (ny <= 5 || ny >= 95) nvy = -nvy;
            nvx = Math.max(-0.6, Math.min(0.6, nvx));
            nvy = Math.max(-0.6, Math.min(0.6, nvy));
            nx = a.x + nvx;
            ny = a.y + nvy;
        }

        if (!a.sliced && phase === 'SLICING') {
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            const fx = (nx / 100) * width;
            const fy = (ny / 100) * height;
            const dist = Math.hypot(fx - cursorRef.current.x, fy - cursorRef.current.y);
            
            if (dist < 45) {
                if (!isSlashingRef.current) {
                    isSlashingRef.current = true;
                    setIsSlashing(true);
                    setTimeout(() => { isSlashingRef.current = false; setIsSlashing(false); }, 200);
                }
                if (a.type === 'bomb') setSessionScore(s => Math.max(0, s - 10));
                else setSessionScore(s => s + 10);
                
                return { 
                  ...a, 
                  sliced: true, 
                  slicedAt: Date.now(), 
                  x: nx, 
                  y: ny, 
                  vy: -0.3, 
                  vx: a.vx * 1.5, 
                  rotation: nrot 
                };
            }
        }
        return { ...a, x: nx, y: ny, vx: nvx, vy: nvy, rotation: nrot };
      }).filter(a => a.y < 150);
    });

    if (phase === 'SLICING') {
      const now = Date.now();
      if (now - lastSpawnRef.current > 1500) {
        setActors(current => {
            if (current.filter(a => !a.sliced).length < 6) {
                 const isBomb = Math.random() < 0.2;
                 const fruitKeys = Object.keys(FRUIT_MODELS);
                 const type = isBomb ? 'bomb' : fruitKeys[Math.floor(Math.random() * fruitKeys.length)];
                 
                 lastSpawnRef.current = now;
                 return [...current, { 
                    id: Math.random(), 
                    x: 15 + Math.random() * 70, 
                    y: 15 + Math.random() * 70, 
                    vx: (Math.random() - 0.5) * 0.8, 
                    vy: (Math.random() - 0.5) * 0.8, 
                    rotation: Math.random() * 360, 
                    rotSpeed: 2 + Math.random() * 5, 
                    type, 
                    sliced: false 
                 }];
            }
            return current;
        });
      }
      requestRef.current = requestAnimationFrame(updatePhysics);
    }
  };

  useEffect(() => {
    if (phase === 'SLICING') requestRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(requestRef.current);
  }, [phase]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSessionScore(s => s + 10);
      
      let unlockMsg = '';
      if (newStreak === 3 && !progress.unlockedSwords.includes('gold')) {
        updateProgress({ 
          unlockedSwords: [...progress.unlockedSwords, 'gold'],
          equippedSwordId: 'gold' 
        });
        unlockMsg = ' - GOLD SWORD EQUIPPED!';
      } else if (newStreak === 6 && !progress.unlockedSwords.includes('diamond')) {
        updateProgress({ 
          unlockedSwords: [...progress.unlockedSwords, 'diamond'],
          equippedSwordId: 'diamond' 
        });
        unlockMsg = ' - DIAMOND SWORD EQUIPPED!';
      } else if (newStreak === 3 || newStreak === 6) {
         const idToEquip = newStreak === 6 ? 'diamond' : 'gold';
         updateProgress({ equippedSwordId: idToEquip });
         unlockMsg = ` - ${idToEquip.toUpperCase()} SWORD REACTIVATED!`;
      }

      setFeedback({ type: 'correct', msg: `Correct! +10 XP${unlockMsg}` });
    } else {
      setStreak(0);
      updateProgress({ equippedSwordId: 'basic' });
      const newLost = [...livesLostAt, Date.now()];
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      setLivesLostAt(newLost);
      setSessionScore(s => Math.max(0, s - 5));
      setFeedback({ type: 'wrong', msg: 'Wrong! -5 XP, -1 Life' });
      if (newLives <= 0) {
          finalizeSession(sessionScore);
          setTimeout(() => setPhase('GAME_OVER'));
      }
    }
    setPhase('FEEDBACK');
    setTimeout(() => {
      setFeedback(null);
      setCurrentQuestion(generateMathQuestion(progress?.level || 1));
      if (lives > 0) {
        setPhase('SLICING');
        setQuizTriggerTimer(15);
      }
    }, 1500);
  };

  const handleMouseMove = (e) => {
    if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cursorRef.current = { x, y };
        setCursorPos({ x, y });
        setTrail(prev => [...prev, { x, y, id: Date.now() }]);
    }
  };

  // FULL-SCREEN GAME OVER VIEW
  if (phase === 'GAME_OVER') {
    return html`
      <div className="fixed inset-0 z-[1000] bg-[#020617] flex items-center justify-center p-6 animate-fade-in overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style=${{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative w-full max-w-2xl bg-slate-900 border-4 border-red-600 rounded-[3rem] p-12 shadow-[0_0_150px_rgba(220,38,38,0.4)] text-center animate-in zoom-in duration-500">
            <div className="mb-10 flex justify-center">
                <div className="bg-red-600/20 p-8 rounded-full border border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.25)]">
                    <${ShieldAlert} size=${100} className="text-red-500 animate-pulse" />
                </div>
            </div>

            <h1 className="text-7xl md:text-9xl arcade-font text-white mb-2 italic tracking-tighter drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                MISSION FAILED
            </h1>
            <p className="text-red-400 font-mono uppercase tracking-[0.5em] text-xs mb-12 animate-pulse">Neural Instability • Sync Terminated</p>

            <div className="bg-black/70 p-12 rounded-[2.5rem] border border-white/5 mb-14 shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50 group-hover:bg-yellow-400 transition-colors"></div>
                <span className="text-[11px] text-slate-500 font-black uppercase tracking-[0.5em] block mb-4">Total Mission XP Archive</span>
                <div className="text-9xl arcade-font text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                    ${sessionScore}
                </div>
                <div className="mt-6 flex justify-center items-center gap-3">
                    <${Award} className="text-yellow-500/40" size=${24} />
                    <span className="text-slate-600 font-mono text-[10px] tracking-widest uppercase">Encryption Grade: Final</span>
                </div>
            </div>

            <${Button} onClick=${handleExit} className="w-full py-12 text-5xl arcade-font italic tracking-widest bg-red-600 border-red-900 hover:bg-red-500 shadow-[0_15px_40px_rgba(220,38,38,0.4)] transition-all active:scale-95 active:shadow-inner hover:scale-[1.02]">
                RETURN TO HQ
            <//>
            
            <div className="mt-12 opacity-30 text-slate-600 font-bold text-[9px] uppercase tracking-[0.6em]">
                System Log: Player life signals at 0% • Maintenance Required
            </div>
        </div>
        
        <div className="absolute inset-0 pointer-events-none">
            ${[...Array(12)].map((_, i) => html`
                <div 
                    key=${i} 
                    className="absolute bg-red-600/20 rounded-full blur-xl animate-pulse" 
                    style=${{
                        width: Math.random() * 100 + 50,
                        height: Math.random() * 100 + 50,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${Math.random() * 3 + 2}s`
                    }}
                ></div>
            `)}
        </div>
      </div>
    `;
  }

  const currentSword = SWORDS[progress?.equippedSwordId] || SWORDS['basic'];
  const isQuiz = phase === 'QUIZ';

  return html`
    <div className=${`relative w-full h-screen overflow-hidden select-none bg-[#1a110a] ${isQuiz ? 'cursor-auto' : 'cursor-none'}`} onMouseMove=${handleMouseMove} ref=${gameAreaRef}>
      
      <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="https://wallpapercave.com/wp/9OsQHDB.jpg" 
            className="w-full h-full object-cover opacity-95" 
            alt="Dojo Background"
          />
          <div className="absolute inset-0 bg-orange-950/20 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]"></div>
      </div>

      <svg className="absolute inset-0 pointer-events-none z-40 overflow-visible">
          <path d=${`M ${trail.map(p => `${p.x} ${p.y}`).join(' L ')}`} fill="none" stroke=${currentSword.color} strokeWidth="10" strokeLinecap="round" opacity="0.8" />
      </svg>
      
      ${!isQuiz && html`
        <div className="fixed pointer-events-none z-50 transition-transform duration-75" style=${{ left: cursorPos.x, top: cursorPos.y, transform: `translate(-50%, -50%) rotate(${isSlashing ? '-135deg' : '-45deg'}) scale(${isSlashing ? 1.4 : 1})` }}>
          <img src=${currentSword.img} alt="Sword" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        </div>
      `}
      
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30 pointer-events-none">
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 bg-black/50 p-2 rounded-2xl border border-white/10 backdrop-blur-sm">
                ${[...Array(3)].map((_, i) => html`<${Heart} key=${i} fill=${i < lives ? "#ef4444" : "none"} className=${`w-8 h-8 ${i < lives ? 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'text-slate-800 opacity-30'}`} />`)}
            </div>
            <div className="bg-black/70 px-6 py-2 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
               <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Session XP</span>
               <div className="text-4xl arcade-font text-yellow-400 drop-shadow-md">${sessionScore}</div>
            </div>
            ${streak > 0 && html`
              <div className="bg-yellow-500/30 px-4 py-1 rounded-full border border-yellow-500/40 text-yellow-300 text-xs font-bold animate-pulse backdrop-blur-sm">
                STREAK: ${streak}
              </div>
            `}
        </div>
        <div className="flex flex-col items-center">
            <div className=${`text-7xl arcade-font drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] ${quizTriggerTimer < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                ${phase === 'SLICING' ? quizTriggerTimer : quizTimer}
            </div>
        </div>
        <${Button} variant="secondary" onClick=${handleExit} className="pointer-events-auto bg-black/60 border-white/10 hover:bg-black/80 backdrop-blur-md">HOME<//>
      </div>
      
      ${phase === 'SLICING' && actors.map(actor => {
        const isBomb = actor.type === 'bomb';
        const model = isBomb ? { emoji: '💣', color: 'bg-black' } : (FRUIT_MODELS[actor.type] || FRUIT_MODELS.apple);
        return html`
          <div key=${actor.id} className="absolute" style=${{ left: `${actor.x}%`, top: `${actor.y}%`, transform: `translate(-50%, -50%) rotate(${actor.rotation}deg)` }}>
             ${!actor.sliced ? html`
                <div className=${`w-20 h-20 rounded-full ${model.color} border-4 border-white flex items-center justify-center text-4xl shadow-2xl transition-transform hover:scale-110`}>
                   ${model.emoji}
                </div>
             ` : isBomb ? html`
                <div className="w-24 h-24 bg-slate-500/50 rounded-full animate-ping blur-xl" />
             ` : html`
                <div className="relative w-24 h-24 flex items-center justify-center">
                   <div className=${`absolute top-0 left-0 w-full h-1/2 ${model.color} border-4 border-white rounded-t-full origin-bottom -translate-y-6 shadow-lg`} />
                   <div className=${`absolute bottom-0 left-0 w-full h-1/2 ${model.color} border-4 border-white rounded-b-full origin-top translate-y-6 shadow-lg`} />
                </div>
             `}
          </div>
        `})}
        
      ${isQuiz && currentQuestion && html`
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-6">
             <div className="bg-white p-12 rounded-[4rem] max-w-2xl w-full border-8 border-cyan-500 pointer-events-auto shadow-[0_0_60px_rgba(6,182,212,0.4)]">
                 <h2 className="text-6xl font-black mb-12 text-center text-slate-950 math-font tracking-tight">
                    ${currentQuestion.question}
                 </h2>
                 <div className="grid grid-cols-2 gap-6">
                    ${currentQuestion.options.map((opt, idx) => html`
                        <button key=${idx} onClick=${() => handleAnswer(idx === currentQuestion.correctAnswerIndex)} className="bg-slate-100 p-8 rounded-[2rem] text-4xl font-black text-slate-900 hover:bg-cyan-50 transition-all math-font border-b-8 border-slate-300 active:border-b-0 active:translate-y-2">
                           ${opt}
                        </button>
                    `)}
                 </div>
             </div>
        </div>
      `}
      
      ${phase === 'FEEDBACK' && feedback && html`
         <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-sm">
             <div className="text-center">
              <div className=${`text-9xl arcade-font drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] ${feedback.type === 'wrong' ? 'text-red-500' : 'text-yellow-400'}`}>${feedback.msg}</div>
              ${feedback.msg.includes('EQUIPPED') && html`
                 <div className="mt-8">
                    <${Trophy} size=${100} className="text-yellow-400 mx-auto animate-bounce" />
                 </div>
              `}
             </div>
         </div>
      `}
    </div>
  `;
};

export default NinjaGame;