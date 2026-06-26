import { useEffect, useState } from "react";
import { Cpu, Globe, Terminal, Sparkles, Shield, Database, GraduationCap, Briefcase } from "lucide-react";
import { motion } from "motion/react";
import AntiGravityParticles from "./AntiGravityParticles";

interface SplashViewProps {
  onComplete: () => void;
}

export default function SplashView({ onComplete }: SplashViewProps) {
  const [progress, setProgress] = useState(0);

  const currentLog = progress < 100 ? `Loading... ${progress}%` : "Ready to launch";

  useEffect(() => {
    // Fast but satisfying loading simulation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          const increment = Math.floor(Math.random() * 8) + 5;
          const next = prev + increment;
          return next > 100 ? 100 : next;
        }
        clearInterval(timer);
        return 100;
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  // Auto-complete when progress hits 100% after a short delay for visual completion satisfaction
  useEffect(() => {
    if (progress === 100) {
      const delay = setTimeout(() => {
        onComplete();
      }, 700);
      return () => clearTimeout(delay);
    }
  }, [progress, onComplete]);

  return (
    <div 
      className="fixed inset-0 bg-[#07091E] text-white flex flex-col justify-between p-8 overflow-hidden font-sans select-none relative"
      id="splash-screen"
    >
      <AntiGravityParticles />
      {/* Holographic Matrix Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,66,232,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,66,232,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      {/* Cybernetic scanning light bar sweeping top to bottom */}
      <div className="absolute top-0 inset-x-0 h-[150px] bg-gradient-to-b from-[#6342E8]/10 via-[#6342E8]/0 to-transparent w-full pointer-events-none animate-scan"></div>

      {/* Floating Ambient Orb Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse [animation-delay:2s]"></div>

      {/* Top Header metadata info */}
      <div className="flex justify-end items-center z-10 w-full">
        <button 
          id="btn-skip-splash"
          onClick={() => onComplete()}
          className="text-xs bg-white/5 hover:bg-white/10 px-4.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md transition-all active:scale-95 text-slate-350 hover:text-white cursor-pointer hover:border-purple-500/35"
        >
          Skip Intro →
        </button>
      </div>

      {/* Main Core Showcase */}
      <div className="flex flex-col items-center justify-center flex-1 z-10 text-center py-6 select-none relative">
        
        {/* Futuristic Cyber Holographic Core */}
        <div className="relative w-80 h-80 flex items-center justify-center mb-6">
          
          {/* Orbital Ring 1 (Clockwise) */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="absolute w-72 h-72 rounded-full border border-dashed border-purple-500/30"
          />

          {/* Orbital Ring 2 (Counter-Clockwise) */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute w-60 h-60 rounded-full border border-purple-400/20 border-t-2 border-t-[#6342E8]/60"
          />

          {/* Glowing Outer Hexagon aura */}
          <div className="absolute w-48 h-48 rounded-3xl bg-[#6342E8]/5 border border-purple-500/30 rotate-45 animate-pulse"></div>

          {/* Pulsing Core Sphere */}
          <motion.div 
            animate={{ scale: [1, 1.06, 1], y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-[#14183B] to-[#251B65] border-2 border-purple-500/40 shadow-[0_0_50px_rgba(99,66,232,0.4)] flex items-center justify-center relative overflow-hidden"
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2"></div>
            
            {/* Glowing Tech symbol */}
            <div className="flex flex-col items-center justify-center text-white z-10">
              <svg className="w-20 h-20 drop-shadow-[0_0_15px_rgba(99,66,232,0.55)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="innovative-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="42" stroke="url(#innovative-logo-grad)" strokeWidth="2" strokeDasharray="12 6" style={{ animation: "spin 12s linear infinite" }} />
                <ellipse cx="50" cy="50" rx="36" ry="12" stroke="url(#innovative-logo-grad)" strokeWidth="2" transform="rotate(-45 50 50)" opacity="0.75" />
                <ellipse cx="50" cy="50" rx="36" ry="12" stroke="url(#innovative-logo-grad)" strokeWidth="2" transform="rotate(45 50 50)" opacity="0.75" />
                <circle cx="50" cy="50" r="18" fill="#14183B" stroke="url(#innovative-logo-grad)" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="12" fill="url(#innovative-logo-grad)" opacity="0.15" className="animate-pulse" />
                <text x="50" y="57" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">C</text>
                <circle cx="15" cy="50" r="3" fill="#EC4899" className="animate-ping" style={{ animationDuration: "3s" }} />
                <circle cx="85" cy="50" r="3" fill="#3B82F6" className="animate-ping" style={{ animationDuration: "2.5s" }} />
              </svg>
              <span className="text-[7px] font-mono tracking-widest uppercase text-purple-300 mt-2">SPHERE AI</span>
            </div>
            
            {/* Particle scanlines */}
            <div className="absolute bottom-2 inset-x-0 h-0.5 bg-sky-400/40 blur-xs w-full animate-sweep"></div>
          </motion.div>

          {/* Staggered Orbital Float Nodes */}
          <div className="absolute top-4 right-14 w-8 h-8 rounded-xl bg-slate-900/90 border border-white/15 flex items-center justify-center text-[#6342E8] shadow-lg animate-float-slow">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="absolute bottom-6 left-12 w-8 h-8 rounded-xl bg-slate-900/90 border border-white/15 flex items-center justify-center text-sky-400 shadow-lg animate-float">
            <Globe className="w-4 h-4" />
          </div>
          <div className="absolute bottom-16 right-8 w-8 h-8 rounded-xl bg-slate-900/90 border border-white/15 flex items-center justify-center text-pink-400 shadow-lg animate-float-fast">
            <Database className="w-4 h-4" />
          </div>
        </div>

        {/* Branding Wordmarks */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white via-slate-100 to-purple-250 bg-clip-text text-transparent">
          CareerSphere AI
        </h1>
        
        {/* Pulse spark subtitle */}
        <p className="text-xs md:text-sm text-purple-300/80 tracking-widest font-mono uppercase flex items-center gap-1.5 justify-center">
          <Sparkles className="w-3.5 h-3.5 text-yellow-355 animate-pulse fill-yellow-300" />
          <span>Cognitive Professional Engine</span>
        </p>

      </div>

      {/* Bottom Loading Progress Segment */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3.5 z-10 pb-6">
        
        {/* Dynamically switching console log status */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl text-[10px] font-mono text-slate-350 min-h-[32px] w-full justify-center text-center shadow-inner">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping shrink-0"></span>
          <span className="truncate">{currentLog}</span>
        </div>
        
        {/* Futuristic Loading track */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative p-0.5 flex justify-start">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-[#6342E8] rounded-full relative shadow-[0_0_12px_rgba(99,66,232,0.8)]"
          />
        </div>
      </div>
    </div>
  );
}
