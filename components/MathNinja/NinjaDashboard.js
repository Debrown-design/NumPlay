import React, { useMemo, useState, useEffect } from 'react';
import htm from 'htm';
import { Play, Trophy, Zap, Sword, Heart, TrendingUp, ArrowUpCircle, Clock, ArrowLeft, Shield, BarChart3 } from 'lucide-react';
import Button from '../Button.js';

const html = htm.bind(React.createElement);

const STATIC_LEADERBOARD = [
  { name: 'Kensei_44', score: 15450, rounds: 145, icon: '🥷', color: 'purple', isUser: false },
  { name: 'ZeroCount', score: 12800, rounds: 98, icon: '🦊', color: 'orange', isUser: false },
  { name: 'SlicePro', score: 10500, rounds: 82, icon: '⚔️', color: 'blue', isUser: false },
  { name: 'MathMage', score: 9200, rounds: 76, icon: '🧙', color: 'green', isUser: false },
  { name: 'ShadowCalculus', score: 8100, rounds: 64, icon: '🌑', color: 'slate', isUser: false },
];

const SWORD_DATA = [
  { id: 'basic', name: 'Standard Katana', rarity: 'Common', color: 'slate', img: 'https://medievalextreme.com/wp-content/uploads/2019/10/A3651DA2-3A2B-4049-80F8-19666531B297.jpeg' },
  { id: 'gold', name: 'Gold Blade', rarity: 'Rare', color: 'yellow', img: 'https://spirit.scene7.com/is/image/Spirit/01588672-a?$Detail$' },
  { id: 'diamond', name: 'Diamond Edge', rarity: 'Legendary', color: 'cyan', img: 'https://wallpapercave.com/wp/wp6922828.jpg' }
];

const REGEN_TIME = 120000;

