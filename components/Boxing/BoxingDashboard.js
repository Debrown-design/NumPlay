import React, { useMemo } from 'react';
import htm from 'htm';
import { Play, Trophy, ArrowLeft, Shield, BarChart3, Swords, Zap, TrendingUp, ArrowUpCircle } from 'lucide-react';
import Button from '../Button.js';

const html = htm.bind(React.createElement);

const STATIC_LEADERBOARD = [
  { name: 'Titan-X', score: 18400, rank: 1, style: 'Slugger' },
  { name: 'Neural-Punch', score: 16200, rank: 2, style: 'Counter' },
  { name: 'BinaryBruiser', score: 14900, rank: 3, style: 'Speed' },
  { name: 'Logic-Left', score: 13100, rank: 4, style: 'Slugger' },
  { name: 'Integer-Iron', score: 12500, rank: 5, style: 'Speed' }
];

const PerformanceChart = ({ history = [] }) => {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentHistory = history.filter(h => new Date(h.date).getTime() >= sevenDaysAgo);
  const maxScore = Math.max(100, ...recentHistory.map(h => h.score || 0));

  return html`
    <div className="bg-slate-900/80 backdrop-blur-md border border-blue-500/30 p-6 rounded-3xl h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <${BarChart3} className="text-blue-400" size=${24} />
            <h3 className="font-bold text-xl italic tracking-wide text-white arcade-font">7-DAY FIGHT LOG</h3>
        </div>
        <div className="text-[10px] text-blue-500/60 font-black uppercase tracking-widest">${recentHistory.length} FIGHTS RECORDED</div>
      </div>
      <div className="flex-1 flex items-end justify-start gap-2 min-h-[180px] overflow-x-auto pb-4 custom-scrollbar">
        ${recentHistory.length === 0 ? html`
           <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 italic gap-2">
              <${Swords} size=${32} className="opacity-20" />
              <span>Enter the ring to record data.</span>
           </div>
        ` : recentHistory.map((item, i) => {
             const heightPct = Math.max(12, (item.score / maxScore) * 100);
             const dateStr = new Date(item.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
             return html`
              <div key=${i} className="flex flex-col items-center gap-2 min-w-[50px] flex-shrink-0 group h-full justify-end">
                 <div className="w-full bg-slate-800/50 relative flex items-end overflow-hidden h-full rounded-t-xl border-x border-t border-blue-500/10">
                    <div style=${{ height: `${heightPct}%` }} className="w-full bg-gradient-to-t from-blue-900 to-blue-400 transition-all duration-500 group-hover:from-blue-400 group-hover:to-cyan-200" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                         <span className="bg-black/80 px-1 py-0.5 rounded text-[8px] border border-white/10 text-white font-mono">${item.score}</span>
                    </div>
                 </div>
                 <span className="text-[9px] font-bold text-slate-500 font-mono tracking-tighter">${dateStr}</span>
              </div>
            `;
          })
        }
      </div>
      <style>${`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  `;
};

const BoxingDashboard = ({ progress, onPlay, onBack, updateProgress }) => {
  const nextLevelThreshold = (progress?.level || 1) * 2500;
  const canLevelUp = (progress?.lifetimeScore || 0) >= nextLevelThreshold && (progress?.level || 1) < 12;

  const sortedLeaderboard = useMemo(() => {
    const list = [...STATIC_LEADERBOARD];
    if (progress.highScore >= 5000) {
        list.push({ name: 'YOU', score: progress.highScore, rank: 99, style: 'Boxer' });
    }
    return list.sort((a, b) => b.score - a.score).map((item, idx) => ({ ...item, rank: idx + 1 })).slice(0, 10);
  }, [progress.highScore]);

  return html`
    <div className="min-h-screen bg-[#020617] text-white p-8 animate-fade-in relative overflow-y-auto">
       <div className="fixed inset-0 pointer-events-none opacity-20" style=${{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }} />
       
       <div className="max-w-7xl mx-auto relative z-10">
         <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <button onClick=${onBack} className="bg-slate-900/80 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl border border-white/5 transition-all font-bold tracking-widest flex items-center gap-3 shadow-xl uppercase text-xs">
                <${ArrowLeft} size=${18} /> Exit Gym
            </button>
            <div className="text-center mt-6 md:mt-0">
               <h1 className="text-6xl md:text-8xl font-bold italic arcade-font text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-600 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] uppercase">INTEGER IMPACT</h1>
               <p className="text-blue-500 font-mono text-xs tracking-[0.5em] mt-2 uppercase font-black">Binary Boxing Arena Protocol</p>
            </div>
            <div className="hidden md:block w-40"></div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-lg">
               <div className="flex justify-between items-start mb-6">
                 <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Career Fights</span>
                 <${Swords} className="text-red-500" size=${20} />
               </div>
               <div className="text-4xl font-bold italic arcade-font">${progress?.totalFights || 0}</div>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-lg">
               <div className="flex justify-between items-start mb-6">
                 <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Knockouts</span>
                 <${Zap} className="text-yellow-500" size=${20} />
               </div>
               <div className="text-4xl font-bold italic arcade-font">${progress?.wins || 0}</div>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-lg">
               <div className="flex justify-between items-start mb-6">
                 <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Max Impact</span>
                 <${Trophy} className="text-blue-500" size=${20} />
               </div>
               <div className="text-4xl font-bold italic arcade-font">${progress?.highScore || 0}</div>
            </div>
            <${Button} onClick=${onPlay} className="h-full py-8 text-3xl arcade-font tracking-widest italic bg-gradient-to-r from-blue-600 to-red-600 border-b-8 border-red-900 hover:scale-[1.02] transition-transform shadow-2xl">
               ENTER RING
            <//>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <${PerformanceChart} history=${progress.history} />
            <div className="flex flex-col gap-8">
                <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <${TrendingUp} className="text-blue-400" size=${24} />
                    <h3 className="font-bold text-xl italic tracking-wide text-white arcade-font uppercase">FIGHTER GRADE: ${progress?.level || 1}</h3>
                  </div>
                  <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="bg-blue-500 h-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-1000" style=${{ width: `${Math.min(100, ((progress?.lifetimeScore || 0) / nextLevelThreshold) * 100)}%` }} />
                  </div>
                  <${Button} onClick=${() => updateProgress({ level: progress.level + 1 })} disabled=${!canLevelUp} className=${`w-full mt-6 py-4 text-xl group ${canLevelUp ? 'bg-blue-600 animate-pulse' : 'bg-slate-800 opacity-30 grayscale'}`}>
                      <${ArrowUpCircle} className="group-hover:-translate-y-1 transition-transform" />
                      ${progress?.level < 12 ? `RANK UP TO GRADE ${(progress?.level || 1) + 1}` : 'ELITE FIGHTER STATUS'}
                  <//>
                </div>
                
                <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 shadow-2xl">
                   <h3 className="font-bold text-xl italic text-white mb-6 arcade-font uppercase">LEAGUE STANDINGS</h3>
                   <div className="space-y-3">
                      ${sortedLeaderboard.map((entry) => html`
                          <div key=${entry.rank} className=${`flex items-center p-4 rounded-2xl border transition-all ${entry.name.includes('YOU') ? 'bg-blue-500/10 border-blue-500/50 scale-[1.02]' : 'bg-slate-800/40 border-white/5'}`}>
                              <span className="font-black text-2xl w-10 italic opacity-50 arcade-font">#${entry.rank}</span>
                              <div className="flex-1 truncate font-bold uppercase tracking-widest text-sm">${entry.name}</div>
                              <div className="text-right font-black text-xl arcade-font text-blue-400">${entry.score.toLocaleString()}</div>
                          </div>
                      `)}
                   </div>
                </div>
            </div>
         </div>
       </div>
    </div>
  `;
};

export default BoxingDashboard;