import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base dark layer */}
      <div className="absolute inset-0 bg-zinc-950" />
      
      {/* Gradient Mesh Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-950 to-slate-950 opacity-90" />

      {/* Animated Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-blob mix-blend-screen filter" />
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-screen filter" />
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl animate-blob animation-delay-4000 mix-blend-screen filter" />
      
      {/* Noise Texture (Optional for grit) */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default Background;