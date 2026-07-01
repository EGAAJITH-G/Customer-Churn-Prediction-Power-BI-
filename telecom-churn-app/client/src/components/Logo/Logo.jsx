import React from 'react';

const Logo = ({ size = 24, strokeColor = '#FFFFFF', fillColor = 'none' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
      fill={fillColor}
    >
      <g stroke={strokeColor} strokeLinecap="round" fill="none">
        {/* Tower Legs */}
        <path d="M 35 75 L 48 35 M 65 75 L 52 35" strokeWidth="4.5" />
        
        {/* Tower Cross Braces */}
        <path d="M 41 62 L 59 62 M 45 50 L 55 50" strokeWidth="3.5" opacity="0.8" />
        
        {/* Central vertical beam */}
        <line x1="50" y1="75" x2="50" y2="30" strokeWidth="3" opacity="0.9" />
        
        {/* Central Apex Node (AI Core) */}
        <circle cx="50" cy="28" r="7" fill={strokeColor} stroke="none" />
        
        {/* Neural branching connections (AI network) */}
        <line x1="50" y1="28" x2="28" y2="12" strokeWidth="2.5" strokeDasharray="2 2" opacity="0.9" />
        <line x1="50" y1="28" x2="72" y2="12" strokeWidth="2.5" strokeDasharray="2 2" opacity="0.9" />
        
        {/* End Neural nodes */}
        <circle cx="28" cy="12" r="4.5" fill={strokeColor} stroke="none" />
        <circle cx="72" cy="12" r="4.5" fill={strokeColor} stroke="none" />
        
        {/* Telecom Signal Waves */}
        <path d="M 32 20 A 25 25 0 0 1 68 20" strokeWidth="3.5" opacity="0.5" />
        <path d="M 22 10 A 38 38 0 0 1 78 10" strokeWidth="3.5" opacity="0.8" />
      </g>
    </svg>
  );
};

export default Logo;
