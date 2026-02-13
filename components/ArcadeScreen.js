import React from 'react';
import htm from 'htm';
import Button from './Button.js';
import { Trophy, LogOut, Info, ShieldCheck, Lock } from 'lucide-react';

const html = htm.bind(React.createElement);

const ArcadeScreen = ({ user, onEnterLab, onViewDetails, onSignOut }) => {
  const userAge = parseInt(user.age) || 0;

  const games = [
    {
      id: 'math-ninja',
      title: 'Math Ninja Blitz',
      description: 'Slice through equations and earn legendary items!',
      active: true,
      color: 'bg-red-900',
      gradient: 'from-red-600 to-orange-600',
      image: 'https://www.dropbox.com/scl/fi/a5vete6b9qzib8rohclcf/Math-Ninja-Blitz-Image.jpg?rlkey=nakqefov2d6ahg4tb1pb146ba&st=bbu6hidz&raw=1', 
      minAge: 7
    },
    {
      id: 'math-mayhem-racers',
      title: 'Math Mayhem Racers',
      description: 'Action Racing. Answer correctly to accelerate your vehicle.',
      active: true,
      color: 'bg-purple-900',
      gradient: 'from-violet-600 to-fuchsia-600',
      image: 'https://www.dropbox.com/scl/fi/1w1k6k1zofgn4wjdkt293/Math-Mayhem-Racers-Image.jpg?rlkey=fkzspcn0i2kwtfjyl6d3soweq&st=rharx92p&raw=1',
      minAge: 10
    },
    {
      id: 'integer-impact',
      title: 'Integer Impact',
      description: 'Math Meets Mayhem! Fighter Mechanics for Ages 10-14.',
      active: true,
      color: 'bg-slate-800',
      gradient: 'from-blue-700 via-slate-800 to-red-700',
      image: 'https://www.dropbox.com/scl/fi/hxkfao7yt9q8o58dew5z9/Integer-Impact-Image.jpg?rlkey=wydvygovbaa9fajq51chgfnm5&st=w3jzu273&raw=1', 
      minAge: 7
    }
  ];

  const visibleGames = games.filter(game => userAge >= game.minAge);

  return html`
    <div className="flex flex-col items-center min-h-screen p-8 w-full max-w-7xl mx-auto relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            src="https://www.dropbox.com/scl/fi/9jknicjmpspoouznrkroq/1000_F_185372243_E572GNRAHAy3C7j6V93aFhqcXZtQBB3G.jpg?rlkey=kpy8nn6dqu5zmylcv25bhc1em&st=5sxk3dcc&raw=1" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <header className="w-full flex justify-between items-center mb-12 bg-black/80 p-6 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl relative z-10">
        <div>
          <h2 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 arcade-font tracking-wider drop-shadow-sm">GAME ARCADE</h2>
          <p className="text-gray-300 font-mono mt-1">Player: <span className="text-white font-bold">${user.name}</span> | Age: <span className="text-white font-bold">${user.age}</span></p>
        </div>
        <div className="flex gap-4 items-center">
           <div className="bg-slate-800 border border-slate-600 text-yellow-400 px-6 py-3 rounded-xl font-bold arcade-font flex items-center gap-2 shadow-inner">
             <${Trophy} size=${20} />
             TOKENS: ∞
           </div>
           <${Button} variant="danger" onClick=${onSignOut} className="px-4 py-3">
             <${LogOut} size=${20} />
             <span className="hidden md:inline">Sign Out</span>
           <//>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full relative z-10">
        ${visibleGames.map((game) => html`
          <div 
            key=${game.id}
            className=${`relative group ${game.color} rounded-2xl overflow-hidden shadow-2xl border-4 flex flex-col ${game.active ? 'border-yellow-500 hover:border-yellow-300 cursor-pointer transform hover:-translate-y-2 hover:shadow-yellow-500/20 transition-all duration-300' : 'border-gray-700 opacity-90'}`}
          >
            <div 
              className=${`h-48 relative overflow-hidden shrink-0 bg-gradient-to-br ${game.gradient}`}
              onClick=${() => game.active && onEnterLab(game.id)}
            >
               <img src=${game.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
               <div className="absolute bottom-4 left-6">
                  <span className="text-[10px] font-black bg-cyan-900/60 backdrop-blur text-cyan-400 px-3 py-1 rounded-full tracking-[0.2em] border border-cyan-500/20 flex items-center gap-2 uppercase">
                      <${ShieldCheck} size=${10} /> clearance ${game.minAge}+
                  </span>
              </div>
            </div>

            <div className="p-6 bg-black/60 flex-1 backdrop-blur-sm border-t border-white/10 flex flex-col">
              <h3 className="text-2xl text-white mb-2 arcade-font tracking-wide drop-shadow-md">${game.title}</h3>
              <p className="text-gray-300 text-sm mb-6 min-h-[3rem] leading-relaxed">${game.description}</p>
              
              <div className="mt-auto flex gap-3">
                ${game.active ? html`
                  <${Button} 
                    className="flex-1 text-sm arcade-font tracking-widest"
                    onClick=${() => onEnterLab(game.id)}
                  >
                    ENTER GAME
                  <//>
                  <${Button} 
                     variant="secondary" 
                     className="px-4"
                     onClick=${() => onViewDetails(game.id)}
                  >
                    <${Info} size=${20} />
                  <//>
                ` : html`
                  <div className="flex-1 flex items-center justify-center gap-2 text-gray-500 font-bold bg-black/40 py-3 rounded-lg border border-gray-700 text-xs arcade-font tracking-widest">
                    <${Lock} size=${16} /> COMING SOON
                  </div>
                `}
              </div>
            </div>
          </div>
        `)}
      </div>
    </div>
  `;
};

export default ArcadeScreen;