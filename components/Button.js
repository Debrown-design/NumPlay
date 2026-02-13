import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = "px-6 py-3 rounded-lg font-bold transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-yellow-500 hover:bg-yellow-400 text-red-900 border-b-4 border-yellow-700",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border-b-4 border-slate-900",
    danger: "bg-red-600 hover:bg-red-500 text-white border-b-4 border-red-800",
    info: "bg-cyan-600 hover:bg-cyan-500 text-white border-b-4 border-cyan-800"
  };

  return html`
    <button 
      className="${baseStyle} ${variants[variant]} ${className}" 
      ...${props}
    >
      ${children}
    </button>
  `;
}