const PerformanceChart = ({ history = [] }) => {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentHistory = history.filter(h => new Date(h.date).getTime() >= sevenDaysAgo);
  const maxScore = Math.max(100, ...recentHistory.map(h => h.score || 0));

  return html`
    <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 shadow-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <${BarChart3} className="text-cyan-400" size=${24} />
            <h3 className="font-bold text-xl italic tracking-wide text-white uppercase arcade-font">7-DAY PERFORMANCE LOG</h3>
        </div>
        <div className="text-[10px] text-cyan-500/60 font-black uppercase tracking-widest">${recentHistory.length} GAMES PLAYED</div>
      </div>
      <div className="flex-1 flex items-end justify-start gap-2 min-h-[160px] overflow-x-auto pb-2 custom-scrollbar">
        ${recentHistory.length === 0 ? html`
           <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 italic text-sm gap-2">
              <${Clock} size=${32} className="opacity-20" />
              <span>No training data for the last 7 days.</span>
           </div>
        ` : recentHistory.map((item, i) => {
             const dateStr = new Date(item.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
             const heightPct = (item.score / maxScore) * 100;
             return html`
              <div key=${i} className="flex flex-col items-center gap-2 min-w-[40px] flex-shrink-0 group h-full justify-end">
                <div className="w-full bg-slate-800/50 rounded-t-lg relative flex items-end overflow-hidden h-full border-x border-t border-white/5">
                  <div 
                    style=${{ height: `${Math.max(8, heightPct)}%` }} 
                    className="w-full bg-gradient-to-t from-cyan-900 to-cyan-400 group-hover:from-cyan-400 group-hover:to-cyan-200 transition-all duration-500 rounded-t-md relative shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-cyan-500 px-2 py-0.5 rounded text-[10px] font-bold text-white z-10">
                        ${item.score}
                     </div>
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 font-bold tracking-tighter">${dateStr}</span>
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

const NinjaDashboard = ({ progress, onPlay, onBack, onLevelUp, updateProgress }) => {
  const [nextRegenTime, setNextRegenTime] = useState(null);
  const nextLevelThreshold = (progress?.level || 1) * 2000;
  const canLevelUp = (progress?.lifetimeScore || 0) >= nextLevelThreshold && (progress?.level || 1) < 12;

  useEffect(() => {
    const updateTime = () => {
      if (progress?.livesLostAt?.length > 0) {
        const oldest = Math.min(...progress.livesLostAt);
        const diff = REGEN_TIME - (Date.now() - oldest);
        if (diff > 0) {
           const mins = Math.floor(diff / 60000);
           const secs = Math.ceil((diff % 60000) / 1000);
           setNextRegenTime(`${mins}:${secs.toString().padStart(2, '0')}`);
        } else {
           setNextRegenTime(null);
        }
      } else {
        setNextRegenTime(null);
      }
    };
    updateTime();
    const interval = setInterval(updateTime);
    return () => clearInterval(interval);
  }, [progress?.livesLostAt]);

  const sortedLeaderboard = useMemo(() => {
    const list = [...STATIC_LEADERBOARD];
    if ((progress?.highScore || 0) >= 1000) {
      list.push({ 
        name: 'YOU', 
        score: progress.highScore, 
        rounds: progress.totalRoundsPlayed, 
        icon: '👤', 
        color: 'cyan', 
        isUser: true 
      });
    }
    return list
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [progress?.highScore, progress?.totalRoundsPlayed]);

  const handleEquipSword = (swordId) => {
    if (progress.unlockedSwords.includes(swordId)) {
        updateProgress({ equippedSwordId: swordId });
    }
  };

  const hasProgress = (progress?.currentScore || 0) > 0;

  return html`
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans animate-fade-in overflow-y-auto">
       <div className="max-w-7xl mx-auto">
         <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <button onClick=${onBack} className="bg-slate-900/80 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl border border-white/5 transition-all font-bold tracking-widest flex items-center gap-3 shadow-xl uppercase text-xs">
                <${ArrowLeft} size=${18} /> Exit Game
            </button>
            <div className="text-center mt-6 md:mt-0">
               <h1 className="text-6xl md:text-8xl text-white font-bold italic arcade-font drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">MATH NINJA BLITZ</h1>
               <p className="text-cyan-500 font-mono text-sm tracking-[0.5em] mt-2 uppercase">Blade of Logic Protocol</p>
            </div>
            <div className="hidden md:block w-40"></div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-lg">
               <div className="flex justify-between items-start mb-6">
                 <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Missions</span>
                 <${Sword} className="text-purple-500" size=${20} />
               </div>
               <div className="text-4xl font-bold italic arcade-font">${progress?.totalRoundsPlayed || 0}</div>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-lg">
               <div className="flex justify-between items-start mb-6">
                 <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Lifetime Data</span>
                 <${Zap} className="text-yellow-500" size=${20} />
               </div>
               <div className="text-4xl font-bold italic arcade-font">${progress?.lifetimeScore || 0}</div>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-lg">
               <div className="flex justify-between items-start mb-6">
                 <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Max Result</span>
                 <${Trophy} className="text-cyan-500" size=${20} />
               </div>
               <div className="text-4xl font-bold italic arcade-font">${progress?.highScore || 0}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick=${onPlay} 
                disabled=${progress?.lives <= 0} 
                className=${`flex-1 p-6 rounded-3xl border-b-8 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 shadow-2xl group ${progress?.lives > 0 ? (hasProgress ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800' : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-800') : 'bg-slate-800 border-slate-900 cursor-not-allowed opacity-50'}`}
              >
                 <${Play} fill="white" size=${32} />
                 <span className="text-2xl font-bold arcade-font italic tracking-widest uppercase">
                    ${progress?.lives > 0 ? (hasProgress ? 'RESUME GAME' : 'PLAY GAME') : 'WAITING'}
                 </span>
                 <div className="flex gap-1.5 mt-1">
                    ${[...Array(3)].map((_, i) => html`
                        <${Heart} key=${i} fill=${i < (progress?.lives || 0) ? "#ffffff" : "none"} className=${i < (progress?.lives || 0) ? "text-white" : "text-slate-600"} size=${14} />
                    `)}
                 </div>
              </button>
              ${nextRegenTime && html`
                <div className="text-center text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-black/40 py-1 rounded-full border border-cyan-500/20">
                  Life Regen: ${nextRegenTime}
                </div>
              `}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col h-full">
                <${PerformanceChart} history=${progress?.history} />
            </div>
            <div className="flex flex-col gap-8">
                <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <${TrendingUp} className="text-cyan-400" size=${24} />
                    <h3 className="font-bold text-xl italic tracking-wide text-white arcade-font uppercase">NINJA TIER: GRADE ${progress?.level || 1}</h3>
                  </div>
                  <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="bg-cyan-500 h-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-1000" style=${{ width: `${Math.min(100, ((progress?.lifetimeScore || 0) / nextLevelThreshold) * 100)}%` }} />
                  </div>
                  <${Button} onClick=${onLevelUp} disabled=${!canLevelUp} className=${`w-full mt-6 py-4 text-xl group ${canLevelUp ? 'bg-cyan-600 animate-pulse' : 'bg-slate-800 opacity-30 grayscale'}`}>
                      <${ArrowUpCircle} className="group-hover:-translate-y-1 transition-transform" />
                      ${progress?.level < 12 ? `PROVOKE GRADE ${(progress?.level || 1) + 1}` : 'HIGHEST TIER REACHED'}
                  <//>
                </div>
                
                <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 shadow-2xl">
                   <h3 className="font-bold text-xl italic text-white mb-6 arcade-font uppercase">LEADERBOARD</h3>
                   <div className="space-y-3">
                      ${sortedLeaderboard.map((entry) => html`
                          <div key=${entry.rank} className=${`flex items-center p-4 rounded-2xl border transition-all ${entry.isUser ? 'bg-cyan-500/10 border-cyan-500/50 scale-[1.02]' : 'bg-slate-800/40 border-white/5'}`}>
                              <span className="font-black text-2xl w-10 italic opacity-50 arcade-font">#${entry.rank}</span>
                              <span className="text-2xl mr-4">${entry.icon}</span>
                              <div className="flex-1 truncate font-bold uppercase tracking-widest text-sm">${entry.name}</div>
                              <div className="text-right font-black text-xl arcade-font text-cyan-400">${entry.score.toLocaleString()}</div>
                          </div>
                      `)}
                   </div>
                </div>
            </div>
         </div>

         <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
                <${Shield} className="text-cyan-400" size=${32} />
                <h3 className="text-3xl font-black arcade-font italic tracking-widest text-white uppercase">THE ARMORY</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${SWORD_DATA.map(sword => {
                    const isUnlocked = progress.unlockedSwords.includes(sword.id);
                    const isEquipped = progress.equippedSwordId === sword.id;
                    
                    return html`
                        <div 
                          key=${sword.id}
                          onClick=${() => isUnlocked && handleEquipSword(sword.id)}
                          className=${`relative p-6 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${isUnlocked ? (isEquipped ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-105' : 'bg-slate-800/40 border-white/10 hover:border-white/30') : 'bg-black/50 border-white/5 opacity-40 cursor-not-allowed'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">${sword.rarity}</div>
                                ${isEquipped && html`<div className="bg-cyan-400 text-black text-[10px] px-2 py-0.5 rounded font-black tracking-widest">EQUIPPED</div>`}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <img src=${sword.img} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                                <div>
                                    <h4 className="font-bold text-lg text-white">${sword.name}</h4>
                                    ${!isUnlocked && html`
                                        <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold uppercase tracking-tighter">
                                            ${sword.id === 'gold' ? '3 Streak Required' : '6 Streak Required'}
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;
                })}
            </div>
         </div>
       </div>
    </div>
  `;
};

export default NinjaDashboard;