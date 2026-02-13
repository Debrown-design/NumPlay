import React, { useMemo } from 'react';
import htm from 'htm';
import { Play, Trophy, ArrowLeft, Car, Gauge, Medal, Flag, BarChart3, Clock } from 'lucide-react';
import Button from '../Button.js';

const html = htm.bind(React.createElement);

const CARS = [
  { id: 'velocity-vector', name: 'Velocity Vector', speed: 85, handling: 90, color: 'text-cyan-400', desc: 'Balanced & Agile' },
  { id: 'algorithmic-ghost', name: 'Algorithmic Ghost', speed: 95, handling: 70, color: 'text-purple-400', desc: 'High Top Speed' },
  { id: 'formula-flash', name: 'Formula Flash', speed: 100, handling: 60, color: 'text-yellow-400', desc: 'Drag Strip King' },
  { id: 'integer-interceptor', name: 'Integer Interceptor', speed: 100, handling: 40, color: 'text-blue-400', desc: 'Interceptor of Integers' },
  { id: 'quantum-quasar', name: 'Quantum Quasar', speed: 100, handling: 89, color: 'text-red-400', desc: 'Non-Linear Handling' }
];

const STATIC_LEADERBOARD = [
  { name: 'NovaDrift', score: 24500, rank: 1, car: 'Formula Flash' },
  { name: 'Alpha_Prime', score: 23200, rank: 2, car: 'Velocity Vector' },
  { name: 'VectorVixen', score: 21900, rank: 3, car: 'Algorithmic Ghost' },
  { name: 'Echelon', score: 20400, rank: 4, car: 'Velocity Vector' },
  { name: 'Turbo-Tangent', score: 20100, rank: 5, car: 'Algorithmic Ghost' }
];

const RacerPerformanceChart = ({ history = [] }) => {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentHistory = history.filter(h => new Date(h.date).getTime() >= sevenDaysAgo);
  const maxScore = Math.max(100, ...recentHistory.map(h => h.score || 0));

  const getRankColor = (rank) => {
      if (rank === 1) return 'from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
      if (rank === 2) return 'from-slate-400 to-slate-200 shadow-[0_0_10px_rgba(148,163,184,0.4)]';
      if (rank === 3) return 'from-orange-700 to-orange-500 shadow-[0_0_10px_rgba(194,65,12,0.4)]';
      return 'from-purple-900 to-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
  };

  return html`
    <div className="bg-zinc-900/80 backdrop-blur-md border border-purple-500/30 p-6 rounded-2xl h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <${BarChart3} className="text-pink-400" size=${24} />
            <h3 className="font-bold text-xl italic tracking-wide text-white">7-DAY RACE DATA</h3>
        </div>
        <div className="text-[10px] text-pink-500/60 font-black uppercase tracking-widest">${recentHistory.length} RACES FINISHED</div>
      </div>
      <div className="flex-1 flex items-end justify-start gap-2 min-h-[180px] overflow-x-auto pb-4 custom-scrollbar">
        ${recentHistory.length === 0 ? html`
           <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 italic gap-2">
              <${Flag} size=${32} className="opacity-20" />
              <span>No race completions in the last 7 days.</span>
           </div>
        ` : recentHistory.map((item, i) => {
             const heightPct = Math.max(12, (item.score / maxScore) * 100);
             const dateStr = new Date(item.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
             return html`
              <div key=${i} className="flex flex-col items-center gap-2 min-w-[45px] flex-shrink-0 group h-full justify-end relative">
                 <div className=${`mb-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${item.rank === 1 ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-zinc-800 text-white'} z-10 transition-transform group-hover:scale-125`}>
                    #${item.rank}
                 </div>
                 <div className="w-full bg-zinc-800/50 relative flex items-end overflow-hidden h-full rounded-t-sm border-x border-t border-purple-500/10">
                    <div style=${{ height: `${heightPct}%` }} className=${`w-full bg-gradient-to-t ${getRankColor(item.rank)} transition-all duration-500 group-hover:brightness-125`} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                         <span className="bg-black/80 px-1 py-0.5 rounded text-[8px] border border-white/10 text-white font-mono">${item.score}</span>
                    </div>
                 </div>
                 <span className="text-[8px] font-bold text-zinc-500 font-mono tracking-tighter">${dateStr}</span>
              </div>
            `;
          })
        }
      </div>
      <style>${`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
      `}</style>
    </div>
  `;
};

