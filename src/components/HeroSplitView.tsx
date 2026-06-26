import { useState, useEffect } from "react";
import AntiGravityParticles from "./AntiGravityParticles";
import { Star, BarChart3, GraduationCap, Briefcase, ThumbsUp, Sparkles, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeroSplitViewProps {
  onStart: () => void;
  onSkipToDashboard: () => void;
}

export default function HeroSplitView({ onStart, onSkipToDashboard }: HeroSplitViewProps) {
  const [currentDot, setCurrentDot] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDot((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const carouselPhrases = [
    "Identify hidden gaps in your skills.",
    "Practice hyper-realistic mock chats.",
    "Instantly score and refine your CV.",
    "Explore recommended positions in real-time."
  ];

  return (<div 
        className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-transparent select-none text-white relative z-10"
        id="hero-split-screen"
      >
      <AntiGravityParticles />
        {/* LEFT COLUMN: Deep dark slate workspace with floating visual diorama */}
        <div className="bg-white/[0.01] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden text-white min-h-[450px]">
          {/* Subtle geometric circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl -ml-20 -mb-20"></div>

        {/* Brand Top Left */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-[#14183B] border border-purple-500/30 flex items-center justify-center shadow-md overflow-hidden relative">
            <svg className="w-8 h-8 drop-shadow-[0_0_5px_rgba(99,66,232,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="innovative-logo-grad-split" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" stroke="url(#innovative-logo-grad-split)" strokeWidth="2" strokeDasharray="12 6" style={{ animation: "spin 12s linear infinite" }} />
              <ellipse cx="50" cy="50" rx="36" ry="12" stroke="url(#innovative-logo-grad-split)" strokeWidth="2" transform="rotate(-45 50 50)" opacity="0.75" />
              <ellipse cx="50" cy="50" rx="36" ry="12" stroke="url(#innovative-logo-grad-split)" strokeWidth="2" transform="rotate(45 50 50)" opacity="0.75" />
              <circle cx="50" cy="50" r="18" fill="#14183B" stroke="url(#innovative-logo-grad-split)" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="12" fill="url(#innovative-logo-grad-split)" opacity="0.15" className="animate-pulse" />
              <text x="50" y="57" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">C</text>
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-md tracking-tight block">CareerSphere AI</span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">ONBOARDING SIMULATOR</span>
          </div>
        </div>

        {/* DIORAMA CORE */}
        <div className="flex-1 flex items-center justify-center relative select-none">
          {/* Main floating graphic panel */}
          <div className="relative w-80 h-80 flex items-center justify-center z-10">
            {/* Core computer character visual inside container */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="w-48 h-48 rounded-full bg-blue-900/10 border-2 border-purple-500/30 flex flex-col items-center justify-center shadow-lg relative"
            >
              <div className="p-4 bg-purple-500/25 rounded-full mb-2">
                <GraduationCap className="w-14 h-14 text-purple-300 stroke-[1.5]" />
              </div>
              <span className="text-xs font-mono tracking-widest text-slate-300">CAREER PATHWAY</span>
              <span className="text-[10px] bg-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 mt-1 font-semibold uppercase">Active User</span>
              
              {/* Armchair mock backdrop effect */}
              <div className="absolute -bottom-4 w-32 h-6 bg-purple-500/10 rounded-full blur-xs"></div>
            </motion.div>

            {/* FLOATING CARD 1: Career Match 92% (Top Left) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-4 -left-6 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3 w-52 floating-element z-20"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/25 border border-blue-400/40 flex items-center justify-center">
                <Compass className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Best Recommendation</span>
                <span className="text-sm font-extrabold block text-white">Career Match 92%</span>
              </div>
            </motion.div>

            {/* FLOATING CARD 2: Skill Progress (Top Right) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute top-16 -right-10 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg w-48 floating-element-slow z-20"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">Target Focus</span>
                <span className="text-[10px] font-bold text-purple-300">Desired Track</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="text-[9px] text-slate-500 mt-1 block font-mono">Target Competency: 75%</span>
            </motion.div>

            {/* FLOATING CARD 3: Interview Score A+ (Far Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="absolute bottom-16 -right-6 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10 flex items-center gap-2 floating-element-fast z-20"
            >
              <div className="p-1 px-2.5 bg-emerald-500/20 rounded-xl text-emerald-300 font-extrabold text-sm border border-emerald-500/30">
                A+
              </div>
              <div>
                <span className="text-[9px] text-slate-400 tracking-wider block font-mono uppercase">Interactive Pitch</span>
                <span className="text-xs font-bold text-slate-200">Interview Score</span>
              </div>
            </motion.div>
          </div>
        </div>


      </div>

      {/* RIGHT COLUMN: Premium Frosted Glass Dashboard Core */}
      <div className="p-8 md:p-16 flex flex-col justify-between bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl m-4 md:m-8 text-white min-h-[500px] shadow-2xl relative overflow-hidden">
        {/* Top Header menu */}
        <div className="flex justify-end">
          <button 
            id="btn-skip-to-onboarding"
            onClick={onSkipToDashboard}
            className="text-xs font-semibold text-slate-350 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all cursor-pointer"
          >
            Skip Walkthrough →
          </button>
        </div>

        {/* Core Heading block */}
        <div className="max-w-md mx-auto my-auto flex flex-col justify-center py-8">
          <div className="flex items-center gap-2 mb-4 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>AI-Driven Workforce Mapping</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Your Dream Career Is <span className="text-purple-400 border-b-2 border-purple-500/30">Closer</span> Than You Think!
          </h2>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-8">
            Get personalized guidance, learn in-demand skills, practice realistic client mock interviews, and match direct job openings with CareerSphere AI.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <button 
              id="btn-get-started-onboarding"
              onClick={onStart}
              className="bg-gradient-to-r from-[#6342E8] to-blue-600 hover:opacity-95 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-purple-500/25 transition-all text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              Get Started →
            </button>
          </div>

          {/* Carousel Dynamic Subtitles / Indicators */}
          <div className="mt-12 pt-6 border-t border-white/10">
            <div className="h-6 overflow-hidden mb-3">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={currentDot}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-slate-300 font-medium block"
                >
                  {carouselPhrases[currentDot]}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Pagination dots (4 indicators) */}
            <div className="flex gap-2.5">
              {[0, 1, 2, 3].map((dot) => (
                <button
                  key={dot}
                  onClick={() => setCurrentDot(dot)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentDot === dot ? 'w-6 bg-purple-400' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Slide ${dot + 1}`}
                />
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
