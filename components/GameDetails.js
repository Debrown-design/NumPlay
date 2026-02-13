import React from 'react';
import htm from 'htm';
import Button from './Button.js';
import { ArrowLeft, LayoutDashboard, Github } from 'lucide-react';

const html = htm.bind(React.createElement);

const GameDetailsScreen = ({ gameId, onBack, onPlay }) => {
  const gameData = {
    'math-ninja': {
      title: 'Math Ninja Blitz',
      image: 'https://www.dropbox.com/scl/fi/a5vete6b9qzib8rohclcf/Math-Ninja-Blitz-Image.jpg?rlkey=nakqefov2d6ahg4tb1pb146ba&st=bbu6hidz&raw=1',
      themeColor: 'bg-red-700',
      textColor: 'text-white',
      accentColor: 'bg-red-900',
      description: 'This is a Fruit Cutting Math Game designed for players aged 7-18',
      sections: [
        {
          title: 'Gameplay & Mechanics',
          content: [
            'A math game that incorporates a fruit-cutting element.',
            'The math complexity ranges depending on the player’s age.',
            'Players are typically presented with 4-5 questions.',
            'There are also challenges available for players to earn in-game items.',
            'The game features a Skill Chart which includes a level up button beside it'
          ]
        },
        {
          title: 'Scoring & Rewards',
          content: [
            'Each fruit cut performed during gameplay is worth 10 points',
            'Each correct answer is worth 10 points',
            'To earn new equipment, such as a new sword or cutting tool, players must achieve 3 correct answers in a row.'
          ]
        },
        {
          title: 'Lives System',
          content: [
            'This game uses a 3 Lives system',
            'If a player loses a life, it is automatically restored after 2 minutes'
          ]
        }
      ]
    },
    'math-mayhem-racers': {
      title: 'Math Mayhem Racers',
      image: 'https://www.dropbox.com/scl/fi/1w1k6k1zofgn4wjdkt293/Math-Mayhem-Racers-Image.jpg?rlkey=fkzspcn0i2kwtfjyl6d3soweq&st=rharx92p&raw=1',
      themeColor: 'bg-purple-800',
      textColor: 'text-white',
      accentColor: 'bg-purple-950',
      description: 'The central premise involves racing and answering mathematical questions.',
      sections: [
        {
          title: 'Core Gameplay Mechanics',
          content: [
            'The central premise involves racing and answering mathematical questions.',
            'Players are typically presented with 4-5 questions',
            'Each correct answer accelerates your vehicle',
            'Each incorrect answer keeps your vehicle at the same speed prior to the questions.'
          ]
        },
        {
          title: 'Leaderboard & Rewards',
          content: [
            'Rank 1: NovaDrift - 98.5% Math Mastery',
            'Rank 2: Alpha_Prime - 90.7% Math Mastery',
            'Rank 3: VectorVixen - 89% Math Mastery',
            'Rank 4: Echelon - 78.89% Math Mastery',
            'Rank 5: Turbo-Tangent - 75% Math Mastery',
            'Earn credits to upgrade your engine by maintaining a streak of correct answers.'
          ]
        },
        {
            title: 'Vehicle Mechanics',
            content: [
                'Vehicles: The Velocity Vector, Algorithmic Ghost, Formula Flash, Integer Interceptor, Quantum Quasar.',
                'Upgrades increase base speed but require solving complex equations to install.'
            ]
        }
      ]
    },
    'integer-impact': {
        title: 'Integer Impact',
        image: 'https://www.dropbox.com/scl/fi/hxkfao7yt9q8o58dew5z9/Integer-Impact-Image.jpg?rlkey=wydvygovbaa9fajq51chgfnm5&st=w3jzu273&raw=1',
        themeColor: 'bg-slate-800',
        textColor: 'text-white',
        accentColor: 'bg-slate-900',
        description: 'A fighting game where integer operations determine the power of your strikes.',
        sections: [
            {
                title: 'Fighter Mechanics',
                content: [
                    'Each participant is equipped with a power bar.',
                    'Solve integer problems (e.g., -5 + 12) to charge your attack.',
                    'Each correct answer increases a fighter\'s punch power.'
                ]
            },
            {
                title: 'Structural Elements',
                content: [
                    'This game includes a Skill Chart.',
                    'Has a leaderboard system.',
                    'Correct combos deal critical damage.'
                ]
            }
        ]
    }
  };

  const data = gameData[gameId];

  if (!data) {
    return html`
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <h2 className="text-2xl">Data Declassified...</h2>
          <${Button} onClick=${onBack} className="mt-4">Return to Arcade<//>
        </div>
      </div>
    `;
  }

  return html`
    <div className=${`flex flex-col md:flex-row min-h-screen w-full animate-fade-in ${data.themeColor}`}>
      <div className="w-full md:w-1/2 relative min-h-[50vh] bg-black flex items-center justify-center overflow-hidden border-b-4 md:border-b-0 md:border-r-4 border-black/20">
        <div className="absolute inset-0">
            <img 
                src=${data.image} 
                className="w-full h-full object-cover opacity-30 blur-sm scale-110" 
                alt=""
            />
        </div>
        <img 
          src=${data.image} 
          alt=${data.title} 
          className="relative z-10 w-full h-full object-contain max-h-[80vh] p-4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8 pointer-events-none z-20">
           <h1 className="text-4xl md:text-6xl font-bold text-white arcade-font drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
             ${data.title}
           </h1>
        </div>
        <button 
          onClick=${onBack}
          className="absolute top-6 left-6 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur transition-all border border-white/20"
        >
          <${ArrowLeft} size=${24} />
        </button>
      </div>
      <div className=${`w-full md:w-1/2 p-8 md:p-12 ${data.textColor} flex flex-col relative`}>
         <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
             <div className="mb-8">
                <h3 className="text-lg font-bold opacity-75 uppercase tracking-widest mb-2 border-b border-white/20 pb-2">Description</h3>
                <p className="text-xl font-medium leading-relaxed">${data.description}</p>
                ${data.projectUrl && html`
                  <a href=${data.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-white/80 hover:text-white underline text-sm transition-colors">
                    <${Github} size=${16} /> View Project Source
                  </a>
                `}
             </div>
             ${data.sections.map((section, idx) => html`
               <div key=${idx} className="mb-8">
                  <h3 className="text-lg font-bold opacity-75 uppercase tracking-widest mb-4 border-b border-white/20 pb-2">${section.title}</h3>
                  <ul className="space-y-3">
                    ${section.content.map((item, i) => html`
                      <li key=${i} className="flex gap-3 items-start">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-white/60 shrink-0"></span>
                        <span className="text-lg leading-relaxed">${item}</span>
                      </li>
                    `)}
                  </ul>
               </div>
             `)}
         </div>
         <div className="fixed bottom-0 left-0 right-0 md:relative p-6 bg-black/80 md:bg-transparent backdrop-blur-lg md:backdrop-filter-none border-t border-white/10 md:border-0 z-50 flex justify-center md:justify-end md:mt-auto">
            <${Button} onClick=${() => onPlay(gameId)} className="w-full md:w-auto text-xl px-12 py-4 shadow-xl bg-green-600 hover:bg-green-500 border-green-800 text-white">
               ENTER GAME <${LayoutDashboard} size=${24} className="ml-2" />
            <//>
         </div>
      </div>
    </div>
  `;
};

export default GameDetailsScreen;