import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { generateRacerQuestion } from '../../services/mathServices.js';
import Button from '../Button.js';
import { Flag, Timer, Zap, Trophy, CheckCircle2, XCircle, Home, AlertTriangle, ShieldAlert, RotateCcw } from 'lucide-react';

const html = htm.bind(React.createElement);

const OBSTACLE_TYPES = [
  { id: 'cone', emoji: '🚧', label: 'BARRIER', color: '#f97316' },
  { id: 'oil', emoji: '🛢️', label: 'OIL SPILL', color: '#1e2937' },
  { id: 'barrel', emoji: '🛢️', label: 'BARREL', color: '#ef4444' }
];

const FormulaCar = ({ colors, scale = 1, isPlayer = false, speed = 0, label, isAccelerating, isCrashed }) => {
  return html`
    <div className=${`relative -translate-x-1/2 origin-bottom transition-transform ${isPlayer && (speed > 140 || isAccelerating || isCrashed) ? 'animate-[shake_0.1s_infinite]' : ''}`} style=${{ transform: `scale(${scale}) translateX(-50%)`, filter: isCrashed ? 'grayscale(0.8) contrast(1.2)' : 'none' }}>
      <svg width="240" height="160" viewBox="0 0 240 160" className=${`drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] ${isCrashed ? 'opacity-50' : ''}`}>
        <rect x="20" y="80" width="50" height="70" rx="8" fill="#111" stroke="#000" />
        <rect x="170" y="80" width="50" height="70" rx="8" fill="#111" stroke="#000" />
        <path d="M90 130 L150 130 L140 70 L100 70 Z" fill=${colors.body} stroke="#000" />
        <rect x="10" y="50" width="220" height="30" rx="4" fill=${colors.wing} stroke="#000" />
        <circle cx="120" cy="60" r="14" fill="#fbbf24" stroke="#000" />
        ${(speed > 160 || isAccelerating) && !isCrashed && html`
          <path d="M110 135 L130 135 L120 160 Z" fill="#06b6d4" className="animate-pulse" style=${{ filter: 'blur(4px)' }} />
        `}
      </svg>
      ${label && html`<div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-cyan-400 font-bold text-xs bg-black/80 px-2 py-1 rounded border border-cyan-500/30 whitespace-nowrap">${label}</div>`}
    </div>
  `;
};

const RacerGame = ({ progress, updateProgress, onExit }) => {
  const TOTAL_RACERS = 20;
  const TOTAL_LAPS = 1;
  const TRACK_LENGTH = 100000;
  
  const [gameState, setGameState] = useState('RACING');
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentLap, setCurrentLap] = useState(1);
  const [rank, setRank] = useState(TOTAL_RACERS);
  const [question, setQuestion] = useState(null);
  const [questionTimer, setQuestionTimer] = useState(60);
  const [timeToQuestion, setTimeToQuestion] = useState(15);
  const [feedback, setFeedback] = useState(null);
  const [playerX, setPlayerX] = useState(50);
  const [aiRacers, setAiRacers] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [crashMessage, setCrashMessage] = useState(null);
  const [crashCountdown, setCrashCountdown] = useState(5);
  const [crashType, setCrashType] = useState(null); 
  
  const canvasRef = useRef(null);
  const requestRef = useRef(0);
  const playerTotalDistance = useRef(0);
  const aiRacersRef = useRef([]);
  const obstaclesRef = useRef([]);
  const roadOffsetRef = useRef(0);
  const lastObstacleSpawnRef = useRef(0);

  const propsRef = useRef({ progress, updateProgress });
  const stateRef = useRef({ gameState, speed, isAccelerating, playerX });

  useEffect(() => {
    propsRef.current = { progress, updateProgress };
    stateRef.current = { gameState, speed, isAccelerating, playerX };
  }, [progress, updateProgress, gameState, speed, isAccelerating, playerX]);

  const initRacers = () => {
    const racers = [];
    const colors = [
        { body: '#ef4444', accent: '#f87171', wing: '#991b1b' }, 
        { body: '#22c55e', accent: '#4ade80', wing: '#166534' },
        { body: '#3b82f6', accent: '#60a5fa', wing: '#1e40af' },
        { body: '#a855f7', accent: '#c084fc', wing: '#6b21a8' }
    ];
    for (let i = 0; i < 19; i++) {
      racers.push({
        id: i, x: 20 + Math.random() * 60, z: 0, 
        totalDistance: 500 + (i * 300) + Math.random() * 50, 
        speed: 110 + Math.random() * 30, 
        color: colors[i % colors.length]
      });
    }
    setAiRacers(racers);
    aiRacersRef.current = racers;
  };

  useEffect(() => {
    initRacers();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (stateRef.current.gameState !== 'RACING') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') setPlayerX(prev => Math.max(15, prev - 4));
      if (e.key === 'ArrowRight' || e.key === 'd') setPlayerX(prev => Math.min(85, prev + 4));
      if (e.key === 'ArrowUp' || e.key === 'w') setIsAccelerating(true);
    };
    const handleKeyUp = (e) => { if (e.key === 'ArrowUp' || e.key === 'w') setIsAccelerating(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  // Question Timer
  useEffect(() => {
    let interval;
    if (gameState === 'QUESTION') {
      interval = setInterval(() => {
        setQuestionTimer(prev => { if (prev <= 1) { handleTimeout(); return 0; } return prev - 1; });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Crash Recovery Timer
  useEffect(() => {
    let interval;
    if (gameState === 'CRASHED') {
        interval = setInterval(() => {
            setCrashCountdown(prev => {
                if (prev <= 1) {
                    if (crashType === 'RESTART') {
                        // Reset everything for a full restart
                        playerTotalDistance.current = 0;
                        roadOffsetRef.current = 0;
                        obstaclesRef.current = [];
                        setObstacles([]);
                        initRacers();
                        setCurrentLap(1);
                        setDistance(0);
                    }
                    setGameState('RACING');
                    setCrashMessage(null);
                    setCrashType(null);
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, crashType]);

  useEffect(() => {
    let interval;
    if (gameState === 'RACING') {
        interval = setInterval(() => {
            setTimeToQuestion(prev => {
                if (prev <= 1) {
                    setQuestion(generateRacerQuestion());
                    setGameState('QUESTION');
                    setQuestionTimer(60);
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleTimeout = () => {
    setFeedback('TIMEOUT');
    setSpeed(prev => Math.max(40, prev - 50));
    setScore(s => Math.max(0, s - 100));
    setTimeout(() => { setFeedback(null); setGameState('RACING'); }, 1500);
  };

  const handleCrash = (message, type = 'RESTART') => {
      if (stateRef.current.gameState === 'CRASHED') return;
      setGameState('CRASHED');
      setSpeed(0);
      setCrashMessage(message);
      setCrashCountdown(5);
      setCrashType(type);
      setIsAccelerating(false);
  };

  const drawRoad = (ctx, width, height, offset) => {
    ctx.clearRect(0, 0, width, height);
    const grad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height * 0.6);

    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < 5; i++) {
        const x = ((i * 400 + stateRef.current.playerX * -2) % width + width) % width;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.6);
        ctx.lineTo(x + 100, height * 0.45);
        ctx.lineTo(x + 200, height * 0.6);
        ctx.fill();
    }

    const horizon = height * 0.55;
    const roadBottom = height;
    const roadHeight = roadBottom - horizon;

    const numSegments = 60;
    for (let i = numSegments; i > 0; i--) {
        const z = (i * 200 + (offset % 400)) / 1000;
        const pz = ((i + 1) * 200 + (offset % 400)) / 1000;
        const scale = 1 / z;
        const pscale = 1 / pz;
        const y = horizon + (1 / z) * roadHeight * 0.5;
        const py = horizon + (1 / pz) * roadHeight * 0.5;

        if (y < horizon) continue;
        const w = width * scale * 0.6;
        const pw = width * pscale * 0.6;
        const x = width / 2;
        const isDark = Math.floor((offset + i * 200) / 400) % 2 === 0;
        
        ctx.fillStyle = isDark ? '#14532d' : '#166534';
        ctx.fillRect(0, py, width, y - py);
        ctx.fillStyle = isDark ? '#334155' : '#475569';
        ctx.beginPath();
        ctx.moveTo(x - pw / 2, py); ctx.lineTo(x + pw / 2, py); ctx.lineTo(x + w / 2, y); ctx.lineTo(x - w / 2, y);
        ctx.fill();
    }
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { gameState: gs, speed: spd, isAccelerating: acc, playerX: px } = stateRef.current;

    if (gs === 'RACING' || gs === 'QUESTION') {
        let newSpeed = spd;
        if (acc && spd < 160) newSpeed += 0.8;
        newSpeed = Math.max(newSpeed * (acc ? 0.999 : 0.992), 0);
        setSpeed(newSpeed);

        const moveAmount = newSpeed * 0.25;
        playerTotalDistance.current += moveAmount;
        roadOffsetRef.current += moveAmount * 10;
        drawRoad(ctx, canvas.width, canvas.height, roadOffsetRef.current);

        // Obstacles
        if (playerTotalDistance.current - lastObstacleSpawnRef.current > 1200) {
            const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
            const obs = { id: Math.random(), x: 15 + Math.random() * 70, z: 4000, totalDistance: playerTotalDistance.current + 4000, ...type };
            obstaclesRef.current.push(obs);
            lastObstacleSpawnRef.current = playerTotalDistance.current;
        }

        // AI & Collisions
        let aiAheadCount = 0;
        const nextAiRacers = aiRacersRef.current.map(ai => {
            const distChange = ai.speed * 0.25;
            const newTotalDistance = ai.totalDistance + distChange;
            const zPos = newTotalDistance - playerTotalDistance.current;
            if (zPos > 0) aiAheadCount++;
            if (Math.abs(zPos) < 50 && Math.abs(px - ai.x) < 8) {
                handleCrash("You crashed into another car or have bumped into another car! RESTARTING RACE...", 'RESTART');
            }
            return { ...ai, totalDistance: newTotalDistance, z: zPos };
        });
        aiRacersRef.current = nextAiRacers;
        setAiRacers(nextAiRacers);
        setRank(1 + aiAheadCount);

        // Obstacles & Collisions
        const nextObstacles = obstaclesRef.current.map(obs => {
            const zPos = obs.totalDistance - playerTotalDistance.current;
            if (Math.abs(zPos) < 40 && Math.abs(px - obs.x) < 6) {
                handleCrash(`EMERGENCY: You hit a ${obs.label}! RELOADING NEURAL DATA...`, 'RESTART');
            }
            return { ...obs, z: zPos };
        }).filter(obs => obs.z > -50);
        obstaclesRef.current = nextObstacles;
        setObstacles(nextObstacles);

        // Lap Tracking
        const currentTotal = playerTotalDistance.current;
        const lap = Math.floor(currentTotal / TRACK_LENGTH) + 1;
        if (lap !== currentLap) setCurrentLap(lap);
        
        if (currentTotal >= TRACK_LENGTH * TOTAL_LAPS) {
            setDistance(100);
            setGameState('FINISHED');
            const finalRank = 1 + aiAheadCount;
            const finalScore = score + progress.currentSessionScore;
            
            const historyEntry = { date: new Date().toISOString(), rank: finalRank, score: finalScore };
            
            propsRef.current.updateProgress({ 
                totalRaces: propsRef.current.progress.totalRaces + 1, 
                wins: finalRank === 1 ? propsRef.current.progress.wins + 1 : propsRef.current.progress.wins,
                history: [...(propsRef.current.progress.history || []), historyEntry],
                currentSessionScore: 0
            });
        } else setDistance(((currentTotal % TRACK_LENGTH) / TRACK_LENGTH) * 100);
    } else {
        drawRoad(ctx, canvas.width, canvas.height, roadOffsetRef.current);
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleAnswer = (idx) => {
    if (idx === question.correctAnswerIndex) {
        setFeedback('CORRECT');
        setSpeed(prev => Math.min(prev + 70, 240));
        setScore(s => s + 1000);
    } else {
        setFeedback('WRONG');
        setSpeed(prev => Math.max(40, prev - 50));
        setScore(s => Math.max(0, s - 100));
    }
    setTimeout(() => { setFeedback(null); setGameState('RACING'); }, 1500);
  };

  const getPerspectiveStyle = (x, z) => {
    const horizonY = 55;
    const viewDistance = 4000;
    const scale = Math.max(0.05, 1 - (z / viewDistance));
    const normalizedZ = Math.min(1, Math.max(0, z / viewDistance));
    const bottomY = 5;
    const yPos = bottomY + (horizonY - bottomY) * normalizedZ;
    const visualX = 50 + (x - 50) * scale;
    return {
        left: `${visualX}%`, bottom: `${yPos}%`,
        transform: `scale(${scale * 1.5}) translateX(-50%)`,
        zIndex: 100 - Math.floor(normalizedZ * 100),
        display: z < 0 || z > viewDistance ? 'none' : 'block'
    };
  };

  return html`
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      <canvas ref=${canvasRef} className="absolute inset-0 z-0" />
      
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between z-30 pointer-events-none">
          <div className="flex gap-4">
              <div className="bg-black/60 backdrop-blur p-4 rounded-xl border border-purple-500/50">
                <div className="text-xs text-purple-400 font-bold tracking-widest uppercase">Velocity</div>
                <div className="text-5xl font-black italic text-white math-font">${Math.round(speed)} <span className="text-xl">MPH</span></div>
              </div>
              <div className="bg-black/60 backdrop-blur p-4 rounded-xl border border-cyan-500/50">
                <div className="text-xs text-cyan-400 font-bold tracking-widest uppercase">Race Status</div>
                <div className="text-5xl font-black italic text-white math-font">LAP ${Math.min(currentLap, TOTAL_LAPS)}<span className="text-xl text-cyan-500/60"> / ${TOTAL_LAPS}</span></div>
              </div>
          </div>

          <div className="flex flex-col items-center">
             <div className="bg-purple-900/80 p-2 rounded-lg text-yellow-400 font-black text-2xl math-font shadow-[0_0_20px_rgba(168,85,247,0.5)] uppercase tracking-tighter">XP: ${(score + progress.currentSessionScore).toLocaleString()}</div>
             <div className="text-white font-bold mt-2 bg-black/40 px-3 py-1 rounded-full border border-white/10 uppercase text-[10px] tracking-widest">Neural Link: ${timeToQuestion}s</div>
          </div>

          <div className="flex flex-col items-end gap-3 pointer-events-auto">
            <${Button} variant="danger" onClick=${() => onExit()} className="px-4 py-2 bg-black/40 border-red-500/50 text-xs">EXIT GAME</${Button}>
            <div className="bg-black/60 backdrop-blur p-4 rounded-xl border border-purple-500/50 text-right">
              <div className="text-xs text-purple-400 font-bold tracking-widest uppercase">Grid Position</div>
              <div className="text-5xl font-black italic text-white math-font">${rank}<span className="text-xl text-purple-500/60"> / ${TOTAL_RACERS}</span></div>
            </div>
          </div>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        ${aiRacers.map(ai => html`<div key=${ai.id} className="absolute transition-all duration-75" style=${getPerspectiveStyle(ai.x, ai.z)}><${FormulaCar} colors=${ai.color} scale=${1} /></div>`)}
        ${obstacles.map(obs => html`
            <div key=${obs.id} className="absolute" style=${getPerspectiveStyle(obs.x, obs.z)}>
                <div className="flex flex-col items-center">
                    <span className="text-6xl drop-shadow-xl animate-bounce">${obs.emoji}</span>
                    <div className="bg-black/80 px-2 py-0.5 rounded border border-white/10 text-[8px] font-bold text-white whitespace-nowrap">${obs.label}</div>
                </div>
            </div>
        `)}
      </div>

      <div className="absolute bottom-10 z-20" style=${{ left: `${playerX}%` }}>
        <${FormulaCar} colors=${{ body: '#06b6d4', accent: '#ec4899', wing: '#0e7490' }} isPlayer=${true} speed=${speed} isAccelerating=${isAccelerating} isCrashed=${gameState === 'CRASHED'} label="YOU" />
      </div>

      ${gameState === 'CRASHED' && html`
          <div className="absolute inset-0 z-[2000] bg-red-950/70 backdrop-blur-2xl flex items-center justify-center p-6">
              <div className="bg-black border-4 border-red-600 p-12 rounded-[3.5rem] max-w-2xl w-full text-center shadow-[0_0_200px_rgba(220,38,38,0.8)] animate-in zoom-in duration-300">
                  <${ShieldAlert} size=${120} className="text-red-500 mx-auto mb-8 animate-pulse" />
                  <h1 className="text-6xl text-white font-black arcade-font mb-6 tracking-tighter GlitchEffect uppercase">
                    CRITICAL COLLISION
                  </h1>
                  <p className="text-red-400 font-mono text-2xl leading-relaxed uppercase mb-12">${crashMessage}</p>
                  
                  <div className="bg-red-950/40 border-2 border-red-500/50 p-10 rounded-3xl mb-12 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30 overflow-hidden">
                        <div className="h-full bg-red-500 w-full animate-[progress_5s_linear]" />
                      </div>
                      <div className="text-[10px] text-red-500 font-black tracking-[0.5em] mb-4 uppercase">
                        RELOADING GAME DATA
                      </div>
                      <div className="text-9xl font-black math-font text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                         ${crashCountdown}
                      </div>
                      <div className="text-sm text-red-400 font-bold tracking-[0.3em] mt-6 uppercase">Seconds to Re-entry</div>
                  </div>

                  <div className="flex items-center justify-center gap-6">
                      <${RotateCcw} className="text-red-600 animate-spin" size=${24} />
                      <div className="w-5 h-5 bg-red-600 rounded-full animate-ping" />
                      <span className="text-red-600 font-black tracking-[0.4em] text-xs uppercase">Stand By for Transmission</span>
                  </div>
              </div>
          </div>
      `}

      ${gameState === 'QUESTION' && question && !feedback && html`
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-4xl px-4 animate-in slide-in-from-top duration-500">
              <div className="bg-zinc-950/90 backdrop-blur-xl border-4 border-cyan-500 p-10 rounded-[2.5rem] shadow-[0_0_80px_rgba(6,182,212,0.5)]">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3"><${Zap} className="text-yellow-400 animate-pulse" size=${24} /><h2 className="text-cyan-400 font-bold text-2xl uppercase tracking-tighter">Overclock Sequence</h2></div>
                    <div className=${`font-mono font-black text-4xl ${questionTimer < 10 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>${questionTimer}s</div>
                  </div>
                  <h1 className="text-4xl text-white font-black mb-10 text-center math-font leading-snug">${question.question}</h1>
                  <div className="grid grid-cols-2 gap-6">
                      ${question.options.map((opt, i) => html`
                        <button key=${i} onClick=${() => handleAnswer(i)} className="bg-zinc-800/80 hover:bg-cyan-600 text-white p-8 rounded-3xl font-black text-3xl border-b-8 border-black transition-all math-font active:translate-y-2 active:border-b-0 shadow-xl">
                            ${opt}
                        </button>
                      `)}
                  </div>
              </div>
          </div>
      `}

      ${feedback && html`
        <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <div className=${`text-9xl font-black italic drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] animate-in zoom-in duration-300 ${feedback === 'CORRECT' ? 'text-green-400' : 'text-red-500'}`}>
                ${feedback === 'CORRECT' ? '+1000 NITRO!' : feedback === 'TIMEOUT' ? 'ENGINE STALL!' : 'MALFUNCTION!'}
            </div>
        </div>
      `}

      ${gameState === 'FINISHED' && html`
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center">
              <div className="text-center bg-zinc-900 border-4 border-purple-500 p-16 rounded-[4rem] shadow-[0_0_100px_rgba(168,85,247,0.4)]">
                  <${Trophy} size=${120} className="text-yellow-400 mx-auto mb-8 animate-bounce" />
                  <h1 className="text-8xl text-white font-black italic mb-6 arcade-font tracking-tighter">RACE COMPLETE</h1>
                  <div className="text-5xl text-cyan-400 mb-12 font-bold arcade-font">FINAL RANK: ${rank}</div>
                  <${Button} onClick=${onExit} className="w-full py-8 text-3xl arcade-font tracking-widest shadow-2xl">RETURN TO GAME<//>
              </div>
          </div>
      `}

      <style>${`
        @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
        }
        .GlitchEffect {
            text-shadow: 3px 0 red, -3px 0 blue;
            animation: glitch 0.2s infinite;
        }
        @keyframes glitch {
            0% { text-shadow: 3px 0 red, -3px 0 blue; transform: skewX(0deg); }
            50% { text-shadow: -3px 0 red, 3px 0 blue; transform: skewX(2deg); }
            100% { text-shadow: 3px 0 red, -3px 0 blue; transform: skewX(-2deg); }
        }
      `}</style>
    </div>
  `;
};

export default RacerGame;