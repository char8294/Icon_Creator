
import React, { useState } from 'react';
import { Tool } from '../types';
import { LanguageIcon, RobloxIcon, PlanetIcon, ArrowRightIcon } from './Icons';

interface ToolButtonProps {
  tool: Tool;
  index: number;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Select the correct icon based on the tool type
  const renderIcon = () => {
    const className = `w-8 h-8 transition-all duration-300 ${isHovered ? 'text-white scale-110' : 'text-zinc-400'}`;
    switch (tool.iconType) {
      case 'language': return <LanguageIcon className={className} />;
      case 'roblox': return <RobloxIcon className={className} />;
      case 'planet': return <PlanetIcon className={className} />;
      default: return null;
    }
  };

  // Stagger animation delay based on index
  const animationDelay = `${index * 150}ms`;

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative w-full max-w-2xl mx-auto block"
      style={{ 
        animation: `fadeInUp 0.6s ease-out forwards`,
        animationDelay: animationDelay,
        opacity: 0 // Initial state for animation
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Effect behind the button */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-xl opacity-0 blur transition duration-500 group-hover:opacity-50 ${isHovered ? 'scale-100' : 'scale-95'}`}></div>
      
      {/* Main Button Content */}
      <div className="relative flex items-center justify-between px-6 py-5 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-xl transition-all duration-300 group-hover:bg-zinc-900 group-hover:border-zinc-600">
        
        <div className="flex items-center gap-5">
          {/* Icon Container */}
          <div className={`p-3 rounded-lg transition-colors duration-300 ${isHovered ? 'bg-indigo-500/20' : 'bg-zinc-800'}`}>
            {renderIcon()}
          </div>
          
          {/* Text Content */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold tracking-wide text-zinc-100 transition-colors duration-300 group-hover:text-white">
              {tool.title}
            </h3>
            {tool.description && (
              <p className="text-xs text-zinc-500 mt-0.5 transition-colors duration-300 group-hover:text-zinc-400">
                {tool.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Indicator */}
        <div className={`transform transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100 text-indigo-400' : '-translate-x-4 opacity-0 text-zinc-600'}`}>
          <ArrowRightIcon className="w-6 h-6" />
        </div>
      </div>

      {/* Inline styles for the keyframes to avoid external CSS file dependency */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </a>
  );
};

export default ToolButton;
