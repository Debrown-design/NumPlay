import React, { useState } from 'react';
import htm from 'htm';
import { UserCircle, Zap, ChevronRight } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function WelcomeScreen({ onEnter }) {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && age) onEnter({ name, age });
    };

    return html`
        <div class="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div class="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border-2 border-cyan-500/30 p-10 rounded-[2.5rem] shadow-2xl shadow-cyan-500/10">
                
                <div class="mb-10">
                    <div class="mb-6 flex justify-center">
                        <div class="relative p-4 bg-slate-800 rounded-2xl border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                            <${UserCircle} size=${48} class="text-cyan-400" />
                        </div>
                    </div>
                    
                    <h1 class="text-6xl arcade-font text-white mb-1 tracking-widest drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">NumPlay</h1>
                    <h2 class="text-lg font-bold text-cyan-400 uppercase tracking-widest mb-4">Welcome to NumPlay</h2>
                    <p class="text-slate-300 text-sm font-medium px-4 leading-relaxed">
                        Enter Your Name and Age To See What Math Games You Get
                    </p>
                </div>

                <form onSubmit=${handleSubmit} class="space-y-6">
                    <div class="text-left">
                        <label class="block text-[10px] text-cyan-500 uppercase font-black tracking-widest mb-2 ml-1">Player Name</label>
                        <input type="text" value=${name} onInput=${(e) => setName(e.target.value)} placeholder="NEO-ALPHA" required
                            class="w-full bg-slate-800/50 border-2 border-slate-700 rounded-xl px-5 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-slate-600" />
                    </div>
                    <div class="text-left">
                        <label class="block text-[10px] text-cyan-500 uppercase font-black tracking-widest mb-2 ml-1">Age</label>
                        <input type="number" value=${age} onInput=${(e) => setAge(e.target.value)} placeholder="15" min="5" max="99" required
                            class="w-full bg-slate-800/50 border-2 border-slate-700 rounded-xl px-5 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-slate-600" />
                    </div>
                    <button type="submit" class="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl arcade-font text-2xl border-b-4 border-cyan-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                        Enter <${ChevronRight} size=${24} />
                    </button>
                </form>
            </div>
            
            <div class="mt-12 flex flex-col items-center gap-2">
                <div class="flex items-center gap-2 text-cyan-500/50">
                    <${Zap} size=${14} fill="currentColor" />
                    <span class="text-[10px] tracking-[0.4em] font-bold uppercase">Welcome to NumPlay</span>
                </div>
                <p class="text-slate-600 text-[9px] tracking-[0.3em] font-bold uppercase">V.2.5.0-STABLE • AUTHENTICATED ACCESS ONLY</p>
            </div>
        </div>
    `;
}