const RacerDashboard = ({ progress, onPlay, onBack, updateProgress }) => {
  const currentCar = CARS.find(c => c.id === progress.equippedCarId) || CARS[0];
  const sortedLeaderboard = useMemo(() => {
    const list = [...STATIC_LEADERBOARD];
    if (progress.rankPoints >= 9000) {
        list.push({ name: 'YOU', score: progress.rankPoints, rank: 99, car: currentCar.name });
    }
    return list.sort((a, b) => b.score - a.score).map((item, idx) => ({ ...item, rank: idx + 1 })).slice(0, 10);
  }, [progress.rankPoints, currentCar.name]);

  return html`
    <div className="min-h-screen bg-[#090014] text-white font-sans overflow-hidden animate-fade-in relative">
       <div className="fixed inset-0 pointer-events-none opacity-30" style=${{ backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), 90deg', backgroundSize: '40px 40px' }} />
       <div className="relative z-10 p-8 max-w-7xl mx-auto">
         <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <button onClick=${onBack} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><${ArrowLeft} size=${20} /> RETURN TO ARCADE</button>
            <div className="text-center">
                <h1 className="text-7xl font-bold italic arcade-font" style=${{ textShadow: '0 0 10px rgba(168,85,247,0.8)' }}>MATH MAYHEM RACERS</h1>
                <p className="text-purple-300 tracking-widest uppercase font-bold mt-2">Action Racing • Ages 15-18</p>
            </div>
            <div className="w-32 hidden md:block" />
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-zinc-900 border border-purple-500/30 p-8 rounded-2xl">
                    <div className="flex items-center gap-4 mb-8">
                         <div className=${`w-64 h-32 rounded-xl flex items-center justify-center bg-gray-800 border-4 ${currentCar.id === 'velocity-vector' ? 'border-cyan-500' : 'border-purple-500'}`}>
                             <${Car} size=${80} className=${`${currentCar.color}`} />
                         </div>
                         <div className="flex-1">
                            <h3 className=${`text-3xl font-black italic ${currentCar.color}`}>${currentCar.name}</h3>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <${Gauge} size=${16} /> SPEED
                                    <div className="flex-1 h-2 bg-gray-800 rounded-full"><div style=${{ width: `${currentCar.speed}%` }} className="h-full bg-cyan-500" /></div>
                                </div>
                            </div>
                         </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        ${CARS.map(car => html`
                            <button key=${car.id} onClick=${() => updateProgress({ equippedCarId: car.id })} className=${`p-3 rounded-lg border-2 ${progress.equippedCarId === car.id ? 'bg-purple-900/40 border-purple-400' : 'bg-zinc-800 border-zinc-700'}`}>${car.name}</button>
                        `)}
                    </div>
                </div>
                <${RacerPerformanceChart} history=${progress.history} />
            </div>
            <div className="flex flex-col gap-6">
                <div className="bg-zinc-900 p-6 rounded-2xl flex-1">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-700"><${Medal} className="text-yellow-500" /><h3 className="font-bold text-xl">LEADERBOARD</h3></div>
                    <div className="space-y-3">
                        ${sortedLeaderboard.map((entry) => html`
                            <div key=${entry.rank} className=${`flex items-center p-3 rounded-lg ${entry.name.includes('YOU') ? 'bg-purple-600/20' : 'bg-black/30'}`}>
                                <div className="w-8 font-bold text-center">#${entry.rank}</div>
                                <div className="flex-1 ml-2 font-bold text-sm">${entry.name}</div>
                                <div className="font-mono text-cyan-400">${entry.score.toLocaleString()}</div>
                            </div>
                        `)}
                    </div>
                </div>
                <${Button} onClick=${onPlay} className="w-full py-6 text-2xl bg-purple-600 border-purple-500 shadow-xl">${progress.currentSessionScore > 0 ? 'RESUME RACE' : 'START ENGINE'} <${Play} fill="currentColor" className="ml-2" /><//>
            </div>
         </div>
       </div>
    </div>
  `;
};

export default RacerDashboard;